import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  {
    rules: {
      // R3F leans on untyped three.js props in JSX; the strict rule fights it
      // without catching real bugs in scene code.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
