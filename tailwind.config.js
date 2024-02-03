/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './client/**/*.js',
    './client/**/*.jsx',
    './**/*.html'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      'darkGreen': '#333D2E',
      'darkGreenHover': '#434f3e',
      'parchment': '#F4F2E9',
      'parchmentDark': '#e2ddc7',
      'yellow': '#FFD666',
      'slate': '#232322',
      'brown': '#45301F'
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
