/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef8f0', 100: '#d6eedb', 500: '#2f9a47', 600: '#1b7a2f', 700: '#166226', 900: '#0d3b17' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
