/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Minimal Black & White Theme
        'minimal-black': '#000000',
        'minimal-white': '#ffffff',
        'minimal-gray-900': '#0a0a0a',
        'minimal-gray-800': '#1a1a1a',
        'minimal-gray-700': '#2a2a2a',
        'minimal-gray-600': '#404040',
        'minimal-gray-500': '#666666',
        'minimal-gray-400': '#999999',
        'minimal-gray-300': '#cccccc',
        'minimal-gray-200': '#e6e6e6',
        'minimal-gray-100': '#f5f5f5',
        'minimal-gray-50': '#fafafa',
        
        // Legacy dark theme mapping for compatibility
        'dark-bg': '#000000',
        'dark-card': '#1a1a1a',
        'dark-border': '#404040',
        'dark-text': '#ffffff',
        'dark-text-secondary': '#999999',
        'dark-blue': '#ffffff',
        'dark-red': '#ffffff',
        'dark-green': '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-like': 'pulse 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'DEFAULT': '0',
        'none': '0',
        'sm': '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '0',
      },
    },
  },
  plugins: [],
}