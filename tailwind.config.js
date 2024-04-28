/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        tint: '#121212',
        input: '#2a2a2a',
        highlight: '#1a1a1a',
        buttonSubtle: '##b3b3b3',
        button: '#ffffff',
        textSubtle: '#b3b3b3',
        text: '#ffffff',
        green: '#1ed45e',
      },
      fontFamily: {
        regular: ['Regular'],
        bold: ['Bold'],
        titleBold: ['TitleBold'],
        titleBlack: ['TitleBlack'],
      }
    },
  },
  plugins: [],
}

