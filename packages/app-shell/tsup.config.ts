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
 // Inline lucide-react to avoid Next.js vendor-chunk ENOENT at runtime.
 // (it's tiny tree-shakeable; inlining keeps a single resolution path)
 external: [
   'react',
   'react-dom',
   '@minisource/ui',
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
