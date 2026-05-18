<template>
  <el-container class="app-container">
    <el-aside width="240px" class="app-aside">
      <div class="logo">
        <h2>📸 勘察照片管理</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="el-menu-vertical"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409eff"
      >
        <el-menu-item index="/">
          <el-icon><Folder /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        <el-menu-item index="/settings/rules">
          <el-icon><Setting /></el-icon>
          <span>命名规则</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container class="app-main-container">
      <el-header class="app-header">
        <div class="header-content">
          <span class="breadcrumb">通信勘察照片智能整理系统</span>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.app-aside {
  background-color: #001529;
  color: #fff;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2937;
}

.logo h2 {
  font-size: 18px;
  margin: 0;
  color: #fff;
}

.el-menu-vertical {
  border-right: none;
}

.app-main-container {
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.app-main {
  background-color: #f5f7fa;
  padding: 24px;
  overflow-y: auto;
}
</style>