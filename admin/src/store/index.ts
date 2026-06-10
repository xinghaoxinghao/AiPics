import type { Project, Site, Photo } from '@/types'

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

// ---------- 项目管理 ----------
export const getProjects = (): Project[] => loadFromStorage<Project>(STORAGE_KEYS.projects)

export const saveProjects = (projects: Project[]) => saveToStorage(STORAGE_KEYS.projects, projects)

export const createProject = (
  data: Omit<Project, 'id' | 'createdAt' | 'qrcodeUrl' | 'siteCount' | 'photoCount'>
): Project => {
  const projects = getProjects()
  const project: Project = {
    ...data,
    id: uid('proj'),
    createdAt: new Date().toISOString(),
    qrcodeUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
    siteCount: 0,
    photoCount: 0
  }
  projects.unshift(project)
  saveProjects(projects)
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
