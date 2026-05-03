/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0f1117',
          secondary: '#161b27',
          tertiary: '#1e2535',
          quaternary: '#252d3d',
        },
        border: {
          DEFAULT: '#2a3347',
          strong: '#334060',
        },
        accent: {
          DEFAULT: '#4f8ef7',
          dark: '#3d72d4',
          bg: 'rgba(79,142,247,0.12)',
        },
      },
    },
  },
  plugins: [],
}
