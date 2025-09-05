/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 40%, 45%)',
        accent: 'hsl(130, 70%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        background: 'hsl(210, 30%, 95%)',
        text: 'hsl(210, 30%, 15%)',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      spacing: {
        'lg': '24px',
        'md': '16px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 40%, 20%, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
