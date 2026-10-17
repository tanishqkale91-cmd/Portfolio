/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--text)',
        surface: 'var(--surface)',
        accent: 'var(--accent)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        // Heavy Satoshi for the wordmark, headings and key letters.
        display: ['Satoshi', 'Manrope', 'system-ui', 'sans-serif'],
        sans: ['Manrope Variable', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
        // Editorial serif for italic emphasis and the marquee.
        serif: ['Fraunces Variable', 'Georgia', 'Times New Roman', 'serif'],
      },
      maxWidth: {
        // Main design reference width is 1440px.
        site: '1440px',
      },
      spacing: {
        // Horizontal page padding: 48px desktop / 32px tablet / 20-24px mobile.
        gutter: 'clamp(20px, 3.35vw, 48px)',
      },
    },
  },
  plugins: [],
};
