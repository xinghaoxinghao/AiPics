<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const loading = ref(false)
const generating = ref(false)

const form = ref({
  includeLogo: true,
  photosPerPage: 4,
  includeAllSites: true,
  selectedSites: [] as string[],
  includeCover: true,
  includeAppendix: true
})

const sites = [
  { id: 'site-1', name: '城东区政府基站' },
  { id: 'site-2', name: '朝阳公园基站' },
  { id: 'site-3', name: '国贸大厦基站' },
  { id: 'site-4', name: '三里屯基站' },
  { id: 'site-5', name: '望京SOHO基站' }
]

const generatePPT = () => {
  generating.value = true
  setTimeout(() => {
    generating.value = false
    ElMessage.success('PPT生成成功！')
  }, 2000)
}

const goBack = () => {
  router.push(`/projects/${projectId}`)
}
</script>

<template>
  <div class="project-ppt">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle @click="goBack" />
        <div class="header-info">
          <h1>生成PPT报告</h1>
          <p>一键生成包含封面、站点照片和附录的PPT文件</p>
        </div>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col :span="16">
        <el-card class="config-card">
          <h3>报告配置</h3>
          <el-form label-position="top">
            <el-form-item label="每页照片数量">
              <el-radio-group v-model="form.photosPerPage">
                <el-radio :label="2">2张</el-radio>
                <el-radio :label="4">4张</el-radio>
                <el-radio :label="6">6张</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="站点选择">
              <el-checkbox v-model="form.includeAllSites">包含所有站点</el-checkbox>
            </el-form-item>
            <el-form-item v-if="!form.includeAllSites" label="选择站点">
              <el-checkbox-group v-model="form.selectedSites">
                <el-checkbox v-for="site in sites" :key="site.id" :label="site.id">{{ site.name }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-divider />
            <el-form-item label="其他选项">
              <el-checkbox v-model="form.includeCover">包含封面</el-checkbox>
              <el-checkbox v-model="form.includeLogo">包含Logo</el-checkbox>
              <el-checkbox v-model="form.includeAppendix">包含附录表格</el-checkbox>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="preview-card">
          <h3>报告预览</h3>
          <div class="preview-content">
            <div class="preview-item cover">
              <div class="preview-title">封面页</div>
              <div class="preview-desc">项目名称、日期、Logo</div>
            </div>
            <div class="preview-item">
              <div class="preview-title">站点照片页</div>
              <div class="preview-desc">每页{{ form.photosPerPage }}张照片，标注设备类型</div>
            </div>
            <div class="preview-item">
              <div class="preview-title">附录表格</div>
              <div class="preview-desc">照片清单汇总</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="action-bar">
      <el-button type="primary" :icon="Download" :loading="generating" size="large" @click="generatePPT">
        {{ generating ? '正在生成...' : '生成PPT报告' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.project-ppt {
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

.config-card h3,
.preview-card h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.preview-item.cover {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f7ff 100%);
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.preview-desc {
  font-size: 13px;
  color: #6b7280;
}

.action-bar {
  margin-top: 24px;
  text-align: center;
}
</style>
