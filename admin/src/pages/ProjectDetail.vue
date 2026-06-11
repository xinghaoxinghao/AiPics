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
  Edit,
  Refresh,
  Link
} from '@element-plus/icons-vue'
import { getProjects, updateProject, refreshQRCode, generateMobileUrl, exportProjectData } from '@/store'
import type { Project } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const loading = ref(false)
const project = ref<Project | null>(null)
const qrRefreshing = ref(false)

// 判断是否为空项目
const isEmptyProject = computed(() => {
  if (!project.value) return false
  return project.value.siteCount === 0 && project.value.photoCount === 0
})

// 手机端扫码URL
const mobileUrl = computed(() => generateMobileUrl(projectId))

// 加载项目详情
const loadProject = () => {
  loading.value = true
  try {
    const projects = getProjects()
    const found = projects.find((p) => p.id === projectId)
    if (found) {
      project.value = found
    } else {
      ElMessage.warning('项目不存在或已被删除')
      setTimeout(() => router.push('/'), 1500)
    }
  } catch {
    ElMessage.error('加载项目详情失败')
  } finally {
    loading.value = false
  }
}

// 编辑项目名称
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
    updateProject(project.value.id, { name: value })
    project.value.name = value
    ElMessage.success('项目名称已更新')
  } catch {
    // 用户取消
  }
}

// 刷新二维码
const handleRefreshQR = async () => {
  if (!project.value || qrRefreshing.value) return
  qrRefreshing.value = true
  try {
    const newQr = await refreshQRCode(project.value.id)
    project.value.qrcodeUrl = newQr
    ElMessage.success('二维码已刷新')
  } catch {
    ElMessage.error('刷新二维码失败')
  } finally {
    qrRefreshing.value = false
  }
}

// 复制URL
const handleCopyUrl = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(mobileUrl.value)
    } else {
      const ta = document.createElement('textarea')
      ta.value = mobileUrl.value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    ElMessage.success('URL已复制到剪贴板')
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}

// 导出项目数据（下载JSON文件）
const handleExportData = () => {
  if (!project.value) return
  try {
    const json = exportProjectData(project.value.id)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-${project.value.code}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('项目数据已导出，请将文件发送到手机端导入')
  } catch {
    ElMessage.error('导出失败')
  }
}

// 功能菜单
const menuItems = computed(() => [
  {
    key: 'sites',
    icon: Document,
    title: '站点管理',
    desc: '管理项目下的所有站点，支持手动添加和编辑',
    path: `/projects/${projectId}/sites`
  },
  {
    key: 'photos',
    icon: Picture,
    title: '照片管理',
    desc: '查看和管理所有上传的照片，按站点分组显示',
    path: `/projects/${projectId}/photos`
  }
])

const navigateTo = (path: string) => {
  router.push(path)
}

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
            <p>接下来你可以：管理站点 → 上传照片 → 生成PPT报告</p>
          </div>
          <div class="welcome-steps">
            <div class="welcome-step">
              <span class="step-num">1</span>
              <span>管理站点</span>
            </div>
            <div class="welcome-arrow">→</div>
            <div class="welcome-step">
              <span class="step-num">2</span>
              <span>手机扫码上传照片</span>
            </div>
            <div class="welcome-arrow">→</div>
            <div class="welcome-step">
              <span class="step-num">3</span>
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
            <p class="project-desc">{{ project.description || '暂无项目描述' }}</p>
            <p class="project-meta">
              <span class="label">项目编号：</span>
              <span class="value">{{ project.code }}</span>
              <span class="label">创建时间：</span>
              <span class="value">{{ new Date(project.createdAt).toLocaleString('zh-CN') }}</span>
            </p>
          </div>
          <div class="qrcode-large">
            <div class="qrcode-wrapper">
              <img
                v-if="project.qrcodeUrl"
                :src="project.qrcodeUrl"
                alt="项目二维码"
              />
              <div v-else class="qrcode-placeholder">
                <el-icon :size="48"><Picture /></el-icon>
                <p>二维码生成中...</p>
              </div>
            </div>
            <p class="qrcode-tip">📱 使用手机浏览器扫码打开</p>
            <div class="qrcode-actions">
              <el-button size="small" :icon="Refresh" @click="handleRefreshQR" :loading="qrRefreshing">
                刷新二维码
              </el-button>
              <el-button size="small" :icon="Link" @click="handleCopyUrl">
                复制URL
              </el-button>
            </div>
            <el-input
              class="qr-url-input"
              :model-value="mobileUrl"
              readonly
              size="small"
            />
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
          <div class="stat-card" @click="handleExportData" style="cursor: pointer">
            <div class="stat-icon orange">
              <el-icon><Download /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-text">导出数据</div>
              <div class="stat-label">下载JSON文件</div>
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

.project-meta {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
}

.project-meta .label {
  color: #9ca3af;
}

.project-meta .value {
  color: #1f2937;
  font-weight: 500;
  margin-right: 16px;
}

.qrcode-large {
  text-align: center;
  min-width: 220px;
}

.qrcode-wrapper {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
}

.qrcode-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.qrcode-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  gap: 8px;
}

.qrcode-placeholder p {
  margin: 0;
  font-size: 13px;
}

.qrcode-tip {
  margin: 12px 0 8px;
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.qrcode-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.qr-url-input {
  margin-top: 4px;
  width: 220px;
}

.qr-url-input :deep(.el-input__wrapper) {
  font-size: 12px;
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

.stat-text {
  font-size: 18px;
  font-weight: 600;
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
