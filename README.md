# 通信勘察照片智能整理系统

一个面向通信工程勘察场景的全流程照片管理解决方案，支持扫码即用、智能命名、批量整理和PPT报告自动生成。

## 技术栈

### 前端
- **网页管理端**: Vue 3 + TypeScript + Element Plus + Vite + Tailwind CSS
- **手机H5上传端**: 原生 JavaScript + IndexedDB

### 后端
- **框架**: Spring Boot 3.x + Java 21
- **ORM**: MyBatis Plus
- **数据库**: MySQL 8.0

## 项目结构

```
/workspace
├── admin/                 # 网页管理端（Vue3）
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 通用组件
│   │   ├── api/          # API 封装
│   │   ├── types/        # TypeScript 类型
│   │   └── utils/        # 工具函数
│   └── package.json
├── backend/              # 后端服务（Spring Boot）
│   ├── src/main/java/com/survey/photo/
│   │   ├── controller/   # API 控制器
│   │   ├── service/      # 业务逻辑
│   │   ├── repository/   # 数据访问
│   │   └── model/        # 实体类
│   └── pom.xml
├── mobile/               # 手机H5上传端
│   └── index.html
├── database/             # 数据库脚本
│   └── init.sql
└── .trae/documents/      # 项目文档
```

## 核心功能

### 1. 网页管理端
- **项目管理**: 创建项目、生成二维码、查看项目概览
- **勘察报告导入**: Word/Excel/PDF 解析，自动提取站点信息
- **站点管理**: 站点列表、批量导入、扩展信息编辑
- **照片管理**: 按站点分组、缩略图预览、批量操作
- **命名规则配置**: 全局和项目级命名模板
- **PPT报告生成**: 一键生成含封面、照片网格、附录的 PPTX

### 2. 手机H5上传端
- **扫码进入**: 扫描项目二维码自动加载信息
- **拍照上传**: 调用系统相机或相册，支持多选
- **智能命名**: AI识别设备类型，自动生成规范文件名
- **离线缓存**: 无网络时暂存本地，恢复后自动续传

## 快速开始

### 启动前端开发服务器
```bash
cd /workspace/admin
npm install
npm run dev
```
访问 http://localhost:5173

### 手机 H5
直接在浏览器中打开 `/workspace/mobile/index.html`

### 后端服务
```bash
cd /workspace/backend
mvn spring-boot:run
```
默认运行在 http://localhost:8080

### 数据库初始化
执行 `/workspace/database/init.sql` 脚本

## 主要页面

- `/` - 项目列表首页
- `/projects/:id` - 项目详情页
- `/projects/:id/import` - 勘察报告导入
- `/projects/:id/sites` - 站点管理
- `/projects/:id/photos` - 照片管理
- `/settings/rules` - 命名规则配置
- `/projects/:id/ppt` - PPT报告生成

## API 端点

- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/sites?projectId=xxx` - 获取站点列表
- `GET /api/photos?projectId=xxx` - 获取照片列表
- `POST /api/photos` - 上传照片
- `GET /api/naming-rules` - 获取命名规则

## 数据库设计

### projects 表
项目信息，包含项目编号、名称、描述等

### sites 表
站点信息，关联项目，支持地址、经纬度、机房类型等

### photos 表
照片信息，记录原始文件名、规范文件名、设备类型、备注等

### naming_rules 表
命名规则，支持全局和项目级规则

## 特性亮点

1. **扫码即用** - 无需安装APP，扫描项目二维码即可上传
2. **智能命名** - 前端AI离线识别设备类型，规范命名提升80%效率
3. **全流程数据贯通** - 从报告导入到PPT生成，无缝衔接
4. **离线缓存** - 手机端支持无网络上传，恢复后自动续传
5. **批量处理** - 网页端支持批量操作，后期整理效率高

## 开发说明

本项目为演示版本，包含完整的项目结构和UI交互，数据使用模拟数据演示功能效果。
