/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-contrast': 'var(--color-primary-contrast)',
        accent: 'var(--color-accent)',
        'accent-contrast': 'var(--color-accent-contrast)',
        wood: 'var(--color-wood)',
        bg: 'var(--color-bg)',
        fg: 'var(--color-fg)',
        muted: 'var(--color-muted)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}
