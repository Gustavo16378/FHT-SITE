/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#070D1E',
        federation: '#1A3A8F',
        'blue-mid': '#1E4DB7',
        gold: '#F5C518',
        'gold-light': '#FFD94A',
        'fht-white': '#F8F9FC',
        'gray-soft': '#8A9BB5',
        'section-alt': '#0D1B4F',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['Barlow', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease forwards',
        fadeIn: 'fadeIn 0.5s ease forwards',
      },
    },
  },
  plugins: [],
}

