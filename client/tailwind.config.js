/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          950: '#070A0F',
          900: '#0B0F17',
          850: '#101622',
          800: '#161E2E',
          700: '#232F46',
          600: '#334155',
          gold: '#D4AF37',
          'gold-light': '#F3E5AB',
          'gold-dark': '#AA820A',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        cinzel: ['"Cinzel"', 'serif']
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'glow-subtle': '0 0 40px -10px rgba(0, 0, 0, 0.7)',
        'card-hover': '0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(212, 175, 55, 0.2)'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    },
  },
  plugins: [],
}
