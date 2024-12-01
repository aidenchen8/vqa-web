import base from "./eslint/index.js";
import vue from "./eslint/vue.js";
import ts from "./eslint/typescript.js";

import babelParser from "@babel/eslint-parser";
import vueParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";

import eslintrcImport from "./packages/web/.eslintrc-auto-import.json" assert { type: "json" };

const tsParser = tseslint.parser;

export default [
  base,
  vue,
  ts,
  {
    ignores: ["**/node_modules", "**/dist", "**/assets/**", "**/*.json"],
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
            plugins: ["jsx", "importAssertions"],
          },
        },
      },
      ...eslintrcImport,
    },
    rules: {},
  },
];
