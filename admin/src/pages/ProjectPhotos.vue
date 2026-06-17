<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Upload as UploadIcon, View, Edit, Delete, Picture } from '@element-plus/icons-vue'
import {
  getProjectSites,
  getProjectPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto
} from '@/store'
import type { Site, Photo } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const loading = ref(false)
const sites = ref<Site[]>([])
const photos = ref<Photo[]>([])
const selectedSiteId = ref<string>('all')
const searchText = ref('')
const previewVisible = ref(false)
const previewPhoto = ref<Photo | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// 新建照片对话框
const uploadDialogVisible = ref(false)
const uploadFormRef = ref<FormInstance>()
const uploadForm = reactive({
  siteId: '',
  fileName: '',
  deviceType: '',
  remark: '',
  fileUrl: ''
})

// 编辑照片对话框
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: '',
  fileName: '',
  deviceType: '',
  remark: ''
})

const photoFormRules: FormRules = {
  siteId: [
    { required: true, message: '请选择站点', trigger: 'change' }
  ],
  fileName: [
    { required: true, message: '请输入文件名称', trigger: 'blur' }
  ]
}

const deviceTypeOptions = [
  '机柜',
  '天线',
  '电源',
  '传输',
  '接地',
  '环境',
  '其他'
]

// 加载数据
const loadData = () => {
  loading.value = true
  try {
    sites.value = getProjectSites(projectId)
    photos.value = getProjectPhotos(projectId)
    // 如果URL里带了siteId，则选中该站点
    const siteParam = route.query.siteId as string
    if (siteParam && sites.value.some((s) => s.id === siteParam)) {
      selectedSiteId.value = siteParam
    }
  } catch {
    ElMessage.error('加载照片失败')
  } finally {
    loading.value = false
  }
}

// 站点名称查找
const siteNameById = (siteId: string) => {
  const site = sites.value.find((s) => s.id === siteId)
  return site?.name ?? '未知站点'
}

// 过滤后的照片
const filteredPhotos = computed(() => {
  let result = photos.value
  if (selectedSiteId.value !== 'all') {
    result = result.filter((p) => p.siteId === selectedSiteId.value)
  }
  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.fileName.toLowerCase().includes(keyword) ||
        (p.deviceType && p.deviceType.toLowerCase().includes(keyword)) ||
        (p.remark && p.remark.toLowerCase().includes(keyword))
    )
  }
  return result
})

// 按站点分组
const photosBySite = computed(() => {
  const groups: { site: Site | null; photos: Photo[] }[] = []
  if (selectedSiteId.value === 'all') {
    // 按所有站点分组
    for (const site of sites.value) {
      const sitePhotos = filteredPhotos.value.filter((p) => p.siteId === site.id)
      if (sitePhotos.length > 0) {
        groups.push({ site, photos: sitePhotos })
      }
    }
    // 没有归属站点的照片
    const orphanPhotos = filteredPhotos.value.filter(
      (p) => !sites.value.some((s) => s.id === p.siteId)
    )
    if (orphanPhotos.length > 0) {
      groups.push({ site: null, photos: orphanPhotos })
    }
  } else {
    const site = sites.value.find((s) => s.id === selectedSiteId.value)
    if (site) {
      groups.push({ site, photos: filteredPhotos.value })
    }
  }
  return groups
})

