import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    roots: ['src'],
    include: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
  },
});
