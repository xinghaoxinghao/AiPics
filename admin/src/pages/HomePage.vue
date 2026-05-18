<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, Picture, Setting, Download } from '@element-plus/icons-vue'
import { getProjects } from '@/api/project'
import type { Project } from '@/types'

const router = useRouter()
const projects = ref<Project[]>([])
const loading = ref(false)

// 模拟数据
const mockProjects: Project[] = [
  {
    id: 'proj-001',
    code: 'PROJ2024001',
    name: '某地市5G基站勘察项目',
    description: '2024年度5G基站建设勘察项目',
    createdAt: '2024-01-15T08:30:00Z',
    qrcodeUrl: 'https://picsum.photos/200/200?random=1',
    siteCount: 15,
    photoCount: 245
  },
  {
    id: 'proj-002',
    code: 'PROJ2024002',
    name: '城东新区光纤入户工程',
    description: '城东新区新建小区光纤入户勘察',
    createdAt: '2024-02-20T10:15:00Z',
    qrcodeUrl: 'https://picsum.photos/200/200?random=2',
    siteCount: 8,
    photoCount: 128
  },
  {
    id: 'proj-003',
    code: 'PROJ2024003',
    name: '地铁4号线通信配套',
    description: '地铁4号线通信系统配套工程勘察',
    createdAt: '2024-03-10T14:45:00Z',
    qrcodeUrl: 'https://picsum.photos/200/200?random=3',
    siteCount: 12,
    photoCount: 192
  }
]

// 加载项目列表
const loadProjects = async () => {
  loading.value = true
  try {
    // 暂时使用模拟数据
    projects.value = mockProjects
    // const data = await getProjects()
    // projects.value = data
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 创建新项目
const handleCreateProject = () => {
  ElMessageBox.prompt('请输入项目名称', '新建项目', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '项目名称不能为空'
  }).then(({ value }) => {
    ElMessage.success(`项目 "${value}" 创建成功`)
  }).catch(() => {})
}

// 查看项目详情
const viewProject = (project: Project) => {
  router.push(`/projects/${project.id}`)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadProjects()
})
</script>

<template>
  <div class="project-list">
    <div class="page-header">
      <h1>项目管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreateProject">
        新建项目
      </el-button>
    </div>

    <div v-loading="loading" class="project-grid">
      <el-card 
        v-for="project in projects" 
        :key="project.id"
        class="project-card"
        shadow="hover"
        @click="viewProject(project)"
      >
        <div class="project-header">
          <div class="project-info">
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-code">{{ project.code }}</p>
          </div>
          <div class="qrcode-box">
            <img :src="project.qrcodeUrl" alt="二维码" />
          </div>
        </div>
        <p v-if="project.description" class="project-desc">{{ project.description }}</p>
        <div class="project-stats">
          <div class="stat-item">
            <el-icon><Document /></el-icon>
            <span>{{ project.siteCount }} 个站点</span>
          </div>
          <div class="stat-item">
            <el-icon><Picture /></el-icon>
            <span>{{ project.photoCount }} 张照片</span>
          </div>
        </div>
        <div class="project-footer">
          <span class="create-time">创建于 {{ formatDate(project.createdAt) }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.project-list {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.project-card {
  cursor: pointer;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-4px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-name {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-code {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.qrcode-box {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.qrcode-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.project-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4b5563;
}

.stat-item .el-icon {
  color: #409eff;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.create-time {
  font-size: 13px;
  color: #9ca3af;
}
</style>
