// 项目类型
export interface Project {
  id: string
  code: string
  name: string
  description?: string
  createdAt: string
  qrcodeUrl: string
  siteCount: number
  photoCount: number
}

// 站点类型
export interface Site {
  id: string
  projectId: string
  name: string
  code: string
  address?: string
  longitude?: number
  latitude?: number
  roomType?: string
}

// 照片类型
export interface Photo {
  id: string
  projectId: string
  siteId: string
  originalName: string
  fileName: string
  fileUrl: string
  thumbnailUrl: string
  deviceType?: string
  remark?: string
  isManualNamed: boolean
  uploadedAt: string
  // EXIF 信息
  takenAt?: string         // 拍摄时间
  latitude?: number        // 纬度
  longitude?: number       // 经度
  location?: string        // 位置描述
}

// 命名规则类型
export interface NamingRule {
  id: string
  name: string
  template: string
  isGlobal: boolean
  projectId?: string
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
