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
        'yellow-400': '#FBBF24',
        'yellow-500': '#F59E0B',
        'yellow-600': '#D97706',
      },
      fontFamily: {
        'spoqa': ['Spoqa Han Sans Neo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
