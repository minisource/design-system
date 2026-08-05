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
 banner: {
   js: `"use client";`,
 },
  external: [
    'react',
    'react-dom',
    'next-themes',
    /^@radix-ui\/.*/,
    'sonner',
    'lucide-react',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    '@tanstack/react-table',
   ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  onSuccess() {
    mkdirSync(join(process.cwd(), 'dist'), { recursive: true });
    const css = readFileSync(join(process.cwd(), 'src', 'globals.css'), 'utf8');
    writeFileSync(join(process.cwd(), 'dist', 'styles.css'), css);
    console.log('✓ styles.css copied');
  },
});
