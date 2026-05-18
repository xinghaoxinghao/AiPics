import request from '@/utils/request'
import type { Project } from '@/types'

// 获取项目列表
export function getProjects() {
  return request.get<Project[]>('/projects')
}

// 获取项目详情
export function getProject(id: string) {
  return request.get<Project>(`/projects/${id}`)
}

// 创建项目
export function createProject(data: {
  code: string
  name: string
  description?: string
}) {
  return request.post<Project>('/projects', data)
}

// 获取项目二维码
export function getProjectQrcode(id: string) {
  return request.get<string>(`/projects/${id}/qrcode`)
}
