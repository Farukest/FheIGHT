/**
 * esbuild Bundler for FHEIGHT
 * Browserify yerine esbuild kullanarak ~100x daha hızlı build
 */

import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Watch mode context holder
let ctx = null;

// ==================== PLUGINS ====================

// Handlebars plugin - .hbs dosyalarını derler
const handlebarsPlugin = {
  name: 'handlebars',
  setup(build) {
    build.onLoad({ filter: /\.hbs$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, 'utf8');
      const template = Handlebars.precompile(source);
      return {
        contents: `
          var Handlebars = require('handlebars/runtime');
          module.exports = Handlebars.template(${template});
        `,
        loader: 'js',
      };
    });
  },
};

// GLSL plugin - .glsl dosyalarını string olarak yükler
const glslPlugin = {
  name: 'glsl',
  setup(build) {
    build.onLoad({ filter: /\.glsl$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, 'utf8');
      return {
        contents: `module.exports = ${JSON.stringify(source)};`,
        loader: 'js',
      };
    });
  },
};

// glslify() fonksiyon çağrılarını handle eden plugin
const glslifyPlugin = {
  name: 'glslify',
  setup(build) {
    build.onResolve({ filter: /^glslify$/ }, () => {
      return { path: 'glslify', namespace: 'glslify-shim' };
    });

    build.onLoad({ filter: /.*/, namespace: 'glslify-shim' }, () => {
      return {
        contents: `module.exports = function(path) { return path; };`,
        loader: 'js',
      };
    });
  },
};

// Node built-in polyfills for browser
const nodePolyfillPlugin = {
  name: 'node-polyfill',
  setup(build) {
    const nodeBuiltins = ['path', 'fs', 'os', 'crypto', 'stream', 'util', 'events', 'buffer', 'http', 'https', 'url', 'querystring', 'assert', 'net', 'tls', 'child_process', 'cluster', 'dgram', 'dns', 'domain', 'readline', 'repl', 'tty', 'v8', 'vm', 'zlib'];

    nodeBuiltins.forEach(mod => {
      build.onResolve({ filter: new RegExp(`^${mod}$`) }, () => {
        return { path: mod, namespace: 'node-polyfill' };
      });
    });

    build.onLoad({ filter: /.*/, namespace: 'node-polyfill' }, (args) => {
      if (args.path === 'path') {
        return {
          contents: `
            module.exports = {
              join: function() { return Array.prototype.slice.call(arguments).join('/'); },
              resolve: function() { return Array.prototype.slice.call(arguments).join('/'); },
              dirname: function(p) { return p.split('/').slice(0, -1).join('/'); },
              basename: function(p) { return p.split('/').pop(); },
              extname: function(p) { var m = p.match(/\\.[^.]+$/); return m ? m[0] : ''; },
              sep: '/', delimiter: ':'
            };
          `,
          loader: 'js'
        };
      }
      if (args.path === 'fs') {
        return {
          contents: `
            module.exports = {
              readFileSync: function() { throw new Error('fs not available in browser'); },
              writeFileSync: function() { throw new Error('fs not available in browser'); },
              existsSync: function() { return false; },
              readdirSync: function() { return []; }
            };
          `,
          loader: 'js'
        };
      }
      if (args.path === 'os') {
        return {
          contents: `
            module.exports = {
              platform: function() { return 'browser'; },
              arch: function() { return 'browser'; },
              homedir: function() { return '/'; },
              tmpdir: function() { return '/tmp'; },
              EOL: '\\n'
            };
          `,
          loader: 'js'
        };
      }
      return { contents: 'module.exports = {};', loader: 'js' };
    });
  }
};

// ==================== BUILD CONFIG ====================

