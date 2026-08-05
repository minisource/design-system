import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple CSS minification
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

const srcDir = join(__dirname, 'src');
const distDir = join(__dirname, 'dist');

mkdirSync(distDir, { recursive: true });

const css = readFileSync(join(srcDir, 'tokens.css'), 'utf8');
const minified = minifyCSS(css);
writeFileSync(join(distDir, 'tokens.min.css'), minified);

console.log('✓ tokens.min.css built');
