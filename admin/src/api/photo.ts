import request from '@/utils/request'
import type { Photo } from '@/types'

// 获取照片列表
export function getPhotos(projectId: string, siteId?: string) {
  let url = `/photos?projectId=${projectId}`
  if (siteId) {
    url += `&siteId=${siteId}`
  }
  return request.get<Photo[]>(url)
}

// 上传照片
export function uploadPhoto(data: FormData) {
  return request.post<Photo>('/photos', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新照片
export function updatePhoto(id: string, data: Partial<Photo>) {
  return request.put<Photo>(`/photos/${id}`, data)
}

// 删除照片
export function deletePhoto(id: string) {
  return request.delete(`/photos/${id}`)
}

// 批量更新照片
export function batchUpdatePhotos(ids: string[], data: Partial<Photo>) {
  return request.put('/photos/batch', { ids, ...data })
}
