import request from './api'

// 二手商品数据类型定义
export interface SecondhandItem {
  id: number
  sellerId: string
  title: string
  description: string
  price: string
  image: string
  images?: string[]
  status: 'available' | 'sold' | 'reserved'
  createdAt: string
  updatedAt: string
}

// 创建二手商品请求类型
export interface CreateSecondhandItemRequest {
  sellerId: string
  title: string
  description: string
  price: string
  image: string
  images?: string[]
  status?: 'available' | 'sold' | 'reserved'
}

// 更新二手商品请求类型
export interface UpdateSecondhandItemRequest {
  sellerId?: string
  title?: string
  description?: string
  price?: string
  image?: string
  status?: 'available' | 'sold' | 'reserved'
}

// 审核二手商品请求类型
export interface ReviewSecondhandItemRequest {
  reviewerId: string
  approved: boolean
  reason: string
}

// 二手商品API服务
export const secondhandApi = {
  // 获取所有二手商品
  getAllItems: (): Promise<SecondhandItem[]> => {
    return request({
      url: '/secondhand',
      method: 'GET'
    })
  },

  // 根据ID获取二手商品
  getItemById: (id: number): Promise<SecondhandItem> => {
    return request({
      url: `/secondhand/${id}`,
      method: 'GET'
    })
  },

  // 创建新的二手商品
  createItem: (data: CreateSecondhandItemRequest): Promise<SecondhandItem> => {
    return request({
      url: '/secondhand',
      method: 'POST',
      data
    })
  },

  // 更新二手商品
  updateItem: (id: number, data: UpdateSecondhandItemRequest): Promise<SecondhandItem> => {
    return request({
      url: `/secondhand/${id}`,
      method: 'PUT',
      data
    })
  },

  // 删除二手商品
  deleteItem: (id: number): Promise<{ message: string }> => {
    return request({
      url: `/secondhand/${id}`,
      method: 'DELETE'
    })
  },

  // 审核二手商品
  reviewItem: (id: number, data: ReviewSecondhandItemRequest): Promise<SecondhandItem> => {
    return request({
      url: `/secondhand/${id}/review`,
      method: 'PUT',
      data
    })
  },

  // 获取用户的二手商品
  getUserItems: (userId: number): Promise<SecondhandItem[]> => {
    return request({
      url: `/users/${userId}/secondhand`,
      method: 'GET'
    })
  },

} 