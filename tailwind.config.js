/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#30B53E',
          light: '#4FD95D',  // lighter shade
          dark: '#259030',   // darker shade
        },
        // Light mode colors
        light: {
          background: '#FFFFFF',
          surface: '#F8F9FA',
          text: {
            primary: '#1A1A1A',
            secondary: '#666666',
          },
          border: '#E5E7EB',
        },
        // Dark mode colors
        dark: {
          background: '#1A1A1A',
          surface: '#2D2D2D',
          text: {
            primary: '#FFFFFF',
            secondary: '#A3A3A3',
          },
          border: '#404040',
        }
      }
    },
  },
  plugins: [],
}