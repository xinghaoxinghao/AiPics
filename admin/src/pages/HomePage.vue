<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormRules, type FormInstance } from 'element-plus'
import { Plus, Document, Picture, Search } from '@element-plus/icons-vue'
import { getProjects, createProject } from '@/api/project'
import type { Project } from '@/types'

const router = useRouter()
const projects = ref<Project[]>([])
const loading = ref(false)
const searchText = ref('')

// 新建项目对话框状态
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const projectFormRef = ref<FormInstance>()
const form = reactive({
  code: '',
  name: '',
  description: '',
  jumpToDetail: true
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

// 生成项目编号
const generateProjectCode = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `PROJ${year}${month}${random}`
}

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

// 搜索过滤后的项目列表
const filteredProjects = computed(() => {
  if (!searchText.value.trim()) {
    return projects.value
  }
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

// 关闭对话框并重置表单
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
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        code: form.code,
        name: form.name,
        description: form.description,
        createdAt: new Date().toISOString(),
        qrcodeUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
        siteCount: 0,
        photoCount: 0
      }
      // 调用API创建项目（暂时注释，使用模拟数据）
      // const response = await createProject({
      //   code: form.code,
      //   name: form.name,
      //   description: form.description
      // })
      // projects.value.unshift(response)
      projects.value.unshift(newProject)
      ElMessage.success('项目创建成功！')
      closeDialog()
      if (form.jumpToDetail) {
        router.push(`/projects/${newProject.id}`)
      }
    } catch (error) {
      ElMessage.error('创建项目失败，请重试')
    } finally {
      dialogLoading.value = false
    }
  })
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
        </div>
      </el-card>

      <div v-if="filteredProjects.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-text">{{ searchText ? '没有找到匹配的项目' : '还没有项目，点击右上角「新建项目」开始' }}</p>
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
        <el-form-item label-width="0" prop="jumpToDetail">
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

.form-tip {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  margin-top: 2px;
}
</style>
