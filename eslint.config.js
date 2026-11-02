import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  // never lint build output
  { ignores: ['dist'] },
  // core JS rules
  js.configs.recommended,
  // TypeScript parsing and compiler-independent rules
  ...tseslint.configs.recommended,
  // Rules of Hooks + exhaustive deps + React Compiler
  // diagnostics
  reactHooks.configs.flat['recommended-latest'],
  // accessibility mistakes in JSX
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      // forgot to await/handle a promise
      '@typescript-eslint/no-floating-promises': 'error',
      // `import type { X }`
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);