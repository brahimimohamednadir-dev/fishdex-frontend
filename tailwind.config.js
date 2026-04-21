/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Fond chaud principal
        warm: {
          50:  '#FDFBF7',
          100: '#F5F0E8',
          200: '#EDE5D8',
          300: '#DDD3C4',
          400: '#C9BAA8',
          500: '#A8967F',
          600: '#8B7660',
          700: '#6B5A47',
          800: '#4A3F33',
          900: '#2C2520',
        },
        // Vert forêt — accent principal
        forest: {
          50:  '#EEF4F0',
          100: '#D4E8DA',
          200: '#A8D1B5',
          300: '#72B58D',
          400: '#4A9470',
          500: '#3D6B4F',
          600: '#2F5540',
          700: '#234030',
          800: '#1A3024',
          900: '#111F18',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
