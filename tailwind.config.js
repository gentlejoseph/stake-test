/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './src/**/*.page.{html,ts}', './src/**/*.component.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Only colors actually used in the app
        primary: {
          500: '#3b82f6',
          700: '#1d4ed8',
        },
        success: {
          500: '#22c55e',
        },
        danger: {
          500: '#ef4444',
        },
        'figma-green': '#22b692',
        'custom-black': '#141414',
        'border-light': '#E3E3E3',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '3.5': '0.875rem', // 14px
        '4.5': '1.125rem', // 18px
        '2.5': '0.625rem', // 10px
      },
      borderRadius: {
        '20': '20px',
        '40': '40px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  important: false,
};
