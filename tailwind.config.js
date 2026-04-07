/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fdf6ec',
        brown: {
          50: '#fdf6ec',
          100: '#f9e8cc',
          200: '#f2c97e',
          300: '#e8a645',
          400: '#d4872a',
          500: '#b86d1a',
          600: '#8f5213',
          700: '#6b3c0e',
          800: '#4a2a09',
          900: '#2e1a05',
        },
      },
    },
  },
  plugins: [],
}
