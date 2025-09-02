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
        'text-800':'#7B7B7B',
        'text-600':'#9A9A9A',
        'text-300':'#D5D5D5',
        'text-100':'#F5F5F5',
        brand: {
          'bg':'#FBFBF7',
          'sub': '#FFF6D1',
          'main':'#FFD044',
          'yellow-dark':'#DBA913',
          'icon':'#333333',
          'point':'#F36C5E',
          'point-dark':'#E17364',
          'point-300':'#F5C0AC',
          'point-bg':'#F5BFAB',
        },
      },
      fontFamily: {
        'spoqa': ['Spoqa Han Sans Neo', 'sans-serif'],
      },
      fontSize:{
        '12-b': ['12px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '800' }],
        '20-m': ['20px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '700' }],
        '16-m': ['16px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '700' }],
        '14-m': ['14px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '700' }],
        '12-m': ['12px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '700' }],
        '14-r': ['14px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '500' }],
        '12-r': ['12px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '500' }],
        '9-r': ['9px', { lineHeight: '1', 'letterSpacing': '-0.41px', fontWeight: '500' }],

      }
    },
  },
  plugins: [],
}
