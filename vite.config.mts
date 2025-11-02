import { resolve } from 'path';
import Tov from './presets/tov';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      }
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      // 添加你常用的依赖
    ],
    exclude: [
      // 排除不需要预构建的
      'vue-pdf-embed',
      'pdfjs-dist'
    ]
  },
  build: {
    minify: 'esbuild',
    cssTarget: ['chrome49'],
    reportCompressedSize: false,
    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型依赖单独打包
          // Vue 核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          
          // Element Plus UI 库
          'element-plus': ['element-plus'],
          
          // 工具库
          'utils': [
            'dayjs', 
            'axios',
            'file-saver',
            'md5',
            'sortablejs',
            'minimatch',
            'async-validator',
            '@vueuse/integrations',
            '@soerenmartius/vue3-clipboard',
            'ua-browser',
            'beautify-qrcode',
            'detect-file-encoding-and-language',
            'iconv-lite',
            'path-browserify',
          ],
          
          // pdf
          'pdf-viewer': ['vue-pdf-embed'],
          
          // 媒体播放器
          'media': ['aplayer', 'lazysizes'],
          
          // 视频播放器
          'video-player': ['artplayer', 'artplayer-plugin-danmuku', 'hls.js', 'mpegts.js'],
          
          // UI 组件库
          'ui-libs': [
            '@headlessui/vue',
            '@heroicons/vue',
            'v-contextmenu',
            'v3-img-preview-enhance',
          ],
          
          
          // CodeMirror 编辑器
          'codemirror-core': [
            'codemirror',
            'vue-codemirror',
            '@codemirror/commands',
            // '@codemirror/legacy-modes',
            '@codemirror/language',
            '@codemirror/state',
            '@codemirror/theme-one-dark',
            '@codemirror/view',
          ],
          'codemirror-langs': [
            '@codemirror/lang-cpp',
            '@codemirror/lang-css',
            '@codemirror/lang-html',
            '@codemirror/lang-java',
            '@codemirror/lang-javascript',
            '@codemirror/lang-json',
            '@codemirror/lang-markdown',
            '@codemirror/lang-php',
            '@codemirror/lang-python',
            '@codemirror/lang-rust',
            '@codemirror/lang-sql',
            '@codemirror/lang-xml',
          ],
          
          // 3D 预览
          'three-viewer': ['vue-3d-loader'],
          
          // Markdown 相关
          'markdown': [
            '@kangc/v-md-editor',
            'marked',
            'github-markdown-css',
            'highlight.js',
          ]
          
          
        }
      }
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 静态资源内联限制
    assetsInlineLimit: 4096,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 500,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  define: {
    'process.env': {},
  },
  server: {
    host: '0.0.0.0',
    port: 8081,
    allowedHosts: ['hbcaodog--zfile-dev-f-vue.modal.run'],
  },
  plugins: [Tov()],
});
