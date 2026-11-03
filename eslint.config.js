import tseslint from 'typescript-eslint';
export default [
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
    rules: { 'no-debugger': 'error', 'no-duplicate-case': 'error', 'no-unreachable': 'error' },
  },
];
