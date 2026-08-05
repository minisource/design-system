import { defineConfig } from 'tsup';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

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
    '@minisource/ui',
    '@minisource/tokens',
    '@radix-ui/react-slot',
    '@radix-ui/react-label',
    '@radix-ui/react-separator',
    '@radix-ui/react-tabs',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  onSuccess() {
    mkdirSync(join(process.cwd(), 'dist'), { recursive: true });
    const css = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');
    writeFileSync(join(process.cwd(), 'dist', 'styles.css'), css);
    console.log('✓ styles.css copied');
  },
});
