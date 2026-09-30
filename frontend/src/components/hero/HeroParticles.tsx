import { useEffect, useRef } from 'react';
import { startParticles } from './particles';

export default function HeroParticles({ text, imageUrl, onReady }: { text: string; imageUrl?: string | null; onReady?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const stop = startParticles(canvasRef.current, { text, imageUrl });
    onReady?.();
    return stop;
  }, [text, imageUrl, onReady]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full touch-pan-y" />;
}
