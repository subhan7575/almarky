import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';

const outdir = 'dist';

const define = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
};

const envVars = [
  'API_KEY',
  'GITHUB_TOKEN',
  'GITHUB_REPO',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_UPLOAD_PRESET',
  'GOOGLE_SCRIPT_URL',
  'FIREBASE_API_KEY',
  'ADMIN_PASSWORD',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

for (const v of envVars) {
    define[`process.env.${v}`] = JSON.stringify(process.env[v] || '');
}

async function build() {
  console.log('Starting Almarky production build...');
  
  await fs.rm(outdir, { recursive: true, force: true });
  await fs.mkdir(outdir, { recursive: true });

  console.log('Bundling application with esbuild...');
  await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: path.join(outdir, 'index.js'),
    format: 'esm',
    jsx: 'automatic',
    loader: { 
      '.tsx': 'tsx',
      '.ts': 'ts' 
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
    tsconfig: 'tsconfig.json',
    minify: true,
    sourcemap: true,
    target: 'es2020',
    define,
    mainFields: ['module', 'main'],
    platform: 'browser',
  });
  
  let html = await fs.readFile('index.html', 'utf-8');
  html = html.replace(/src="index\.tsx"/g, 'src="index.js"');
  html = html.replace(/src="\/index\.tsx"/g, 'src="index.js"');
  
  await fs.writeFile(path.join(outdir, 'index.html'), html);
  console.log('Build finished successfully!');
}

build().catch((e) => {
  console.error('Build failed:', e);
  process.exit(1);
});
