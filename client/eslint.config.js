import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
  files: ['**/*.{js,jsx}'],
  extends: [
  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  ],
  languageOptions: {
  ecmaVersion: 2020,
  globals: globals.browser,
  parserOptions: {
  ecmaVersion: 'latest',
  ecmaFeatures: { jsx: true },
  sourceType: 'module',
  },
  },
  rules: {
  // `^[A-Z_]` covers React components and unused-underscore placeholders.
  // `argsIgnorePattern` is needed as well because destructured props are
  // reported as arguments, not as variables.
  'no-unused-vars': [
  'error',
  {
  varsIgnorePattern: '^[A-Z_]',
  argsIgnorePattern: '^[A-Z_]',
  caughtErrors: 'none',
  ignoreRestSiblings: true,
  },
  ],
  },
  },
])