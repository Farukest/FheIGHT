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
              arch: function() { return 'x64'; },
              homedir: function() { return '/'; },
              tmpdir: function() { return '/tmp'; },
              endianness: function() { return 'LE'; },
              hostname: function() { return 'localhost'; },
              type: function() { return 'Browser'; },
              release: function() { return '1.0.0'; },
              cpus: function() { return []; },
              totalmem: function() { return 0; },
              freemem: function() { return 0; },
              uptime: function() { return 0; },
              loadavg: function() { return [0, 0, 0]; },
              networkInterfaces: function() { return {}; },
              EOL: '\\n'
            };
          `,
          loader: 'js'
        };
      }
      if (args.path === 'events') {
        return {
          contents: `
            function EventEmitter() {
              this._events = {};
              this._maxListeners = 10;
            }
            EventEmitter.prototype.on = function(type, listener) {
              if (!this._events[type]) this._events[type] = [];
              this._events[type].push(listener);
              return this;
            };
            EventEmitter.prototype.addListener = EventEmitter.prototype.on;
            EventEmitter.prototype.once = function(type, listener) {
              var self = this;
              function g() {
                self.removeListener(type, g);
                listener.apply(this, arguments);
              }
              g.listener = listener;
              this.on(type, g);
              return this;
            };
            EventEmitter.prototype.off = function(type, listener) {
              if (!this._events[type]) return this;
              var list = this._events[type];
              var idx = list.indexOf(listener);
              if (idx === -1) {
                for (var i = 0; i < list.length; i++) {
                  if (list[i].listener === listener) { idx = i; break; }
                }
              }
              if (idx !== -1) list.splice(idx, 1);
              if (list.length === 0) delete this._events[type];
              return this;
            };
            EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
            EventEmitter.prototype.removeAllListeners = function(type) {
              if (type) delete this._events[type];
              else this._events = {};
              return this;
            };
            EventEmitter.prototype.emit = function(type) {
              if (!this._events[type]) return false;
              var args = Array.prototype.slice.call(arguments, 1);
              var listeners = this._events[type].slice();
              for (var i = 0; i < listeners.length; i++) {
                listeners[i].apply(this, args);
              }
              return true;
            };
            EventEmitter.prototype.listeners = function(type) {
              return this._events[type] ? this._events[type].slice() : [];
            };
            EventEmitter.prototype.listenerCount = function(type) {
              return this._events[type] ? this._events[type].length : 0;
            };
            EventEmitter.prototype.setMaxListeners = function(n) {
              this._maxListeners = n;
              return this;
            };
            EventEmitter.prototype.getMaxListeners = function() {
              return this._maxListeners;
            };
            EventEmitter.prototype.eventNames = function() {
              return Object.keys(this._events);
            };
            EventEmitter.prototype.prependListener = function(type, listener) {
              if (!this._events[type]) this._events[type] = [];
              this._events[type].unshift(listener);
              return this;
            };
            EventEmitter.prototype.prependOnceListener = function(type, listener) {
              var self = this;
              function g() {
                self.removeListener(type, g);
                listener.apply(this, arguments);
              }
              g.listener = listener;
              this.prependListener(type, g);
              return this;
            };
            EventEmitter.listenerCount = function(emitter, type) {
              return emitter.listenerCount(type);
            };
            EventEmitter.EventEmitter = EventEmitter;
            module.exports = EventEmitter;
            module.exports.EventEmitter = EventEmitter;
          `,
          loader: 'js'
        };
      }
      if (args.path === 'url') {
        return {
          contents: `
            module.exports = {
              parse: function(urlStr) {
                try {
                  var u = new URL(urlStr, 'http://localhost');
                  return {
                    protocol: u.protocol,
                    slashes: u.protocol.endsWith(':'),
                    auth: u.username ? (u.password ? u.username + ':' + u.password : u.username) : null,
                    host: u.host,
                    port: u.port || null,
                    hostname: u.hostname,
                    hash: u.hash || null,
                    search: u.search || null,
                    query: u.search ? u.search.slice(1) : null,
                    pathname: u.pathname,
                    path: u.pathname + (u.search || ''),
                    href: u.href
                  };
                } catch(e) {
                  return { pathname: urlStr, path: urlStr, href: urlStr };
                }
              },
              format: function(obj) {
                var auth = obj.auth ? obj.auth + '@' : '';
                var protocol = obj.protocol || '';
                var host = obj.host || (obj.hostname || '') + (obj.port ? ':' + obj.port : '');
                var pathname = obj.pathname || '/';
                var search = obj.search || (obj.query ? '?' + obj.query : '');
                var hash = obj.hash || '';
                return protocol + '//' + auth + host + pathname + search + hash;
              },
              resolve: function(from, to) {
                try { return new URL(to, from).href; } catch(e) { return to; }
              },
              URL: typeof URL !== 'undefined' ? URL : function() {},
              URLSearchParams: typeof URLSearchParams !== 'undefined' ? URLSearchParams : function() {}
            };
          `,
          loader: 'js'
        };
      }
      if (args.path === 'util') {
        return {
          contents: `
            module.exports = {
              inherits: function(ctor, superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                  constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
                });
              },
              isArray: Array.isArray,
              isFunction: function(arg) { return typeof arg === 'function'; },
              isString: function(arg) { return typeof arg === 'string'; },
              isNumber: function(arg) { return typeof arg === 'number'; },
              isObject: function(arg) { return typeof arg === 'object' && arg !== null; },
              isUndefined: function(arg) { return arg === void 0; },
              isNull: function(arg) { return arg === null; },
              isNullOrUndefined: function(arg) { return arg == null; },
              isBoolean: function(arg) { return typeof arg === 'boolean'; },
              isPrimitive: function(arg) { return arg === null || typeof arg !== 'object' && typeof arg !== 'function'; },
              isBuffer: function(arg) { return false; },
              deprecate: function(fn, msg) { return fn; },
              debuglog: function() { return function() {}; },
              format: function() { return Array.prototype.slice.call(arguments).join(' '); }
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

    // Banner - polyfills for browser compatibility
    banner: {
      js: `// Browser polyfills
if (typeof navigator === 'undefined') { window.navigator = { userAgent: 'Mozilla/5.0' }; }
if (typeof global === 'undefined') { window.global = window; }
if (typeof process === 'undefined') {
  window.process = {
    env: {},
    argv: [],
    version: '',
    platform: 'browser',
    browser: true,
    stdout: { isTTY: false, write: function() {} },
    stderr: { isTTY: false, write: function() {} },
    stdin: { isTTY: false },
    cwd: function() { return '/'; },
    nextTick: function(fn) { setTimeout(fn, 0); },
    on: function() { return this; },
    once: function() { return this; },
    off: function() { return this; },
    emit: function() { return this; },
    removeListener: function() { return this; },
    listeners: function() { return []; }
  };
}
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
