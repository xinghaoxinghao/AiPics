<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormRules, type FormInstance } from 'element-plus'
import { ArrowLeft, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getProjectSites, createSite, updateSite, deleteSite, getProjects, getSitePhotos } from '@/store'
import type { Site } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const loading = ref(false)
const sites = ref<Site[]>([])
const projectName = ref('')
const searchText = ref('')

// 新建站点对话框
const createDialogVisible = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  code: '',
  name: '',
  address: '',
  roomType: ''
})

// 编辑站点对话框
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: '',
  code: '',
  name: '',
  address: '',
  roomType: ''
})

const siteFormRules: FormRules = {
  name: [
    { required: true, message: '站点名称不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '名称长度为 2 到 100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '站点编号不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '编号长度为 2 到 30 个字符', trigger: 'blur' }
  ]
}

// 加载站点列表
const loadSites = () => {
  loading.value = true
  try {
    sites.value = getProjectSites(projectId)
    const projects = getProjects()
    const project = projects.find((p) => p.id === projectId)
    projectName.value = project?.name ?? ''
  } catch {
    ElMessage.error('加载站点列表失败')
  } finally {
    loading.value = false
  }
}

// 过滤后的站点
const filteredSites = computed(() => {
  if (!searchText.value.trim()) return sites.value
  const keyword = searchText.value.toLowerCase()
  return sites.value.filter(
    (s) =>
      s.name.toLowerCase().includes(keyword) ||
      s.code.toLowerCase().includes(keyword) ||
      (s.address && s.address.toLowerCase().includes(keyword))
  )
})

// 生成站点编号
const generateSiteCode = () => {
  const nextNum = sites.value.length + 1
  return `SITE${String(nextNum).padStart(3, '0')}`
}

// 打开新建站点对话框
const openCreateDialog = () => {
  createForm.code = generateSiteCode()
  createForm.name = ''
  createForm.address = ''
  createForm.roomType = ''
  createDialogVisible.value = true
}

// 提交新建站点
const submitCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      // 检查编号是否重复
      if (sites.value.some((s) => s.code === createForm.code)) {
        ElMessage.error('站点编号已存在，请使用其他编号')
        return
      }
      createSite({
        projectId,
        code: createForm.code,
        name: createForm.name,
        address: createForm.address || undefined,
        roomType: createForm.roomType || undefined
      })
      ElMessage.success('站点创建成功')
      createDialogVisible.value = false
      loadSites()
    } catch {
      ElMessage.error('创建站点失败')
    }
  })
}

// 打开编辑站点对话框
const openEditDialog = (site: Site) => {
  editForm.id = site.id
  editForm.code = site.code
  editForm.name = site.name
  editForm.address = site.address ?? ''
  editForm.roomType = site.roomType ?? ''
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const others = sites.value.filter((s) => s.id !== editForm.id)
      if (others.some((s) => s.code === editForm.code)) {
        ElMessage.error('站点编号已存在，请使用其他编号')
        return
      }
      updateSite(editForm.id, {
        code: editForm.code,
        name: editForm.name,
        address: editForm.address || undefined,
        roomType: editForm.roomType || undefined
      })
      ElMessage.success('站点已更新')
      editDialogVisible.value = false
      loadSites()
    } catch {
      ElMessage.error('更新站点失败')
    }
  })
}

// 删除站点
const handleDelete = (site: Site) => {
  const photoCount = getSitePhotos(site.id).length
  const extraMsg = photoCount > 0 ? `同时会删除该站点下的 ${photoCount} 张照片。` : ''
  ElMessageBox.confirm(
    `确定要删除站点 "${site.name}" 吗？${extraMsg}此操作不可撤销。`,
    '删除站点',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  )
    .then(() => {
      deleteSite(site.id)
      loadSites()
      ElMessage.success('站点已删除')
    })
    .catch(() => {})
}

// 跳转照片管理
const goToPhotos = (site: Site) => {
  router.push(`/projects/${projectId}/photos?siteId=${site.id}`)
}

// 返回项目详情
const goBack = () => {
  router.push(`/projects/${projectId}`)
}

onMounted(() => {
  loadSites()
})
</script>

<template>
  <div class="project-sites" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle @click="goBack" />
        <div class="header-info">
          <h1>站点管理</h1>
          <p>{{ projectName || '加载中...' }} · 共 {{ sites.length }} 个站点</p>
        </div>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchText"
          placeholder="搜索站点名称/编号"
          clearable
          style="width: 240px"
        />
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">
          新建站点
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <el-card v-if="sites.length === 0" class="empty-card">
      <div class="empty-state">
        <div class="empty-icon">📍</div>
        <h3>还没有站点</h3>
        <p>点击右上角「新建站点」开始添加你的第一个勘察站点</p>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">
          新建站点
        </el-button>
      </div>
    </el-card>

    <!-- 站点表格 -->
    <el-card v-else>
      <el-table :data="filteredSites" style="width: 100%">
        <el-table-column prop="code" label="站点编号" width="140" />
        <el-table-column prop="name" label="站点名称" min-width="180" />
        <el-table-column prop="address" label="地址" min-width="220" />
        <el-table-column prop="roomType" label="机房类型" width="120">
          <template #default="{ row }">
            <span>{{ row.roomType || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="info" @click="goToPhotos(row)">照片</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredSites.length === 0 && searchText" class="empty-filter">
        没有找到匹配的站点
      </div>
    </el-card>

    <!-- 新建站点对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建站点"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="siteFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="站点编号" prop="code">
          <el-input v-model="createForm.code" placeholder="请输入站点编号" clearable />
        </el-form-item>
        <el-form-item label="站点名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入站点名称" clearable />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="createForm.address" placeholder="请输入地址（选填）" clearable />
        </el-form-item>
        <el-form-item label="机房类型">
          <el-select
            v-model="createForm.roomType"
            placeholder="请选择机房类型（选填）"
            clearable
            style="width: 100%"
          >
            <el-option label="室内机房" value="室内机房" />
            <el-option label="室外机柜" value="室外机柜" />
            <el-option label="室外抱杆" value="室外抱杆" />
            <el-option label="楼顶站" value="楼顶站" />
            <el-option label="铁塔" value="铁塔" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑站点对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑站点"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="siteFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="站点编号" prop="code">
          <el-input v-model="editForm.code" clearable />
        </el-form-item>
        <el-form-item label="站点名称" prop="name">
          <el-input v-model="editForm.name" clearable />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="editForm.address" placeholder="请输入地址（选填）" clearable />
        </el-form-item>
        <el-form-item label="机房类型">
          <el-select
            v-model="editForm.roomType"
            placeholder="请选择机房类型（选填）"
            clearable
            style="width: 100%"
          >
            <el-option label="室内机房" value="室内机房" />
            <el-option label="室外机柜" value="室外机柜" />
            <el-option label="室外抱杆" value="室外抱杆" />
            <el-option label="楼顶站" value="楼顶站" />
            <el-option label="铁塔" value="铁塔" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.project-sites {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-info h1 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.header-info p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.empty-card {
  border-radius: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6b7280;
}

.empty-filter {
  padding: 32px 0;
  text-align: center;
  font-size: 14px;
  color: #9ca3af;
}
</style>
