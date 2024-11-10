import base from './eslint/index.js'
import vue from './eslint/vue.js'
import ts from './eslint/typescript.js'

import babelParser from '@babel/eslint-parser'
import vueParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";

const tsParser = tseslint.parser

export default [
  base,
  vue,
  ts,
  {
    ignores: ['**/node_modules', '**/dist', 'src/assets/**', '**/*.json'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: {
          js: babelParser,
          jsx: babelParser,

          ts: tsParser,
          tsx: tsParser,
        },
        babelOptions: {
          parserOpts: {
            plugins: ['jsx'], 
          },
        },
      },
    },
    rules: {},
  },
];