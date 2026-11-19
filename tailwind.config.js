/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#100E0B',            // Main background (Warm Midnight)
          'bg-secondary': '#181510',// Secondary background (Warm Charcoal)
          card: '#211C17',          // Primary card background (Warm Brown Charcoal)
          surface: '#29231C',       // Secondary card background / elevated surface
          gold: '#E5AF45',          // Champagne gold
          'gold-light': '#FFC85C',  // Bright gold highlights
          ivory: '#FFF5E6',         // Warm ivory text
          muted: '#B8ADA0',         // Secondary text
          border: '#393027',        // Borders and dividers
          success: '#79BB8B',       // Success green
          error: '#E57373',         // Error red
          blue: '#789BBE',          // Muted blue
          purple: '#A58BC4',        // Muted purple
        },
        worship: {
          dark: '#100E0B',
          sidebar: '#181510',
          'sidebar-active': '#211C17',
          'sidebar-hover': '#29231C',
          card: '#211C17',
          bg: '#100E0B',
          'bg-muted': '#181510',
          border: '#393027',
          'border-light': '#393027',
          accent: '#E5AF45',
          'accent-light': '#29231C',
          category: '#211C17',
          'text-main': '#FFF5E6',
          'text-muted': '#B8ADA0',
          'text-light': '#B8ADA0',
          blue: '#789BBE',
          purple: '#A58BC4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        cursive: ['"Dancing Script"', '"Caveat"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.45)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.55)',
        'modal': '0 20px 50px rgba(0, 0, 0, 0.8)',
        'gold': '0 0 15px rgba(229, 175, 69, 0.22)',
        'gold-lg': '0 0 25px rgba(229, 175, 69, 0.35)',
        'gold-sm': '0 0 8px rgba(229, 175, 69, 0.18)',
        'amber-glow': '0 0 18px rgba(229, 175, 69, 0.28)',
      }
    },
  },
  plugins: [],
}
