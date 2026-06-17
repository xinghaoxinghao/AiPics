import type { Project, Site, Photo } from '@/types'
import QRCode from 'qrcode'

const STORAGE_KEYS = {
  projects: 'survey_projects',
  sites: 'survey_sites',
  photos: 'survey_photos'
}

// ---------- 通用工具 ----------
const loadFromStorage = <T>(key: string): T[] => {
  try {
    if (typeof window === 'undefined') return []
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

const saveToStorage = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(data))
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// ---------- 二维码生成 ----------
// 获取当前页面的 origin + pathname（不包含 #/hash 和 ?query），用于构造手机端URL
// - 开发环境: http://localhost:5173/
// - 生产环境: https://example.com/ 或 https://xxx-preview.trae.cn/
// 使用 window.location.origin + window.location.pathname 构造，比直接用 origin 更可靠
const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:5173'
  const origin = window.location.origin
  // pathname 可能是 "/projects/xxx" 或 "/"，取到第一个 "/" 为止的根路径
  const pathname = window.location.pathname
  // 取根路径（路径中最后一个 "/" 之前的内容）
  const rootPath = pathname.substring(0, pathname.lastIndexOf('/')) || '/'
  // 返回 origin + rootPath，但去掉尾部斜杠
  const base = (origin + rootPath).replace(/\/$/, '')
  return base || origin
}

// 生成手机端扫码 URL
// 使用当前页面的完整 origin 构造，确保在 preview/反向代理环境下也能访问
export const generateMobileUrl = (project: { id: string; name: string; code: string }): string => {
  const { id: projectId, name, code } = project
  const base = getBaseUrl()
  return `${base}/mobile/index.html?projectId=${projectId}&name=${encodeURIComponent(name)}&code=${encodeURIComponent(code)}`
}

