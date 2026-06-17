import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import ProjectDetail from '@/pages/ProjectDetail.vue'
import ProjectSites from '@/pages/ProjectSites.vue'
import ProjectPhotos from '@/pages/ProjectPhotos.vue'
import ProjectPPT from '@/pages/ProjectPPT.vue'
import ProjectImport from '@/pages/ProjectImport.vue'
import RulesSettings from '@/pages/RulesSettings.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/projects/new',
    name: 'project-new',
    component: {
      template: '<div class="text-center text-xl p-8">新建项目 - Coming Soon</div>',
    },
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: ProjectDetail,
  },
  {
    path: '/projects/:id/import',
    name: 'project-import',
    component: ProjectImport,
  },
  {
    path: '/projects/:id/sites',
    name: 'project-sites',
    component: ProjectSites,
  },
  {
    path: '/projects/:id/photos',
    name: 'project-photos',
    component: ProjectPhotos,
  },
  {
    path: '/projects/:id/ppt',
    name: 'project-ppt',
    component: ProjectPPT,
  },
  {
    path: '/settings/rules',
    name: 'rules-settings',
    component: RulesSettings,
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
