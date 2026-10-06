import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginAstro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

// Formatting is enforced by Prettier (`prettier --check`), which also runs
// here as an ESLint rule for linted files. ESLint covers plain JS configs and
// Astro components; markdown content is checked by Prettier only.
export default defineConfig([
  globalIgnores(['node_modules/**', 'dist/**', '.astro/**', 'pnpm-lock.yaml']),

  {
    files: ['**/*.{js,cjs,mjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'group', 'groupEnd'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-expressions': 'error',
    },
  },

  {
    files: ['**/*.astro'],
    extends: [eslintPluginAstro.configs.recommended],
  },

  // Run Prettier as an ESLint rule (and disable conflicting formatting rules).
  eslintPluginPrettierRecommended,
]);
