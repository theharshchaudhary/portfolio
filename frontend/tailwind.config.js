/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        github: {
          canvas: '#ffffff',
          subtle: '#f6f8fa',
          inset: '#eff2f5',
          border: '#d0d7de',
          'border-muted': '#d8dee4',
          fg: '#1f2328',
          'fg-muted': '#656d76',
          'fg-subtle': '#6e7781',
          accent: '#0969da',
          'accent-emphasis': '#0969da',
          'success-fg': '#1a7f37',
          'success-emphasis': '#1f883d',
          'success-soft': '#1f883d',
          danger: '#cf222e',
          'done-fg': '#8250df',
          attention: '#9a6700',
          'attention-subtle': '#fff8c5',
        },
        contribution: {
          0: '#ebedf0',
          1: '#9be9a8',
          2: '#40c463',
          3: '#30a14e',
          4: '#216e39',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        xxs: ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'github-sm': '0 1px 0 rgba(31,35,40,0.04)',
        'github-md': '0 3px 6px rgba(140,149,159,0.15)',
        'github-lg': '0 8px 24px rgba(140,149,159,0.2)',
      },
      maxWidth: {
        'github': '1280px',
      },
    },
  },
  plugins: [],
};
