import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Configuração para produção
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Otimizações para produção
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          pdf: ['pdf-lib', 'pdfjs-dist'],
          ui: ['bootstrap']
        }
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      esmExternals: true,
    },
    // Otimizações de tamanho
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'axios',
      'pdfjs-dist/legacy/build/pdf.mjs',
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
    ],
    exclude: [
      '@vue/devtools-api',
      'pdfjs-dist/build/pdf',
      'pdfjs-dist/build/pdf.worker',
      'pdfjs-dist/legacy/build/pdf',
      'pdfjs-dist/legacy/build/pdf.worker',
    ],
    esbuildOptions: {
      keepNames: true,
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    },
  },
  // Configurações específicas para Vercel
  preview: {
    port: 3000,
    host: true
  }
})
