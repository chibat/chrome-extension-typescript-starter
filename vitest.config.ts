import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: 'src',
    include: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
  },
});
