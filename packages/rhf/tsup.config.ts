import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-hook-form',
    '@hookform/resolvers',
    '@hookform/resolvers/zod',
    'zod',
    '@minisource/ui',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
