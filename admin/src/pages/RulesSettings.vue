<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { NamingRule } from '@/types'

const loading = ref(false)
const rules = ref<NamingRule[]>([])
const dialogVisible = ref(false)
const editingRule = ref<NamingRule | null>(null)

const mockRules: NamingRule[] = [
  { id: 'rule-1', name: '默认规则', template: '{project_code}_{site_code}_{device_type}_{date}_{sequence}', isGlobal: true },
  { id: 'rule-2', name: '简化规则', template: '{project_code}_{site_code}_{sequence}', isGlobal: true }
]

const loadRules = async () => {
  loading.value = true
  try {
    rules.value = mockRules
  } catch (error) {
    ElMessage.error('加载规则失败')
  } finally {
    loading.value = false
  }
}

const createRule = () => {
  editingRule.value = { id: '', name: '', template: '{project_code}_{site_code}_{device_type}_{date}_{sequence}', isGlobal: true }
  dialogVisible.value = true
}

const editRule = (rule: NamingRule) => {
  editingRule.value = { ...rule }
  dialogVisible.value = true
}

const deleteRule = (rule: NamingRule) => {
  ElMessage.warning('删除功能待实现')
}

const saveRule = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
}

const copyVariable = (key: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(`{${key}}`)
    ElMessage.success(`已复制 {${key}}`)
  }
}

const variables = [
  { key: 'project_code', desc: '项目编号' },
  { key: 'site_code', desc: '站点编号' },
  { key: 'device_type', desc: '设备类型' },
  { key: 'date', desc: '日期(YYYYMMDD)' },
  { key: 'time', desc: '时间(HHMMSS)' },
  { key: 'sequence', desc: '序号' }
]

onMounted(() => {
  loadRules()
})
</script>

<template>
  <div class="rules-settings">
    <div class="page-header">
      <h1>命名规则配置</h1>
      <el-button type="primary" :icon="Plus" @click="createRule">新建规则</el-button>
    </div>

    <el-card class="variables-card">
      <h3>可用变量</h3>
      <div class="variables-grid">
        <div v-for="v in variables" :key="v.key" class="variable-item" @click="copyVariable(v.key)">
          <code>{ {{ v.key }} }</code>
          <span>{{ v.desc }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="rules-card" style="margin-top: 20px">
      <el-table :data="rules" style="width: 100%">
        <el-table-column prop="name" label="规则名称" width="200" />
        <el-table-column prop="template" label="命名模板">
          <template #default="{ row }">
            <code class="template-code">{{ row.template }}</code>
          </template>
        </el-table-column>
        <el-table-column label="范围" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isGlobal ? 'primary' : 'info'" size="small">
              {{ row.isGlobal ? '全局' : '项目' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" size="small" @click="editRule(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" size="small" @click="deleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingRule?.id ? '编辑规则' : '新建规则'" width="600px">
      <el-form label-position="top">
        <el-form-item label="规则名称">
          <el-input v-model="editingRule.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="命名模板">
          <el-input v-model="editingRule.template" type="textarea" :rows="3" placeholder="请输入命名模板" />
        </el-form-item>
        <el-form-item label="适用范围">
          <el-radio-group v-model="editingRule.isGlobal">
            <el-radio :label="true">全局规则</el-radio>
            <el-radio :label="false">项目规则</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.rules-settings {
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

.variables-card h3,
.rules-card h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.variable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.variable-item:hover {
  background: #f0f7ff;
}

.variable-item code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.variable-item span {
  font-size: 13px;
  color: #6b7280;
}

.template-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #374151;
  background: #f9fafb;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
