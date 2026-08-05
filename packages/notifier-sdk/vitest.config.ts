import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@minisource/api-core': resolve(__dirname, '../api-core/src/index.ts'),
    },
  },
});
