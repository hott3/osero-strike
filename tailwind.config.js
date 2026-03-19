/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'stone-flip': 'stone-flip 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pass-blink': 'pass-blink 1s ease-in-out infinite',
      },
      keyframes: {
        'stone-flip': {
          '0%': { transform: 'scale(1) rotateY(0deg)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2) rotateY(90deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotateY(180deg)', opacity: '1' },
        },
        'pass-blink': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}
