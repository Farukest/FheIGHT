/**
 * FHEIGHT Fast Dev Server
 * esbuild ile hızlı JS rebuild (~1-2 saniye)
 */

import { spawn, exec } from 'child_process';
import chokidar from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIREBASE_URL = 'https://zama-e9173-default-rtdb.firebaseio.com/';

console.log('🚀 Starting FHEIGHT Fast Dev Server (esbuild)...\n');

// Import esbuild bundler
const esbuildBundler = await import('./gulp/esbuild-bundler.mjs');

// Track if build is running
let cssBuilding = false;
let jsBuilding = false;
let esbuildCtx = null;

// Run gulp CSS task
function runGulpCss(callback) {
  const env = { ...process.env, FIREBASE_URL };
  const cmd = 'npx gulp css';

  console.log('⚡ Running: gulp css');
  const start = Date.now();

  exec(cmd, { env }, (error, stdout, stderr) => {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    if (error) {
      console.error(`❌ CSS build failed (${duration}s)`);
    } else {
      console.log(`✅ CSS done (${duration}s)`);
    }
    callback && callback(error);
  });
}

// Run esbuild for JS
async function runEsbuild() {
  const start = Date.now();
  console.log('⚡ Running: esbuild...');

  try {
    if (esbuildCtx) {
      // Incremental rebuild (çok hızlı)
      await esbuildCtx.rebuild();
    } else {
      // İlk build
      await esbuildBundler.build({
        dev: true,
        firebaseUrl: FIREBASE_URL,
        allCardsAvailable: true,
      });
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ JS done (${duration}s)`);
    return true;
  } catch (error) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`❌ JS build failed (${duration}s):`, error.message);
    return false;
  }
}

// Watch SCSS files
console.log('👀 Watching SCSS files...');
const scssWatcher = chokidar.watch('app/ui/styles/**/*.scss', {
  ignoreInitial: true,
  cwd: __dirname,
});

scssWatcher.on('change', (filePath) => {
  if (cssBuilding) return;
  cssBuilding = true;
  console.log(`\n📝 SCSS changed: ${path.basename(filePath)}`);
  runGulpCss(() => { cssBuilding = false; });
});

// Watch JS and template files
console.log('👀 Watching JS/Template files...');
const jsWatcher = chokidar.watch([
  'app/**/*.js',
  'app/**/*.hbs',
  'app/**/*.glsl',
], {
  ignoreInitial: true,
  ignored: [/node_modules/, /dist/],
  cwd: __dirname,
});

jsWatcher.on('change', async (filePath) => {
  if (jsBuilding) return;
  jsBuilding = true;
  console.log(`\n📝 Changed: ${path.basename(filePath)}`);
  await runEsbuild();
  jsBuilding = false;
});

// Initial JS build
console.log('\n🔨 Initial JS build...');
await runEsbuild();

// Start Vite dev server
console.log('\n🌐 Starting Vite dev server...');
const vite = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

vite.on('error', (err) => {
  console.error('Vite error:', err);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  scssWatcher.close();
  jsWatcher.close();
  await esbuildBundler.stop();
  vite.kill();
  process.exit();
});

console.log('\n✨ Fast Dev Server ready!\n');
console.log('📌 Build Times (esbuild):');
console.log('   - SCSS changes: ~1 second (gulp)');
console.log('   - JS/Template changes: ~1-2 seconds (esbuild)');
console.log('   - Browser: http://localhost:3001\n');
