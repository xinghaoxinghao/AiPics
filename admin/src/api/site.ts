import request from '@/utils/request'
import type { Site } from '@/types'

// 获取站点列表
export function getSites(projectId: string) {
  return request.get<Site[]>(`/sites?projectId=${projectId}`)
}

// 创建站点
export function createSite(data: Omit<Site, 'id'>) {
  return request.post<Site>('/sites', data)
}

// 更新站点
export function updateSite(id: string, data: Partial<Site>) {
  return request.put<Site>(`/sites/${id}`, data)
}

// 删除站点
export function deleteSite(id: string) {
  return request.delete(`/sites/${id}`)
}
