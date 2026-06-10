<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Document,
  Picture,
  Upload,
  Download,
  Setting,
  Edit
} from '@element-plus/icons-vue'
import type { Project } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const loading = ref(false)
const project = ref<Project | null>(null)

// 模拟预置项目数据
const mockProjects: Project[] = [
  {
    id: 'proj-001',
    code: 'PROJ2024001',
    name: '某地市5G基站勘察项目',
    description: '2024年度5G基站建设勘察项目，涵盖全市15个基站站点的勘察工作',
    createdAt: '2024-01-15T08:30:00Z',
    qrcodeUrl: 'https://picsum.photos/300/300?random=10',
    siteCount: 15,
    photoCount: 245
  },
  {
    id: 'proj-002',
    code: 'PROJ2024002',
    name: '城东新区光纤入户工程',
    description: '城东新区新建小区光纤入户勘察',
    createdAt: '2024-02-20T10:15:00Z',
    qrcodeUrl: 'https://picsum.photos/300/300?random=11',
    siteCount: 8,
    photoCount: 128
  },
  {
    id: 'proj-003',
    code: 'PROJ2024003',
    name: '地铁4号线通信配套',
    description: '地铁4号线通信系统配套工程勘察',
    createdAt: '2024-03-10T14:45:00Z',
    qrcodeUrl: 'https://picsum.photos/300/300?random=12',
    siteCount: 12,
    photoCount: 192
  }
]

// 判断是否为空项目（新建的项目）
const isEmptyProject = computed(() => {
  if (!project.value) return false
  return project.value.siteCount === 0 && project.value.photoCount === 0
})

// 加载项目详情
const loadProject = async () => {
  loading.value = true
  try {
    // 查找匹配的模拟项目，找不到则生成空项目占位
    const existing = mockProjects.find((p) => p.id === projectId)
    if (existing) {
      project.value = existing
    } else {
      // 如果是新创建的项目，从 localStorage 尝试读取
      const stored = typeof window !== 'undefined'
        ? window.localStorage.getItem(`project_${projectId}`)
        : null
      if (stored) {
        project.value = JSON.parse(stored) as Project
      } else {
        // 生成空项目占位
        project.value = {
          id: projectId,
          code: `PROJ${projectId.slice(-6).toUpperCase()}`,
          name: '新建勘察项目',
          description: '这是一个刚刚创建的项目，还没有站点和照片数据。请先导入勘察报告或手动添加站点，然后使用手机扫码上传照片。',
          createdAt: new Date().toISOString(),
          qrcodeUrl: `https://picsum.photos/300/300?random=${projectId}`,
          siteCount: 0,
          photoCount: 0
        }
      }
    }
    // const data = await getProject(projectId)
    // project.value = data
  } catch (error) {
    ElMessage.error('加载项目详情失败')
  } finally {
    loading.value = false
  }
}

// 修改项目名称
const editProjectName = async () => {
  if (!project.value) return
  try {
    const { value } = await ElMessageBox.prompt('请输入项目名称', '修改项目名称', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: project.value.name,
      inputPattern: /\S+/,
      inputErrorMessage: '项目名称不能为空'
    })
    project.value.name = value
    ElMessage.success('项目名称已更新')
  } catch {
    // 用户取消
  }
}

// 功能菜单
const menuItems = [
  { 
    key: 'import', 
    icon: Upload, 
    title: '勘察报告导入', 
    desc: '上传Word/Excel/PDF文件，自动解析项目信息和站点列表',
    path: `/projects/${projectId}/import`
  },
  { 
    key: 'sites', 
    icon: Document, 
    title: '站点管理', 
    desc: '管理项目下的所有站点，支持批量导入和编辑',
    path: `/projects/${projectId}/sites`
  },
  { 
    key: 'photos', 
    icon: Picture, 
    title: '照片管理', 
    desc: '查看和管理所有上传的照片，支持批量操作',
    path: `/projects/${projectId}/photos`
  },
  { 
    key: 'ppt', 
    icon: Download, 
    title: '生成PPT报告', 
    desc: '一键生成包含封面、站点照片和附录的PPT文件',
    path: `/projects/${projectId}/ppt`
  }
]

