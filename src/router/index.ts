import ComponentScreenEditor from '@/editor/ComponentScreenEditor.vue'
import Preview from '@/pages/preview/PreView.vue'
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
  ],
})

export default router
