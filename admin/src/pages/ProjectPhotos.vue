<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Filter, Edit, View, Download } from '@element-plus/icons-vue'
import type { Photo } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const loading = ref(false)
const photos = ref<Photo[]>([])
const selectedSite = ref('all')

// 模拟数据
const mockPhotos: Photo[] = Array.from({ length: 24 }, (_, i) => ({
  id: `photo-${i + 1}`,
  projectId,
  siteId: `site-${(i % 5) + 1}`,
  originalName: `IMG_${1000 + i}.JPG`,
  fileName: `PROJ2024001_SITE${(i % 5) + 1}_${['机柜', '天线', '电源', '传输', '接地'][i % 5]}_202401${String(15 + (i % 10)).padStart(2, '0')}_${String(i + 1).padStart(3, '0')}.JPG`,
  fileUrl: `https://picsum.photos/400/300?random=${i}`,
  thumbnailUrl: `https://picsum.photos/200/150?random=${i}`,
  deviceType: ['机柜', '天线', '电源', '传输', '接地'][i % 5],
  remark: i % 3 === 0 ? '现场照片' : '',
  isManualNamed: i % 4 === 0,
  uploadedAt: new Date(2024, 0, 15 + (i % 10), 9 + (i % 8), 30).toISOString()
}))

// 站点列表
const sites = [
  { id: 'all', name: '全部站点' },
  { id: 'site-1', name: '城东区政府基站' },
  { id: 'site-2', name: '朝阳公园基站' },
  { id: 'site-3', name: '国贸大厦基站' },
  { id: 'site-4', name: '三里屯基站' },
  { id: 'site-5', name: '望京SOHO基站' }
]

// 加载照片列表
const loadPhotos = async () => {
  loading.value = true
  try {
    photos.value = mockPhotos
  } catch (error) {
    ElMessage.error('加载照片列表失败')
  } finally {
    loading.value = false
  }
}

// 返回项目详情
const goBack = () => {
  router.push(`/projects/${projectId}`)
}

onMounted(() => {
  loadPhotos()
})
</script>

<template>
  <div class="project-photos" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle @click="goBack" />
        <div class="header-info">
          <h1>照片管理</h1>
          <p>共 {{ photos.length }} 张照片</p>
        </div>
      </div>
      <div class="header-right">
        <el-select v-model="selectedSite" placeholder="选择站点" style="width: 200px">
          <el-option v-for="site in sites" :key="site.id" :label="site.name" :value="site.id" />
        </el-select>
      </div>
    </div>

    <div class="photos-grid">
      <div v-for="photo in photos" :key="photo.id" class="photo-item">
        <div class="photo-thumbnail">
          <img :src="photo.thumbnailUrl" :alt="photo.fileName" />
          <div class="photo-overlay">
            <el-button circle size="small" :icon="View" />
            <el-button circle size="small" :icon="Edit" />
            <el-button circle size="small" :icon="Download" />
          </div>
        </div>
        <div class="photo-info">
          <p class="photo-name">{{ photo.fileName }}</p>
          <div class="photo-meta">
            <el-tag v-if="photo.deviceType" size="small" type="info">{{ photo.deviceType }}</el-tag>
            <span class="photo-time">{{ new Date(photo.uploadedAt).toLocaleDateString('zh-CN') }}</span>
          </div>
        </div>
      </div>
    </div>
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
  font-size: 14px;
  color: #6b7280;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.photo-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.photo-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.photo-thumbnail {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #f3f4f6;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
  color: #374151;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.photo-time {
  font-size: 12px;
  color: #9ca3af;
}
</style>
