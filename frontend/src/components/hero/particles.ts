// Interactive particle text/avatar on a 2D canvas. No dependencies (~3 KB gzipped).
// Particles spring toward points sampled from text or an image, scatter away from the pointer,
// explode on click, and the loop sleeps once everything has settled so idle cost is zero.

export interface ParticleOptions {
  text: string;
  /** When set, particles form this image instead (falls back to text if it can't be read). */
  imageUrl?: string | null;
  colors?: string[];
  /** Font stack; should match the page so the static fallback and the particles line up. */
  fontFamily?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  color: number;
}

const DEFAULT_COLORS = ['#0969da', '#218bff', '#8250df', '#bf3989', '#1f883d', '#2da44e'];
const SPRING = 0.055;
const FRICTION = 0.82;
const MOUSE_RADIUS = 70;
const MOUSE_FORCE = 5;
const MAX_PARTICLES = 2600;
const SETTLE_EPSILON = 0.05;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Samples opaque pixels of what `draw` paints into target points, with an optional per-point color. */
function sample(
  width: number,
  height: number,
  gap: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): { x: number; y: number; rgb?: [number, number, number] }[] {
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const ctx = off.getContext('2d', { willReadFrequently: true })!;
  draw(ctx);
  const { data } = ctx.getImageData(0, 0, width, height); // throws if the image is cross-origin tainted
  const points: { x: number; y: number; rgb: [number, number, number] }[] = [];
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 128) points.push({ x, y, rgb: [data[i], data[i + 1], data[i + 2]] });
    }
  }
  return points;
}

export function startParticles(canvas: HTMLCanvasElement, options: ParticleOptions): () => void {
  const ctx = canvas.getContext('2d')!;
  const colors = options.colors ?? DEFAULT_COLORS;
  const fontFamily = options.fontFamily ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  let palette: string[] = colors;
  let frame = 0;
  let running = false;
  let visible = true;
  let pointer: { x: number; y: number } | null = null;
  let stopped = false;

  const textPoints = (gap: number) => {
    const fontSize = Math.min(height * 0.62, (width * 0.92) / Math.max(options.text.length * 0.56, 1));
    return sample(width, height, gap, (c) => {
      c.fillStyle = '#000';
      c.font = `800 ${fontSize}px ${fontFamily}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(options.text, width / 2, height / 2 + fontSize * 0.04);
    }).map(({ x, y }) => ({ x, y }));
  };

  async function buildTargets() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gap = width < 500 ? 4 : 3;
    let points: { x: number; y: number; rgb?: [number, number, number] }[] = [];

    if (options.imageUrl) {
      try {
        const img = await loadImage(options.imageUrl);
        const size = Math.min(height * 0.92, width);
        points = sample(width, height, gap, (c) => {
          c.save();
          c.beginPath();
          c.arc(width / 2, height / 2, size / 2, 0, Math.PI * 2);
          c.clip();
          c.drawImage(img, width / 2 - size / 2, height / 2 - size / 2, size, size);
          c.restore();
        });
      } catch {
        points = [];
      }
    }
    if (!points.length) points = textPoints(gap);

    // Thin out evenly if there are too many points.
    if (points.length > MAX_PARTICLES) {
      const step = points.length / MAX_PARTICLES;
      points = Array.from({ length: MAX_PARTICLES }, (_, i) => points[Math.floor(i * step)]);
    }

    // Image mode: quantise sampled colors into a small palette so drawing batches stay cheap.
    const usesImageColors = points.some((p) => p.rgb);
    const paletteIndex = new Map<string, number>();
    palette = usesImageColors ? [] : colors;

    const previous = particles;
    particles = points.map((p, i) => {
      let color: number;
      if (usesImageColors && p.rgb) {
        const key = p.rgb.map((v) => Math.round(v / 32) * 32).join(',');
        if (!paletteIndex.has(key)) {
          paletteIndex.set(key, palette.length);
          palette.push(`rgb(${key})`);
        }
        color = paletteIndex.get(key)!;
      } else {
        color = Math.min(colors.length - 1, Math.floor((p.x / width) * colors.length));
      }
      const old = previous[i];
      return {
        x: old ? old.x : Math.random() * width,
        y: old ? old.y : Math.random() * height,
        vx: old ? old.vx : (Math.random() - 0.5) * 8,
        vy: old ? old.vy : (Math.random() - 0.5) * 8,
        tx: p.x,
        ty: p.y,
        color,
      };
    });
    wake();
  }

  function step(): boolean {
    let moving = false;
    const r2 = MOUSE_RADIUS * MOUSE_RADIUS;
    for (const p of particles) {
      p.vx += (p.tx - p.x) * SPRING;
      p.vy += (p.ty - p.y) * SPRING;
      if (pointer) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const force = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;
      if (!moving && (Math.abs(p.vx) > SETTLE_EPSILON || Math.abs(p.vy) > SETTLE_EPSILON || Math.abs(p.tx - p.x) > 0.5 || Math.abs(p.ty - p.y) > 0.5)) {
        moving = true;
      }
    }
    return moving;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const size = width < 500 ? 2.4 : 2.2;
    // One fillStyle change per color bucket instead of per particle.
    for (let c = 0; c < palette.length; c++) {
      ctx.fillStyle = palette[c];
      ctx.beginPath();
      for (const p of particles) if (p.color === c) ctx.rect(p.x, p.y, size, size);
      ctx.fill();
    }
  }

  function loop() {
    if (stopped) return;
    const moving = step();
    draw();
    if ((moving || pointer) && visible && !document.hidden) {
      frame = requestAnimationFrame(loop);
    } else {
      running = false;
    }
  }

  function wake() {
    if (!running && visible && !document.hidden && !stopped) {
      running = true;
      frame = requestAnimationFrame(loop);
    }
  }

  const toLocal = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onMove = (e: PointerEvent) => {
    pointer = toLocal(e);
    wake();
  };
  const onLeave = () => {
    pointer = null;
    wake();
  };
  const onClick = (e: PointerEvent) => {
    const origin = toLocal(e);
    for (const p of particles) {
      const angle = Math.atan2(p.y - origin.y, p.x - origin.x) + (Math.random() - 0.5);
      const speed = 8 + Math.random() * 14;
      p.vx += Math.cos(angle) * speed;
      p.vy += Math.sin(angle) * speed;
    }
    wake();
  };
  const onVisibility = () => wake();

  let resizeTimer = 0;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => void buildTargets(), 150);
  });
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onClick);
  document.addEventListener('visibilitychange', onVisibility);
  resizeObserver.observe(canvas);
  intersectionObserver.observe(canvas);
  void buildTargets();

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    clearTimeout(resizeTimer);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('pointerdown', onClick);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