// 跳转页面
const navigateTo = (path: string) => {
  router.push(path)
}

// 返回项目列表
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadProject()
})
</script>

<template>
  <div class="project-detail" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle @click="goBack" />
        <div class="header-info">
          <div class="project-title">
            <h1>{{ project?.name }}</h1>
            <el-button
              :icon="Edit"
              text
              size="small"
              @click.stop="editProjectName"
              class="edit-btn"
            >编辑
            </el-button>
          </div>
          <p class="project-code">{{ project?.code }}</p>
        </div>
      </div>
    </div>

    <div v-if="project" class="detail-content">
      <!-- 新手引导横幅（空项目显示） -->
      <el-card v-if="isEmptyProject" class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-icon">🎉</div>
          <div class="welcome-text">
            <h3>项目已创建！开始你的勘察项目</h3>
            <p>接下来你可以：导入勘察报告 → 管理站点 → 手机扫码上传照片 → 生成PPT报告</p>
          </div>
          <div class="welcome-steps">
            <div class="welcome-step">
              <span class="step-num">1</span>
              <span>导入勘察报告</span>
            </div>
            <div class="welcome-arrow">→</div>
            <div class="welcome-step">
              <span class="step-num">2</span>
              <span>管理站点</span>
            </div>
            <div class="welcome-arrow">→</div>
            <div class="welcome-step">
              <span class="step-num">3</span>
              <span>手机扫码上传照片</span>
            </div>
            <div class="welcome-arrow">→</div>
            <div class="welcome-step">
              <span class="step-num">4</span>
              <span>生成PPT报告</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 项目概览卡片 -->
      <el-card class="overview-card">
        <div class="overview-header">
          <div class="overview-info">
            <h2>项目概览</h2>
            <p class="project-desc">{{ project.description }}</p>
          </div>
          <div class="qrcode-large">
            <img :src="project.qrcodeUrl" alt="项目二维码" />
            <p class="qrcode-tip">扫码进入手机端上传</p>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ project.siteCount }}</div>
              <div class="stat-label">站点数量</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ project.photoCount }}</div>
              <div class="stat-label">照片数量</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ new Date(project.createdAt).toLocaleDateString('zh-CN') }}</div>
              <div class="stat-label">创建时间</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 功能菜单 -->
      <div class="menu-section">
        <h3>功能菜单</h3>
        <div class="menu-grid">
          <div 
            v-for="item in menuItems" 
            :key="item.key"
            class="menu-item"
            @click="navigateTo(item.path)"
          >
            <div class="menu-icon">
              <el-icon :size="32"><component :is="item.icon" /></el-icon>
            </div>
            <div class="menu-text">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
            <el-icon class="menu-arrow"><ArrowLeft style="transform: rotate(180deg)" /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-detail {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.project-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.edit-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.edit-btn:hover {
  opacity: 1;
}

.project-code {
  margin: 4px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-card {
  border-radius: 12px;
  border-color: #79bbff;
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
}

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-icon {
  font-size: 32px;
}

.welcome-text h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

.welcome-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
}

.welcome-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  color: #1f2937;
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-arrow {
  color: #6b7280;
  font-size: 14px;
}

.overview-card {
  border-radius: 12px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 24px;
}

.overview-info {
  flex: 1;
}

.overview-info h2 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.project-desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.qrcode-large {
  text-align: center;
}

.qrcode-large img {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
}

.stat-icon.green {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: #fff;
}

.stat-icon.orange {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  color: #fff;
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.menu-section {
  margin-top: 8px;
}

.menu-section h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.menu-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  min-width: 0;
}

.menu-text h4 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.menu-text p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.menu-arrow {
  color: #9ca3af;
  font-size: 20px;
  flex-shrink: 0;
}
</style>
