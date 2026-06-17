<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormRules, type FormInstance } from 'element-plus'
import { Plus, Document, Picture, Search, Delete, Edit } from '@element-plus/icons-vue'
import {
  getProjects as loadProjectsStore,
  createProject as storeCreateProject,
  deleteProject as storeDeleteProject,
  updateProject as storeUpdateProject,
  clearAllData
} from '@/store'
import type { Project } from '@/types'

const router = useRouter()
const projects = ref<Project[]>([])
const loading = ref(false)
const searchText = ref('')

// 新建项目对话框
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const projectFormRef = ref<FormInstance>()
const form = reactive({
  code: '',
  name: '',
  description: '',
  jumpToDetail: true
})

// 编辑项目对话框
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: '',
  code: '',
  name: '',
  description: ''
})

// 表单验证规则
const rules: FormRules = {
  code: [
    { required: true, message: '项目编号不能为空', trigger: 'blur' },
    { min: 3, max: 30, message: '项目编号长度为 3 到 30 个字符', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '项目编号只能包含字母、数字、下划线和短横线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '项目名称不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度为 2 到 100 个字符', trigger: 'blur' }
  ]
}

// 生成项目编号
const generateProjectCode = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `PROJ${year}${month}${random}`
}

// 加载项目列表
const loadProjects = () => {
  loading.value = true
  try {
    projects.value = loadProjectsStore()
  } catch {
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 过滤后的项目列表
const filteredProjects = computed(() => {
  if (!searchText.value.trim()) return projects.value
  const keyword = searchText.value.toLowerCase()
  return projects.value.filter(
    (p) =>
      p.name.toLowerCase().includes(keyword) ||
      p.code.toLowerCase().includes(keyword) ||
      (p.description && p.description.toLowerCase().includes(keyword))
  )
})

// 打开新建项目对话框
const handleCreateProject = () => {
  dialogVisible.value = true
  form.code = generateProjectCode()
  form.name = ''
  form.description = ''
  form.jumpToDetail = true
}

const closeDialog = () => {
  dialogVisible.value = false
  projectFormRef.value?.resetFields()
}

// 提交新建项目
const submitProject = async () => {
  if (!projectFormRef.value) return
  await projectFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      dialogLoading.value = true
      // 检查编号是否重复
      const exists = projects.value.some((p) => p.code === form.code)
      if (exists) {
        ElMessage.error('项目编号已存在，请使用其他编号')
        return
      }
      const newProject = await storeCreateProject({
        code: form.code,
        name: form.name,
        description: form.description
      })
      loadProjects()
      ElMessage.success('项目创建成功！')
      closeDialog()
      if (form.jumpToDetail) {
        router.push(`/projects/${newProject.id}`)
      }
    } catch {
      ElMessage.error('创建项目失败，请重试')
    } finally {
      dialogLoading.value = false
    }
  })
}

// 打开编辑项目对话框
const handleEditProject = (project: Project, evt: MouseEvent) => {
  evt.stopPropagation()
  editForm.id = project.id
  editForm.code = project.code
  editForm.name = project.name
  editForm.description = project.description ?? ''
  editDialogVisible.value = true
}

const closeEditDialog = () => {
  editDialogVisible.value = false
  editFormRef.value?.resetFields()
}

const submitEditProject = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      // 检查编号是否与其他项目重复
      const others = projects.value.filter((p) => p.id !== editForm.id)
      if (others.some((p) => p.code === editForm.code)) {
        ElMessage.error('项目编号已存在，请使用其他编号')
        return
      }
      storeUpdateProject(editForm.id, {
        code: editForm.code,
        name: editForm.name,
        description: editForm.description
      })
      loadProjects()
      ElMessage.success('项目已更新')
      closeEditDialog()
    } catch {
      ElMessage.error('更新项目失败')
    }
  })
}

// 删除项目
const handleDeleteProject = (project: Project, evt: MouseEvent) => {
  evt.stopPropagation()
  ElMessageBox.confirm(
    `确定要删除项目「${project.name}」吗？该项目下的所有站点和照片也会被一并删除，此操作不可撤销。`,
    '删除项目',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  )
    .then(() => {
      storeDeleteProject(project.id)
      loadProjects()
      ElMessage.success('项目已删除')
    })
    .catch(() => {})
}

// 清空所有数据
const handleClearAll = () => {
  ElMessageBox.confirm(
    '确定要清空所有项目、站点和照片数据吗？此操作不可撤销！',
    '清空数据',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  )
    .then(() => {
      clearAllData()
      loadProjects()
      ElMessage.success('所有数据已清空')
    })
    .catch(() => {})
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
      <div class="header-left">
        <h1>项目管理</h1>
        <span class="project-count">共 {{ projects.length }} 个项目</span>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchText"
          placeholder="搜索项目名称 / 编号"
          clearable
          :prefix-icon="Search"
          class="search-input"
        />
        <el-button v-if="projects.length > 0" @click="handleClearAll">
          清空所有数据
        </el-button>
        <el-button type="primary" :icon="Plus" @click="handleCreateProject">
          新建项目
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="project-grid">
      <el-card
        v-for="project in filteredProjects"
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
          <div class="footer-actions" @click.stop>
            <el-button link type="primary" size="small" :icon="Edit" @click="handleEditProject(project, $event)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteProject(project, $event)">
              删除
            </el-button>
          </div>
        </div>
      </el-card>

      <div v-if="filteredProjects.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-text">
          {{ searchText ? '没有找到匹配的项目' : '还没有项目，点击右上角「新建项目」开始' }}
        </p>
      </div>
    </div>

    <!-- 新建项目对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建项目"
      width="560px"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <el-form
        ref="projectFormRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="项目编号" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入项目编号"
            clearable
            maxlength="30"
            show-word-limit
          />
          <template #tip>
            <div class="form-tip">
              项目编号必须唯一，建议格式：PROJ + 年份 + 序号（如：PROJ2024001）
            </div>
          </template>
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入项目名称"
            clearable
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述（选填）"
            maxlength="500"
            show-word-limit
            resize="none"
          />
        </el-form-item>
        <el-form-item label-width="0">
          <el-checkbox v-model="form.jumpToDetail">创建成功后自动跳转到项目详情页</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="submitProject">
          创建项目
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑项目对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑项目"
      width="560px"
      :close-on-click-modal="false"
      @close="closeEditDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="项目编号" prop="code">
          <el-input v-model="editForm.code" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="editForm.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeEditDialog">取消</el-button>
        <el-button type="primary" @click="submitEditProject">保存</el-button>
      </template>
    </el-dialog>
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
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.project-count {
  font-size: 13px;
  color: #9ca3af;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 280px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
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

.footer-actions {
  display: flex;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  margin-top: 2px;
}
</style>
