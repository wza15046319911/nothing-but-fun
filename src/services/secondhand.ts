import request from './api'

// 二手商品数据类型定义 - 更新以匹配后端schema
export interface SecondhandItem {
  id: number
  sellerId?: number | string  // 支持新旧格式
  title: string
  description: string
  price: number | string  // 后端使用integer，但支持字符串兼容性
  image?: string  // Legacy field for backward compatibility
  images?: string[]  // Legacy field for backward compatibility
  imageUrls: string[]  // 主要图片字段，来自关联表
  status?: 'available' | 'sold' | 'reserved'
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviewReason?: string
  reviewedAt?: string
  dateCreated: string  // 后端schema字段名
  dateUpdated?: string  // 后端schema字段名
  createdAt?: string  // Legacy field for backward compatibility
  updatedAt?: string  // Legacy field for backward compatibility
  sellerName?: string | null
  sellerContact?: string | null
  sellerAvatar?: string | null
  categoryName?: string | null
  categoryRid?: number  // 分类ID
}

// 创建二手商品请求类型 - 更新以匹配后端API
export interface CreateSecondhandItemRequest {
  sellerId?: number
  title: string
  description?: string
  price: string | number
  images?: string[]  // Directus文件ID数组
  status?: 'available' | 'sold' | 'reserved'
  categoryRid?: number  // 分类ID
}

// 创建带图片的二手商品请求类型 - 更新以匹配后端API
export interface CreateSecondhandItemWithImagesRequest {
  sellerId?: number
  title: string
  description?: string
  price: string | number
  status?: 'available' | 'sold' | 'reserved'
  categoryRid?: number  // 分类ID
}

// API响应接口
export interface CreateItemWithImagesResponse {
  success: boolean
  message: string
  data: {
    id: number
    uploadedFiles: number
  }
}

// 更新二手商品请求类型 - 更新以匹配后端API
export interface UpdateSecondhandItemRequest {
  id?: number  // 商品ID，用于更新操作
  sellerId?: number | string
  title?: string
  description?: string
  price?: string | number
  image?: string  // Legacy field
  images?: string[]  // Directus文件ID数组
  status?: 'available' | 'sold' | 'reserved'
  categoryRid?: number  // 分类ID
}

// 审核二手商品请求类型
export interface ReviewSecondhandItemRequest {
  reviewerId: string
  approved: boolean
  reason: string
}

// 二手商品分类接口
export interface SecondhandCategory {
  id: number
  name: string
}

// 二手商品筛选参数接口
export interface SecondhandFilters {
  priceFrom?: number
  priceTo?: number
  keyword?: string
  categoryId?: number
  page?: number
  limit?: number
}

// 分页响应接口
export interface PaginatedSecondhandResponse {
  data: SecondhandItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 二手商品API服务
export const secondhandApi = {
  // 获取所有二手商品（支持筛选和分页）
  getAllItems: async (filters?: SecondhandFilters): Promise<PaginatedSecondhandResponse> => {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()

      if (filters?.priceFrom !== undefined) {
        queryParams.append('priceFrom', filters.priceFrom.toString())
      }
      if (filters?.priceTo !== undefined) {
        queryParams.append('priceTo', filters.priceTo.toString())
      }
      if (filters?.keyword) {
        queryParams.append('keyword', filters.keyword)
      }
      if (filters?.categoryId !== undefined) {
        queryParams.append('categoryId', filters.categoryId.toString())
      }
      if (filters?.page !== undefined) {
        queryParams.append('page', filters.page.toString())
      }
      if (filters?.limit !== undefined) {
        queryParams.append('limit', filters.limit.toString())
      }

      const url = queryParams.toString() ? `/secondhand?${queryParams.toString()}` : '/secondhand'

      const response = await request({
        url,
        method: 'GET'
      })
      console.log("response secondhand is ::", response);
      // 检查响应格式 - 后端返回的格式是 { data: SecondhandItem[], total, page, limit, totalPages }
      if (response && typeof response === 'object' && 'data' in response && 'total' in response) {
        
        return response as PaginatedSecondhandResponse
      }
      // 如果是简单数组格式，包装成分页响应
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1
        } as PaginatedSecondhandResponse
      }

      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      } as PaginatedSecondhandResponse
    } catch (error) {
      console.error('获取二手商品列表失败:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      } as PaginatedSecondhandResponse
    }
  },

  // 获取所有二手商品（简化版本，保持向后兼容）
  getAllItemsSimple: async (): Promise<SecondhandItem[]> => {
    const result = await secondhandApi.getAllItems()
    return result.data
  },

  // 根据ID获取二手商品
  getItemById: (id: number): Promise<SecondhandItem> => {
    return request({
      url: `/secondhand/${id}`,
      method: 'GET'
    })
  },

  // 创建新的二手商品（不带图片）
  createItem: (data: CreateSecondhandItemRequest): Promise<SecondhandItem> => {
    return request({
      url: '/secondhand',
      method: 'POST',
      data
    })
  },

  // 创建带多图片的二手商品 - 使用 /secondhand/with-images 接口
  createItemWithImages: async (
    _data: CreateSecondhandItemWithImagesRequest
  ): Promise<CreateItemWithImagesResponse> => {
    // 注意：这个方法需要在调用时配合 Taro.uploadFile 使用
    // 因为需要上传文件，不能直接用 request 函数
    throw new Error('请使用 Taro.uploadFile 直接调用 /secondhand/with-images 接口')
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
  getUserItems: (userId: string): Promise<SecondhandItem[]> => {
    return request({
      url: `/secondhand/user/${userId}`,
      method: 'GET'
    })
  },

  // 基于用户的更新二手商品
  // 后端路由: PUT /secondhand/user/:userId
  // 约定: 在请求体中传递 itemId 以及需要更新的字段
  updateUserItem: (
    userId: string,
    itemId: number,
    data: UpdateSecondhandItemRequest & { images?: string[] }
  ): Promise<SecondhandItem> => {
    return request({
      url: `/secondhand/user/${userId}`,
      method: 'PUT',
      data: { itemId, ...data }
    })
  },

  // 基于用户的删除二手商品
  // 后端路由: DELETE /secondhand/user/:userId
  // 约定: 在请求体中传递 itemId
  deleteUserItem: (
    userId: string,
    itemId: number
  ): Promise<{ message: string }> => {
    return request({
      url: `/secondhand/user/${userId}`,
      method: 'DELETE',
      data: { itemId }
    })
  },

  // 获取所有二手商品分类
  getAllCategories: async (): Promise<SecondhandCategory[]> => {
    try {
      const response = await request({
        url: '/secondhand/categories',
        method: 'GET'
      })

      if (response && typeof response === 'object' && 'success' in response && response.success) {
        return response.data as SecondhandCategory[]
      }

      return []
    } catch (error) {
      console.error('获取二手商品分类失败:', error)
      return []
    }
  },

} 