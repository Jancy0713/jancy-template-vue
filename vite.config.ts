import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true, // 启用局域网访问
    port: process.env.PORT ? parseInt(process.env.PORT) : 5170, // 默认使用 6174 端口
    strictPort: true, // 如果端口被占用，不要自动尝试下一个端口
    open: false, // 不自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://192.168.50.79:3000',
        changeOrigin: true,
      },
    },
  },
})