// 生成二维码 dataURL
export const generateQRCode = async (project: { id: string; name: string; code: string }): Promise<string> => {
  try {
    const url = generateMobileUrl(project)
    return await QRCode.toDataURL(url, { width: 400, margin: 2 })
  } catch (e) {
    // 兜底：使用外部服务生成
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateMobileUrl(project))}`
  }
}

// ---------- 项目管理 ----------
export const getProjects = (): Project[] => loadFromStorage<Project>(STORAGE_KEYS.projects)

export const saveProjects = (projects: Project[]) => saveToStorage(STORAGE_KEYS.projects, projects)

export const createProject = async (
  data: Omit<Project, 'id' | 'createdAt' | 'qrcodeUrl' | 'siteCount' | 'photoCount'>
): Promise<Project> => {
  const projects = getProjects()
  const project: Project = {
    ...data,
    id: uid('proj'),
    createdAt: new Date().toISOString(),
    qrcodeUrl: '', // 先占位，后面异步生成
    siteCount: 0,
    photoCount: 0
  }
  projects.unshift(project)
  saveProjects(projects)
  // 异步生成二维码并更新
  try {
    const qrUrl = await generateQRCode(project)
    const toUpdate = getProjects()
    const idx = toUpdate.findIndex((p) => p.id === project.id)
    if (idx !== -1) {
      toUpdate[idx].qrcodeUrl = qrUrl
      saveProjects(toUpdate)
      project.qrcodeUrl = qrUrl
    }
  } catch {
    // 静默失败，使用默认占位
  }
  return project
}

export const updateProject = (id: string, patch: Partial<Project>): Project | null => {
  const projects = getProjects()
  const idx = projects.findIndex((p) => p.id === id)
  if (idx === -1) return null
  projects[idx] = { ...projects[idx], ...patch }
  saveProjects(projects)
  return projects[idx]
}

export const deleteProject = (id: string) => {
  // 删除项目、该项目的站点和照片
  const projects = getProjects().filter((p) => p.id !== id)
  saveProjects(projects)

  const sites = getSites().filter((s) => s.projectId !== id)
  saveSites(sites)

  const photos = getPhotos().filter((ph) => ph.projectId !== id)
  savePhotos(photos)
}

// 刷新单个项目的统计
export const refreshProjectCounts = (projectId: string) => {
  const siteCount = getProjectSites(projectId).length
  const photoCount = getProjectPhotos(projectId).length
  updateProject(projectId, { siteCount, photoCount })
}

// ---------- 站点管理 ----------
export const getSites = (): Site[] => loadFromStorage<Site>(STORAGE_KEYS.sites)
export const saveSites = (sites: Site[]) => saveToStorage(STORAGE_KEYS.sites, sites)

export const getProjectSites = (projectId: string): Site[] =>
  getSites().filter((s) => s.projectId === projectId)

export const createSite = (
  data: Omit<Site, 'id'> & { projectId: string }
): Site => {
  const sites = getSites()
  const site: Site = {
    ...data,
    id: uid('site')
  }
  sites.push(site)
  saveSites(sites)
  refreshProjectCounts(site.projectId)
  return site
}

export const updateSite = (id: string, patch: Partial<Site>): Site | null => {
  const sites = getSites()
  const idx = sites.findIndex((s) => s.id === id)
  if (idx === -1) return null
  sites[idx] = { ...sites[idx], ...patch }
  saveSites(sites)
  return sites[idx]
}

export const deleteSite = (id: string) => {
  const sites = getSites()
  const target = sites.find((s) => s.id === id)
  const remaining = sites.filter((s) => s.id !== id)
  saveSites(remaining)

  // 同时删除该站点下的照片
  const photos = getPhotos().filter((p) => p.siteId !== id)
  savePhotos(photos)

  if (target) refreshProjectCounts(target.projectId)
}

// ---------- 照片管理 ----------
export const getPhotos = (): Photo[] => loadFromStorage<Photo>(STORAGE_KEYS.photos)
export const savePhotos = (photos: Photo[]) => saveToStorage(STORAGE_KEYS.photos, photos)

export const getProjectPhotos = (projectId: string): Photo[] =>
  getPhotos().filter((p) => p.projectId === projectId)

export const getSitePhotos = (siteId: string): Photo[] =>
  getPhotos().filter((p) => p.siteId === siteId)

export const createPhoto = (
  data: Omit<Photo, 'id' | 'uploadedAt' | 'isManualNamed'> & { isManualNamed?: boolean }
): Photo => {
  const photos = getPhotos()
  const photo: Photo = {
    ...data,
    id: uid('photo'),
    uploadedAt: new Date().toISOString(),
    isManualNamed: data.isManualNamed ?? false
  }
  photos.push(photo)
  savePhotos(photos)
  refreshProjectCounts(photo.projectId)
  return photo
}

export const updatePhoto = (id: string, patch: Partial<Photo>): Photo | null => {
  const photos = getPhotos()
  const idx = photos.findIndex((p) => p.id === id)
  if (idx === -1) return null
  photos[idx] = { ...photos[idx], ...patch }
  savePhotos(photos)
  return photos[idx]
}

export const deletePhoto = (id: string) => {
  const photos = getPhotos()
  const target = photos.find((p) => p.id === id)
  const remaining = photos.filter((p) => p.id !== id)
  savePhotos(remaining)
  if (target) refreshProjectCounts(target.projectId)
}

// ---------- 清空所有演示数据 ----------
export const clearAllData = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.projects)
  window.localStorage.removeItem(STORAGE_KEYS.sites)
  window.localStorage.removeItem(STORAGE_KEYS.photos)
}

// ---------- 数据导出导入（手机端和PC端同步）----------
// 导出单个项目的完整数据（包含项目信息、站点、照片）
export const exportProjectData = (projectId: string): string => {
  const project = getProjects().find((p) => p.id === projectId)
  const sites = getProjectSites(projectId)
  const photos = getProjectPhotos(projectId)
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project,
      sites,
      photos
    },
    null,
    2
  )
}

// 导出单个项目数据的接口（用于手机端导出）
export interface ProjectExportData {
  version: string
  exportedAt: string
  project?: Project
  sites: Site[]
  photos: Photo[]
}

// 导入数据：将导入的数据合并到当前数据中
// - 项目：若项目ID已存在则更新名称/描述，否则新增
// - 站点：按 site.code + projectId 去重，相同则跳过
// - 照片：按 photo.id 去重（UUID不会冲突）
export const importProjectData = (json: string): {
  project: Project
  sitesAdded: number
  photosAdded: number
  sitesSkipped: number
  photosSkipped: number
} => {
  const data: ProjectExportData = JSON.parse(json)

  if (!data.sites || !data.photos) {
    throw new Error('数据格式不正确')
  }

  const projectId = data.project?.id || data.sites[0]?.projectId
  if (!projectId) throw new Error('未找到有效的项目ID')

  // 处理项目
  const projects = getProjects()
  let project = projects.find((p) => p.id === projectId)
  if (!project) {
    if (!data.project) {
      throw new Error('导入数据不含项目信息，请提供完整项目数据')
    }
    project = { ...data.project }
    projects.unshift(project)
  }
  saveProjects(projects)

  // 处理站点
  const existingSites = getProjectSites(projectId)
  const existingSiteCodes = new Set(existingSites.map((s) => s.code))
  const allSites = getSites()
  let sitesAdded = 0
  let sitesSkipped = 0
  const importedSiteIds: Record<string, string> = {} // 旧 siteId -> 新 siteId

  for (const site of data.sites) {
    if (existingSiteCodes.has(site.code)) {
      // 已存在同名站点，记录映射关系，照片迁移
      const existing = existingSites.find((s) => s.code === site.code)
      if (existing) importedSiteIds[site.id] = existing.id
      sitesSkipped++
    } else {
      const newSite: Site = {
        ...site,
        id: uid('site')
      }
      allSites.push(newSite)
      importedSiteIds[site.id] = newSite.id
      sitesAdded++
    }
  }
  saveSites(allSites)

  // 处理照片
  const existingPhotos = getProjectPhotos(projectId)
  const existingPhotoNames = new Set(
    existingPhotos.map((p) => `${p.siteId}-${p.fileName}`)
  )
  const allPhotos = getPhotos()
  let photosAdded = 0
  let photosSkipped = 0

  for (const photo of data.photos) {
    const mappedSiteId = importedSiteIds[photo.siteId] || photo.siteId
    const key = `${mappedSiteId}-${photo.fileName}`
    if (existingPhotoNames.has(key)) {
      photosSkipped++
      continue
    }
    const newPhoto: Photo = {
      ...photo,
      id: uid('photo'),
      siteId: mappedSiteId,
      projectId
    }
    allPhotos.push(newPhoto)
    photosAdded++
  }
  savePhotos(allPhotos)

  // 更新统计
  refreshProjectCounts(projectId)
  const refreshedProject = getProjects().find((p) => p.id === projectId) || project

  return {
    project: refreshedProject,
    sitesAdded,
    photosAdded,
    sitesSkipped,
    photosSkipped
  }
}

// ---------- 重新生成二维码（当域名/端口变化时）----------
export const refreshQRCode = async (project: Project): Promise<Project | null> => {
  const qrUrl = await generateQRCode(project)
  return updateProject(project.id, { qrcodeUrl })
}

// ---------- 获取单个项目的完整数据（包含项目信息、站点、照片）----------
export const getProjectData = (projectId: string): { project?: Project; sites: Site[]; photos: Photo[] } => {
  const project = getProjects().find((p) => p.id === projectId)
  const sites = getProjectSites(projectId)
  const photos = getProjectPhotos(projectId)
  return { project, sites, photos }
}
