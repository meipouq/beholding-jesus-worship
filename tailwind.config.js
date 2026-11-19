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
          bg: '#101010',            // Primary background (Midnight Black)
          'bg-secondary': '#161616',// Secondary background
          card: '#1F1F21',          // Card background
          surface: '#262626',       // Elevated surfaces
          gold: '#D9A441',          // Primary accent (Champagne Gold)
          'gold-light': '#F5C15D',  // Gold highlight
          ivory: '#F5F0E6',         // Primary text (Warm Ivory)
          muted: '#AAA5A0',         // Secondary text
          border: '#35312B',        // Borders and dividers
          success: '#78B887',       // Success status
          error: '#E57373',         // Error status
        },
        worship: {
          dark: '#101010',
          sidebar: '#161616',
          'sidebar-active': '#1F1F21',
          'sidebar-hover': '#262626',
          card: '#1F1F21',
          bg: '#101010',
          'bg-muted': '#161616',
          border: '#35312B',
          'border-light': '#35312B',
          accent: '#D9A441',
          'accent-light': '#262626',
          category: '#1F1F21',
          'text-main': '#F5F0E6',
          'text-muted': '#AAA5A0',
          'text-light': '#AAA5A0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        cursive: ['"Dancing Script"', '"Caveat"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'modal': '0 20px 50px rgba(0, 0, 0, 0.7)',
        'gold': '0 0 15px rgba(217, 164, 65, 0.15)',
        'gold-lg': '0 0 25px rgba(217, 164, 65, 0.25)',
      }
    },
  },
  plugins: [],
}
