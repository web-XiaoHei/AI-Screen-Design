import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      imports: [
        'vue',
        'pinia',
        {
          'pinia-plugin-persistedstate': ['createPersistedState'],
        },
        {
          from: '@/api/editor/panels/layer/layerPanel',
          imports: ['LayerPanelProps'],
          type: true,
        },
        {
          from: '@/api/editor/panels/material/material',
          imports: ['MaterialProps', 'GroupProps', 'MaterialSchema'],
          type: true,
        },
        {
          from: '@/schema/page',
          imports: ['CanvasSchema', 'PageSchema'],
          type: true,
        },
      ],
      resolvers: [ElementPlusResolver()],
      dirs: ['src/router/**', 'src/stores/**', 'src/plugins/**', 'src/api/**'],
      dts: 'types/auto-imports.d.ts',
    }),
    Components({
      dirs: [
        'src/components',
        'src/layouts',
        'src/views',
        'src/editor/**',
        'src/materials/**',
        'src/schema/**',
      ],
      dts: 'types/components.d.ts',
      resolvers: [ElementPlusResolver(), IconsResolver({ prefix: 'icon' })],
    }),
    tailwindcss(),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styless/function.scss" as *;`,
      },
    },
  },
})