function getBuildOptions(options = {}) {
  const isDev = options.dev !== false;
  const shouldMinify = options.minify === true;
  const shouldWatch = options.watch === true;

  // Environment variables
  const envDefines = {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
    'process.env.VERSION': `"${options.version || '1.0.0'}"`,
    'process.env.API_URL': `"${options.apiUrl || 'http://localhost:3000'}"`,
    'process.env.FIREBASE_URL': `"${options.firebaseUrl || 'https://zama-e9173-default-rtdb.firebaseio.com/'}"`,
    'process.env.ALL_CARDS_AVAILABLE': options.allCardsAvailable ? 'true' : 'false',
    'process.env.AI_TOOLS_ENABLED': options.aiToolsEnabled ? 'true' : 'false',
    'process.env.RECORD_CLIENT_LOGS': 'false',
    'process.env.INVITE_CODES_ACTIVE': 'false',
    'process.env.RECAPTCHA_ACTIVE': 'false',
    'process.env.BUGSNAG_WEB': '""',
    'process.env.BUGSNAG_DESKTOP': '""',
    'process.env.TRACKING_PIXELS_ENABLED': 'false',
    'process.env.LANDING_PAGE_URL': '"/"',
    'process.env.REFERRER_PAGE_URLS': '""',
    'process.env.SEPOLIA_RPC_URL': `"${options.sepoliaRpcUrl || process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/QSKgm3HkNCI9KzcjveL9a'}"`,
  };

  return {
    entryPoints: [path.join(projectRoot, 'app/index.js')],
    bundle: true,
    outfile: path.join(projectRoot, 'dist/src/fheight.js'),
    format: 'iife',
    platform: 'browser',
    target: ['es2015'],

    // Path alias
    alias: {
      'app': path.join(projectRoot, 'app'),
    },

    // Node path resolution
    nodePaths: [projectRoot],

    // Define environment variables
    define: envDefines,

    // Plugins
    plugins: [
      nodePolyfillPlugin,
      handlebarsPlugin,
      glslPlugin,
      glslifyPlugin,
    ],

    // Source maps
    sourcemap: isDev,

    // Minification
    minify: shouldMinify,

    // Log level
    logLevel: 'info',

    // Banner - polyfills for old Firebase navigator issue
    banner: {
      js: `// Polyfills for old Firebase
if (typeof navigator === 'undefined') { window.navigator = { userAgent: 'Mozilla/5.0' }; }
if (typeof global === 'undefined') { window.global = window; }
`,
    },
  };
}

// ==================== BUILD FUNCTIONS ====================

/**
 * Single build
 */
export async function build(options = {}) {
  const startTime = Date.now();
  console.log('[ESBUILD] Starting build...');

  try {
    const buildOptions = getBuildOptions(options);
    await esbuild.build(buildOptions);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`[ESBUILD] Build completed in ${duration}s`);

    // Bundle size
    const stats = fs.statSync(path.join(projectRoot, 'dist/src/fheight.js'));
    console.log(`[ESBUILD] Bundle size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    return true;
  } catch (error) {
    console.error('[ESBUILD] Build failed:', error.message);
    return false;
  }
}

/**
 * Watch mode with incremental builds
 */
export async function watch(options = {}) {
  console.log('[ESBUILD] Starting watch mode...');

  try {
    const buildOptions = getBuildOptions({ ...options, dev: true });

    ctx = await esbuild.context(buildOptions);
    await ctx.watch();

    console.log('[ESBUILD] Watching for changes...');

    // Initial build
    await ctx.rebuild();
    console.log('[ESBUILD] Initial build complete');

    return ctx;
  } catch (error) {
    console.error('[ESBUILD] Watch setup failed:', error.message);
    return null;
  }
}

/**
 * Manual rebuild (for watch mode)
 */
export async function rebuild() {
  if (!ctx) {
    console.error('[ESBUILD] No watch context. Call watch() first.');
    return false;
  }

  const startTime = Date.now();
  try {
    await ctx.rebuild();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[ESBUILD] Rebuild completed in ${duration}s`);
    return true;
  } catch (error) {
    console.error('[ESBUILD] Rebuild failed:', error.message);
    return false;
  }
}

/**
 * Stop watch mode
 */
export async function stop() {
  if (ctx) {
    await ctx.dispose();
    ctx = null;
    console.log('[ESBUILD] Watch mode stopped');
  }
}

// ==================== CLI ====================

// CLI kullanımı için
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const isWatch = args.includes('--watch') || args.includes('-w');
  const isMinify = args.includes('--minify') || args.includes('-m');

  if (isWatch) {
    watch({ minify: isMinify }).catch(console.error);
  } else {
    build({ minify: isMinify }).then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}

export default { build, watch, rebuild, stop };
