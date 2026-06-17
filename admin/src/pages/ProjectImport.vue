<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload, Document, Delete, Check } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const uploadFile = ref<File | null>(null)
const parsing = ref(false)
const parsedData = ref<any>(null)

const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

const parseFile = () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  parsing.value = true
  setTimeout(() => {
    parsing.value = false
    parsedData.value = {
      projectName: '某地市5G基站勘察项目',
      projectCode: 'PROJ2024001',
      sites: [
        { name: '城东区政府基站', code: 'CD-001', address: '城东区政府大楼顶楼' },
        { name: '朝阳公园基站', code: 'CD-002', address: '朝阳公园南门' },
        { name: '国贸大厦基站', code: 'CD-003', address: '国贸大厦A座28层' },
        { name: '三里屯基站', code: 'CD-004', address: '三里屯太古里北区' },
        { name: '望京SOHO基站', code: 'CD-005', address: '望京SOHO T1楼顶' }
      ]
    }
    ElMessage.success('解析成功！')
  }, 1500)
}

const confirmImport = () => {
  ElMessage.success('导入成功！')
  setTimeout(() => {
    router.push(`/projects/${projectId}`)
  }, 1000)
}

const goBack = () => {
  router.push(`/projects/${projectId}`)
}
</script>

<template>
  <div class="project-import">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle @click="goBack" />
        <div class="header-info">
          <h1>勘察报告导入</h1>
          <p>上传Word/Excel/PDF文件，自动解析项目信息和站点列表</p>
        </div>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-card class="upload-card">
          <h3>上传文件</h3>
          <el-upload
            class="upload-area"
            drag
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><upload /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 Word/Excel/PDF 格式，文件大小不超过 10MB
              </div>
            </template>
          </el-upload>
          <div v-if="uploadFile" class="file-info">
            <el-icon><Document /></el-icon>
            <span>{{ uploadFile.name }}</span>
            <el-button link type="danger" :icon="Delete" @click="uploadFile = null">移除</el-button>
          </div>
          <div class="action-buttons">
            <el-button type="primary" :loading="parsing" @click="parseFile">
              {{ parsing ? '解析中...' : '开始解析' }}
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="preview-card">
          <h3>解析预览</h3>
          <div v-if="!parsedData" class="empty-state">
            <p>请上传文件并解析后查看预览</p>
          </div>
          <div v-else class="preview-content">
            <div class="project-info">
              <div class="info-row">
                <span class="label">项目名称</span>
                <span class="value">{{ parsedData.projectName }}</span>
              </div>
              <div class="info-row">
                <span class="label">项目编号</span>
                <span class="value">{{ parsedData.projectCode }}</span>
              </div>
              <div class="info-row">
                <span class="label">站点数量</span>
                <span class="value">{{ parsedData.sites.length }} 个</span>
              </div>
            </div>
            <el-divider />
            <div class="sites-list">
              <h4>站点列表</h4>
              <div v-for="(site, index) in parsedData.sites" :key="index" class="site-item">
                <el-icon class="check-icon" color="#67c23a"><Check /></el-icon>
                <div class="site-info">
                  <div class="site-name">{{ site.name }}</div>
                  <div class="site-code">{{ site.code }} · {{ site.address }}</div>
                </div>
              </div>
            </div>
            <div class="confirm-btn">
              <el-button type="primary" size="large" @click="confirmImport">确认导入</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.project-import {
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

.upload-card h3,
.preview-card h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.upload-area {
  margin-bottom: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.file-info span {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.action-buttons {
  text-align: center;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #9ca3af;
}

.project-info {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.info-row .label {
  color: #6b7280;
  font-size: 14px;
}

.info-row .value {
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
}

.sites-list h4 {
  margin: 16px 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.site-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.site-info {
  flex: 1;
}

.site-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
}

.site-code {
  font-size: 12px;
  color: #9ca3af;
}

.confirm-btn {
  margin-top: 24px;
  text-align: center;
}
</style>
