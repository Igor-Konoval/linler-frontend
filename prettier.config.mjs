/** @type {{plugins: [string], tabWidth: number, singleQuote: boolean, printWidth: number, useTabs: boolean, endOfLine: string}} */
const config = {
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-packagejson'],
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  singleQuote: true,
  endOfLine: 'lf',
};

export default config;
