// DEPRECATED: Carpool schema removed from database
// TODO: Remove these files if no longer needed

/*
import request from './api'

// 拼车信息接口
export interface CarpoolPost {
  id: number
  userId: number
  origin: string
  destination: string
  departureTime: string
  availableSeats: number
  price: string
  description?: string
  carDetails?: string
  insured?: boolean
  status: 'open' | 'full' | 'completed' | 'cancelled'
  // 审核字段（后端提供）
  reviewStatus?: 'pending' | 'approved' | 'rejected'
  reviewReason?: string
  createdAt: string
}

// 拼车查询参数接口
export interface CarpoolQueryParams {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'departureTime' | 'price' | 'availableSeats'
  order?: 'asc' | 'desc'
}

// 分页拼车响应接口
export interface PaginatedCarpoolResponse {
  data: CarpoolPost[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 创建拼车信息接口
export interface CreateCarpoolPost {
  userId: number
  origin: string
  destination: string
  departureTime: string
  availableSeats: number
  price: string
  description?: string
  carDetails?: string
  insured?: boolean
}

// 拼车API服务
export const carpoolApi = {
  // 获取所有拼车信息（支持分页和排序）
  getAllCarpools: async (params?: CarpoolQueryParams): Promise<PaginatedCarpoolResponse> => {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()
      
      if (params?.page !== undefined) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit !== undefined) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.sortBy !== undefined) {
        queryParams.append('sortBy', params.sortBy)
      }
      if (params?.order !== undefined) {
        queryParams.append('order', params.order)
      }

      const url = queryParams.toString() ? `/carpools?${queryParams.toString()}` : '/carpools'
      
      const response = await request({
        url,
        method: 'GET'
      })
      // 检查响应格式 - 后端返回的格式是 { data: CarpoolPost[], pagination: {...} }
      if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
        return response as PaginatedCarpoolResponse
      }

      // 如果是简单数组格式，包装成分页响应
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            page: 1,
            limit: response.length,
            total: response.length,
            totalPages: 1
          }
        } as PaginatedCarpoolResponse
      }

      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      } as PaginatedCarpoolResponse
    } catch (error) {
      console.error('获取拼车信息失败:', error)
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      } as PaginatedCarpoolResponse
    }
  },

  // 根据 OpenID 获取用户发布的拼车信息
  getCarpoolsByOpenId: async (openid: string): Promise<CarpoolPost[]> => {
    try {
      const response = await request({
        url: `/carpools/user/${openid}`,
        method: 'GET'
      })
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: CarpoolPost[] }).data || []
      }
      // 兼容直接返回数组的情况
      if (Array.isArray(response)) {
        return response as CarpoolPost[]
      }
      return []
    } catch (error) {
      console.error('根据 OpenID 获取拼车信息失败:', error)
      return []
    }
  },

  // 根据ID获取拼车信息
  getCarpoolById: async (id: number): Promise<CarpoolPost | null> => {
    try {
      const response = await request({
        url: `/carpools/${id}`,
        method: 'GET'
      })
      
      return response as CarpoolPost || null
    } catch (error) {
      console.error('获取拼车详情失败:', error)
      return null
    }
  },

  // 创建拼车信息
  createCarpool: async (userId: number, data: Omit<CreateCarpoolPost, 'userId'>): Promise<CarpoolPost | null> => {
    try {
      const requestData = {
        userId,
        ...data
      }

      const response = await request({
        url: `/carpools/${userId}`,
        method: 'POST',
        data: requestData
      })

      if (!response) {
        throw new Error('No response received from server')
      }

      return response as CarpoolPost
    } catch (error) {
      console.error('创建拼车信息失败:', error)

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to create carpool: ${error.message}`)
      } else {
        throw new Error('Failed to create carpool: Unknown error')
      }
    }
  },

  // 更新拼车信息
  updateCarpool: async (userId: number, id: number, data: Partial<CreateCarpoolPost>): Promise<CarpoolPost | null> => {
    try {
      const response = await request({
        url: `/carpools/${userId}/${id}`,
        method: 'PUT',
        data
      })
      
      return response as CarpoolPost || null
    } catch (error) {
      console.error('更新拼车信息失败:', error)
      throw error
    }
  },
  // 根据 OpenID 更新拼车信息
  updateCarpoolByOpenId: async (openid: string, id: number, data: Partial<CreateCarpoolPost>): Promise<CarpoolPost | null> => {
    try {
      const response = await request({
        url: `/carpools/user/${openid}/${id}`,
        method: 'PUT',
        data
      })
      return response as CarpoolPost || null
    } catch (error) {
      console.error('根据 OpenID 更新拼车信息失败:', error)
      throw error
    }
  },

  // 删除拼车信息
  deleteCarpool: async (userId: number, id: number): Promise<boolean> => {
    try {
      await request({
        url: `/carpools/${userId}/${id}`,
        method: 'DELETE'
      })
      
      return true
    } catch (error) {
      console.error('删除拼车信息失败:', error)
      throw error
    }
  },
  // 根据 OpenID 删除拼车信息
  deleteCarpoolByOpenId: async (openid: string, id: number): Promise<boolean> => {
    try {
      await request({
        url: `/carpools/user/${openid}/${id}`,
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error('根据 OpenID 删除拼车信息失败:', error)
      throw error
    }
  }
}

// 格式化价格显示
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (numPrice === 0) return '免费'
  return `$${numPrice.toFixed(2)}`
}

// 格式化时间显示
export const formatDateTime = (dateTimeStr: string): { date: string, time: string } => {
  const date = new Date(dateTimeStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  let dateStr = ''
  if (targetDate.getTime() === today.getTime()) {
    dateStr = '今天'
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    dateStr = '明天'
  } else {
    dateStr = `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

  return { date: dateStr, time: timeStr }
}

// 获取状态显示文本
export const getStatusText = (status: CarpoolPost['status']): string => {
  const statusMap = {
    'open': '可预订',
    'full': '已满员',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态样式类名
export const getStatusClassName = (status: CarpoolPost['status']): string => {
  const classMap = {
    'open': 'status-open',
    'full': 'status-full',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classMap[status] || 'status-unknown'
}
*/
