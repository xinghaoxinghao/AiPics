<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Edit, Delete, Upload, Search } from '@element-plus/icons-vue'
import type { Site } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const loading = ref(false)
const sites = ref<Site[]>([])

// 模拟数据
const mockSites: Site[] = [
  { id: 'site-001', projectId, name: '城东区政府基站', code: 'CD-001', address: '城东区政府大楼顶楼', longitude: 116.404, latitude: 39.915, roomType: '室外抱杆' },
  { id: 'site-002', projectId, name: '朝阳公园基站', code: 'CD-002', address: '朝阳公园南门', longitude: 116.488, latitude: 39.934, roomType: '室外机柜' },
  { id: 'site-003', projectId, name: '国贸大厦基站', code: 'CD-003', address: '国贸大厦A座28层', longitude: 116.46, latitude: 39.909, roomType: '室内机房' },
  { id: 'site-004', projectId, name: '三里屯基站', code: 'CD-004', address: '三里屯太古里北区', longitude: 116.452, latitude: 39.936, roomType: '室内机房' },
  { id: 'site-005', projectId, name: '望京SOHO基站', code: 'CD-005', address: '望京SOHO T1楼顶', longitude: 116.479, latitude: 39.995, roomType: '室外抱杆' }
]

// 加载站点列表
const loadSites = async () => {
  loading.value = true
  try {
    sites.value = mockSites
  } catch (error) {
    ElMessage.error('加载站点列表失败')
  } finally {
    loading.value = false
  }
}

// 删除站点
const handleDelete = (site: Site) => {
  ElMessageBox.confirm(`确定要删除站点 "${site.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
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
          <p>管理项目下的所有站点</p>
        </div>
      </div>
      <div class="header-right">
        <el-button :icon="Upload">批量导入</el-button>
        <el-button type="primary" :icon="Plus">新建站点</el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="sites" style="width: 100%">
        <el-table-column prop="code" label="站点编号" width="140" />
        <el-table-column prop="name" label="站点名称" min-width="180" />
        <el-table-column prop="address" label="地址" min-width="250" />
        <el-table-column prop="roomType" label="机房类型" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" size="small">编辑</el-button>
            <el-button link type="danger" :icon="Delete" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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
  font-size: 14px;
  color: #6b7280;
}

.header-right {
  display: flex;
  gap: 12px;
}
</style>
