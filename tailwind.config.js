import tailwind from '@tailwindcss/postcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        libria: {
          violet: '#1DB954',
          background: '#121212',
          surface: '#181818',
          elevated: '#282828',
          text: '#FFFFFF',
          secondary: '#B3B3B3',
          success: '#1DB954',
          warning: '#FBBF24',
          error: '#FB7185',
        }
      },
      fontFamily: {
        sans: ['Circular', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      }
    },
  },
  plugins: [],
};