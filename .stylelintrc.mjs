/** @type {import('stylelint').Config} */
export default {
  extends: ['./eslint/stylelint.js'],
  customSyntax: 'postcss-html',
  overrides: [
    {
      files: ['**/*.{css,scss}'], 
      customSyntax: 'postcss-scss',
    },
  ],
};