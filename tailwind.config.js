/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: {
          '0%':   { transform: 'scale(0.6)', opacity: '0' },
          '70%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pop:      'pop 0.25s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
