import ComponentScreenEditor from '@/editor/ComponentScreenEditor.vue'
import Preview from '@/pages/preview/PreView.vue'
import Screen from '@/pages/screen/Screen.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/editor',
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => ComponentScreenEditor,
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => Preview,
    },
    {
      path: '/screen',
      name: 'screen',
      component: () => Screen,
    },
  ],
})

export default router
