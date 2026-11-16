/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        worship: {
          dark: '#181716',
          sidebar: '#1E1D1B',
          'sidebar-active': '#2E2D2A',
          'sidebar-hover': '#262522',
          card: '#FFFFFF',
          bg: '#F8F5EE',
          'bg-muted': '#F2ECE1',
          border: '#E8E2D7',
          'border-light': '#F0EBE1',
          accent: '#A67C52',
          'accent-light': '#F4EFE6',
          category: '#EFE8DC',
          'text-main': '#1F1E1D',
          'text-muted': '#78716C',
          'text-light': '#A8A29E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        cursive: ['"Dancing Script"', '"Caveat"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(35, 25, 15, 0.04)',
        'card': '0 4px 16px rgba(35, 25, 15, 0.06)',
        'modal': '0 16px 40px rgba(25, 20, 15, 0.15)',
      }
    },
  },
  plugins: [],
}