// 自动生成文件名
const generateFileName = () => {
  const site = sites.value.find((s) => s.id === uploadForm.siteId)
  const code = site?.code || 'SITE'
  const sitePhotos = photos.value.filter((p) => p.siteId === uploadForm.siteId)
  const seq = String(sitePhotos.length + 1).padStart(3, '0')
  const dt = new Date()
  const dateStr = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`
  return `${code}_${dateStr}_${seq}`
}

// 打开上传对话框
const openUploadDialog = () => {
  if (sites.value.length === 0) {
    ElMessageBox.confirm(
      '当前项目还没有站点。请先至少创建一个站点，然后才能上传照片。',
      '需要先创建站点',
      {
        confirmButtonText: '去创建站点',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        router.push(`/projects/${projectId}/sites`)
      })
      .catch(() => {})
    return
  }
  uploadForm.siteId = selectedSiteId.value !== 'all' ? selectedSiteId.value : sites.value[0].id
  uploadForm.fileName = generateFileName()
  uploadForm.deviceType = ''
  uploadForm.remark = ''
  uploadForm.fileUrl = ''
  uploadDialogVisible.value = true
}

// 当站点变化时更新文件名
const onUploadSiteChange = () => {
  uploadForm.fileName = generateFileName()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadForm.fileUrl = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 如果用户还没设置文件名，用原文件名作为基础
  if (!uploadForm.fileName || uploadForm.fileName.startsWith('SITE')) {
    const baseName = file.name.replace(/\.[^.]+$/, '')
    if (baseName) {
      uploadForm.fileName = `${generateFileName()}_${baseName}`
    }
  }
}

// 提交上传
const submitUpload = async () => {
  if (!uploadFormRef.value) return
  await uploadFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (!uploadForm.fileUrl) {
        ElMessage.error('请先选择要上传的图片')
        return
      }
      createPhoto({
        projectId,
        siteId: uploadForm.siteId,
        originalName: uploadForm.fileName,
        fileName: uploadForm.fileName,
        fileUrl: uploadForm.fileUrl,
        thumbnailUrl: uploadForm.fileUrl,
        deviceType: uploadForm.deviceType || undefined,
        remark: uploadForm.remark || undefined
      })
      ElMessage.success('照片上传成功')
      uploadDialogVisible.value = false
      loadData()
    } catch {
      ElMessage.error('上传失败')
    }
  })
}

// 打开编辑
const openEditDialog = (photo: Photo) => {
  editForm.id = photo.id
  editForm.fileName = photo.fileName
  editForm.deviceType = photo.deviceType ?? ''
  editForm.remark = photo.remark ?? ''
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      updatePhoto(editForm.id, {
        fileName: editForm.fileName,
        deviceType: editForm.deviceType || undefined,
        remark: editForm.remark || undefined
      })
      ElMessage.success('照片信息已更新')
      editDialogVisible.value = false
      loadData()
    } catch {
      ElMessage.error('更新失败')
    }
  })
}

// 预览
const openPreview = (photo: Photo) => {
  previewPhoto.value = photo
  previewVisible.value = true
}

// 删除
const handleDelete = (photo: Photo) => {
  ElMessageBox.confirm(
    `确定要删除照片 "${photo.fileName}" 吗？此操作不可撤销。`,
    '删除照片',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  )
    .then(() => {
      deletePhoto(photo.id)
      loadData()
      ElMessage.success('照片已删除')
    })
    .catch(() => {})
}

// 返回
const goBack = () => {
  router.push(`/projects/${projectId}`)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="project-photos" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle @click="goBack" />
        <div class="header-info">
          <h1>照片管理</h1>
          <p>共 {{ photos.length }} 张照片 · {{ sites.length }} 个站点</p>
        </div>
      </div>
      <div class="header-actions">
        <el-select
          v-model="selectedSiteId"
          placeholder="选择站点"
          style="width: 220px"
        >
          <el-option label="全部站点" value="all" />
          <el-option
            v-for="site in sites"
            :key="site.id"
            :label="`${site.code} - ${site.name}`"
            :value="site.id"
          />
        </el-select>
        <el-input
          v-model="searchText"
          placeholder="搜索文件名/类型/备注"
          clearable
          style="width: 240px"
        />
        <el-button type="primary" :icon="UploadIcon" @click="openUploadDialog">
          上传照片
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <el-card v-if="photos.length === 0" class="empty-card">
      <div class="empty-state">
        <div class="empty-icon">📷</div>
        <h3>还没有照片</h3>
        <p>
          {{ sites.length === 0 ? '请先创建站点，再上传照片' : '点击右上角「上传照片」开始上传' }}
        </p>
        <div class="empty-actions">
          <el-button
            v-if="sites.length === 0"
            type="primary"
            @click="router.push(`/projects/${projectId}/sites`)"
          >
            去创建站点
          </el-button>
          <el-button
            v-else
            type="primary"
            :icon="UploadIcon"
            @click="openUploadDialog"
          >
            上传照片
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 搜索无结果 -->
    <el-card v-else-if="filteredPhotos.length === 0" class="empty-card">
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>没有找到匹配的照片</h3>
        <p>尝试更换搜索词或清空筛选条件</p>
      </div>
    </el-card>

    <!-- 照片分组展示 -->
    <div v-else class="photo-groups">
      <div v-for="group in photosBySite" :key="group.site?.id || 'orphan'" class="photo-group">
        <div class="group-header">
          <el-icon class="group-icon"><Picture /></el-icon>
          <h3>{{ group.site ? `${group.site.code} - ${group.site.name}` : '未关联站点' }}</h3>
          <span class="group-count">{{ group.photos.length }} 张</span>
        </div>
        <div class="photos-grid">
          <div v-for="photo in group.photos" :key="photo.id" class="photo-item">
            <div class="photo-thumbnail" @click="openPreview(photo)">
              <img :src="photo.fileUrl" :alt="photo.fileName" />
              <div class="photo-overlay">
                <el-button circle size="small" :icon="View" @click.stop="openPreview(photo)" />
                <el-button circle size="small" :icon="Edit" @click.stop="openEditDialog(photo)" />
                <el-button circle size="small" type="danger" :icon="Delete" @click.stop="handleDelete(photo)" />
              </div>
            </div>
            <div class="photo-info">
              <p class="photo-name" :title="photo.fileName">{{ photo.fileName }}</p>
              <div class="photo-meta">
                <el-tag v-if="photo.deviceType" size="small" type="info">{{ photo.deviceType }}</el-tag>
                <span class="photo-time">
                  {{ new Date(photo.uploadedAt).toLocaleDateString('zh-CN') }}
                </span>
              </div>
              <p v-if="photo.remark" class="photo-remark">{{ photo.remark }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传照片"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="photoFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="所属站点" prop="siteId">
          <el-select
            v-model="uploadForm.siteId"
            placeholder="请选择站点"
            style="width: 100%"
            @change="onUploadSiteChange"
          >
            <el-option
              v-for="site in sites"
              :key="site.id"
              :label="`${site.code} - ${site.name}`"
              :value="site.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择图片">
          <div class="upload-trigger" @click="fileInput?.click()">
            <template v-if="uploadForm.fileUrl">
              <img :src="uploadForm.fileUrl" alt="预览" />
            </template>
            <template v-else>
              <el-icon :size="32"><UploadIcon /></el-icon>
              <p>点击选择图片</p>
              <span>支持 JPG/PNG/GIF，单张不超过 5MB</span>
            </template>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
        </el-form-item>
        <el-form-item label="文件名称" prop="fileName">
          <el-input v-model="uploadForm.fileName" placeholder="请输入文件名称" clearable />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select
            v-model="uploadForm.deviceType"
            placeholder="请选择设备类型（选填）"
            clearable
            style="width: 100%"
          >
            <el-option v-for="opt in deviceTypeOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="uploadForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注（选填）"
            maxlength="200"
            show-word-limit
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑照片信息"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="photoFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="文件名称" prop="fileName">
          <el-input v-model="editForm.fileName" clearable />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select
            v-model="editForm.deviceType"
            placeholder="请选择设备类型（选填）"
            clearable
            style="width: 100%"
          >
            <el-option v-for="opt in deviceTypeOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <el-dialog
      v-model="previewVisible"
      :title="previewPhoto?.fileName"
      width="80%"
      align-center
    >
      <div class="preview-container">
        <img v-if="previewPhoto" :src="previewPhoto.fileUrl" :alt="previewPhoto.fileName" />
        <div v-if="previewPhoto" class="preview-info">
          <div class="preview-meta">
            <div><strong>所属站点：</strong>{{ siteNameById(previewPhoto.siteId) }}</div>
            <div v-if="previewPhoto.deviceType"><strong>设备类型：</strong>{{ previewPhoto.deviceType }}</div>
            <div><strong>上传时间：</strong>{{ new Date(previewPhoto.uploadedAt).toLocaleString('zh-CN') }}</div>
            <div v-if="previewPhoto.remark"><strong>备注：</strong>{{ previewPhoto.remark }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.project-photos {
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

.empty-actions {
  display: flex;
  gap: 12px;
}

.photo-groups {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.photo-group {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.group-icon {
  font-size: 20px;
  color: #409eff;
}

.group-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.group-count {
  font-size: 13px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 12px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.photo-item {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f3f4f6;
  transition: all 0.3s;
}

.photo-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.photo-thumbnail {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f3f4f6;
  cursor: pointer;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-item:hover .photo-thumbnail img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-info {
  padding: 12px;
}

.photo-name {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.photo-time {
  font-size: 12px;
  color: #9ca3af;
}

.photo-remark {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upload-trigger {
  width: 100%;
  height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  color: #6b7280;
  transition: all 0.3s;
  position: relative;
}

.upload-trigger:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.upload-trigger p {
  margin: 8px 0 4px;
  font-size: 14px;
  color: #1f2937;
}

.upload-trigger span {
  font-size: 12px;
  color: #9ca3af;
}

.upload-trigger img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.preview-container img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
}

.preview-info {
  width: 100%;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
}

.preview-meta {
  display: grid;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.preview-meta strong {
  color: #1f2937;
  margin-right: 4px;
}

:deep(.el-upload-list) {
  display: none;
}
</style>
