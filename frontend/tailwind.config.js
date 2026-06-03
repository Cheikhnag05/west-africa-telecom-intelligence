/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark:   { 900: '#060D1A', 800: '#0D1B2A', 700: '#132233', 600: '#1A2E42', 500: '#224060' },
        orange: { DEFAULT: '#F97316', light: '#FB923C', dark: '#EA580C' },
        gold:   { DEFAULT: '#F59E0B', light: '#FCD34D' },
        green:  { DEFAULT: '#10B981', light: '#34D399' },
        red:    { DEFAULT: '#EF4444', light: '#F87171' },
        sn:     '#00853F', /* vert Sénégal */
        ci:     '#FF6600', /* orange Côte d'Ivoire */
        ml:     '#009A00', /* vert Mali */
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
