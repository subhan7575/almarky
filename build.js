import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';

const outdir = 'dist';

async function build() {
  console.log('Starting Almarky production build...');
  
  // 1. Clean and create output directory
  await fs.rm(outdir, { recursive: true, force: true });
  await fs.mkdir(outdir, { recursive: true });
  console.log(`Output directory '${outdir}' created.`);

  // 2. Bundle TypeScript/TSX to a single minified JS file
  console.log('Bundling application with esbuild...');
  await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: path.join(outdir, 'index.js'),
    jsx: 'automatic',
    loader: { '.tsx': 'tsx' },
    minify: true,
    sourcemap: true,
    target: 'es2020',
  });
  console.log('JavaScript bundling complete.');

  // 3. Copy index.html and update the script tag
  console.log('Processing index.html for production...');
  let html = await fs.readFile('index.html', 'utf-8');
  html = html.replace('src="index.tsx"', 'src="index.js"');
  await fs.writeFile(path.join(outdir, 'index.html'), html);
  console.log('index.html processed.');
  
  console.log('Build finished successfully! Ready for deployment.');
}

build().catch((e) => {
  console.error('Build failed:', e);
  process.exit(1);
});
