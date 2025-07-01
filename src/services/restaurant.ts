import request from './api'

// 餐厅数据类型
export interface Restaurant {
  id: number
  name: string
  description: string
  image: string
  streetAddress: string
  suburb: string
  postcode: string
  state: string
  overallRating: string
  totalReviews: number
  createdAt: string
  updatedAt: string
}

// 餐厅评论数据类型
export interface RestaurantReview {
  id: number
  restaurantId: number
  userId: number
  username: string
  content: string
  rating: number
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: number
  moderatedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  restaurantName?: string
  restaurantImage?: string
}

// 餐厅查询参数接口
export interface RestaurantQueryParams {
  page?: number
  limit?: number
  sortBy?: 'name' | 'overallRating' | 'totalReviews' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  name?: string
  suburb?: string
  minRating?: number
}

// 评论查询参数接口
export interface ReviewQueryParams {
  page?: number
  limit?: number
  sortBy?: 'rating' | 'createdAt' | 'moderatedAt'
  sortOrder?: 'asc' | 'desc'
  restaurantId?: number
  userId?: number
  minRating?: number
  maxRating?: number
  status?: 'pending' | 'approved' | 'rejected'
}

// API响应接口
export interface RestaurantResponse {
  success: boolean
  message: string
  data: Restaurant[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SingleRestaurantResponse {
  success: boolean
  message: string
  data: Restaurant
}

export interface ReviewResponse {
  success: boolean
  message: string
  data: RestaurantReview[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SingleReviewResponse {
  success: boolean
  message: string
  data: RestaurantReview
}

export interface ReviewStatsResponse {
  success: boolean
  message: string
  data: {
    totalReviews: number
    averageRating: number
    ratingDistribution: {
      [key: string]: number
    }
  }
}

// 餐厅API
export const restaurantApi = {
  // 获取所有餐厅
  getAllRestaurants: async (params?: RestaurantQueryParams): Promise<RestaurantResponse> => {
    try {
      const queryString = params ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      
      const response = await request({
        url: `/restaurants${queryString}`,
        method: 'GET'
      }) as RestaurantResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取餐厅列表失败:', error)
      // 返回模拟数据用于展示
      return {
        success: true,
        message: '获取餐厅列表成功（模拟数据）',
        data: getMockRestaurants(),
        pagination: {
          page: 1,
          limit: 10,
          total: 8,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  },

  // 根据ID获取单个餐厅
  getRestaurantById: async (id: number): Promise<Restaurant | null> => {
    try {
      const response = await request({
        url: `/restaurants/${id}`,
        method: 'GET'
      }) as SingleRestaurantResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取餐厅详情失败:', error)
      // 返回模拟数据
      const mockRestaurants = getMockRestaurants()
      return mockRestaurants.find(restaurant => restaurant.id === id) || null
    }
  },

  // 创建新餐厅
  createRestaurant: async (restaurantData: Omit<Restaurant, 'id' | 'overallRating' | 'totalReviews' | 'createdAt' | 'updatedAt'>): Promise<Restaurant | null> => {
    try {
      const response = await request({
        url: '/restaurants',
        method: 'POST',
        data: restaurantData
      }) as SingleRestaurantResponse
      
      return response?.data || null
    } catch (error) {
      console.error('创建餐厅失败:', error)
      throw error
    }
  },

  // 更新餐厅
  updateRestaurant: async (id: number, restaurantData: Partial<Omit<Restaurant, 'id' | 'overallRating' | 'totalReviews' | 'createdAt' | 'updatedAt'>>): Promise<Restaurant | null> => {
    try {
      const response = await request({
        url: `/restaurants/${id}`,
        method: 'PUT',
        data: restaurantData
      }) as SingleRestaurantResponse
      
      return response?.data || null
    } catch (error) {
      console.error('更新餐厅失败:', error)
      throw error
    }
  },

  // 删除餐厅
  deleteRestaurant: async (id: number): Promise<boolean> => {
    try {
      const response = await request({
        url: `/restaurants/${id}`,
        method: 'DELETE'
      })
      
      return response?.success || false
    } catch (error) {
      console.error('删除餐厅失败:', error)
      throw error
    }
  },

  // 根据区域获取餐厅
  getRestaurantsBySuburb: async (suburb: string): Promise<Restaurant[]> => {
    try {
      const response = await request({
        url: `/restaurants/suburb/${encodeURIComponent(suburb)}`,
        method: 'GET'
      }) as RestaurantResponse
      
      return response?.data || []
    } catch (error) {
      console.error('根据区域获取餐厅失败:', error)
      return []
    }
  },

  // 搜索餐厅
  searchRestaurants: async (keyword: string): Promise<Restaurant[]> => {
    try {
      const response = await request({
        url: `/restaurants/search/${encodeURIComponent(keyword)}`,
        method: 'GET'
      }) as RestaurantResponse
      
      return response?.data || []
    } catch (error) {
      console.error('搜索餐厅失败:', error)
      return []
    }
  },

  // 获取热门餐厅
  getTopRatedRestaurants: async (limit: number = 10): Promise<Restaurant[]> => {
    try {
      const response = await request({
        url: `/restaurants/top-rated?limit=${limit}`,
        method: 'GET'
      }) as RestaurantResponse
      
      return response?.data || []
    } catch (error) {
      console.error('获取热门餐厅失败:', error)
      return []
    }
  }
}

// 餐厅评论API
export const restaurantReviewApi = {
  // 获取所有评论
  getAllReviews: async (params?: ReviewQueryParams): Promise<ReviewResponse> => {
    try {
      const queryString = params ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      
      const response = await request({
        url: `/restaurant-reviews${queryString}`,
        method: 'GET'
      }) as ReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取评论列表失败:', error)
      // 返回模拟数据用于展示
      return {
        success: true,
        message: '获取评论列表成功（模拟数据）',
        data: getMockReviews(),
        pagination: {
          page: 1,
          limit: 10,
          total: 14,
          totalPages: 2,
          hasNext: true,
          hasPrev: false
        }
      }
    }
  },

  // 根据ID获取单个评论
  getReviewById: async (id: number): Promise<RestaurantReview | null> => {
    try {
      const response = await request({
        url: `/restaurant-reviews/${id}`,
        method: 'GET'
      }) as SingleReviewResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取评论详情失败:', error)
      // 返回模拟数据
      const mockReviews = getMockReviews()
      return mockReviews.find(review => review.id === id) || null
    }
  },

  // 根据餐厅获取评论
  getReviewsByRestaurant: async (restaurantId: number, params?: Omit<ReviewQueryParams, 'restaurantId'>): Promise<ReviewResponse> => {
    try {
      const queryString = params ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      
      const response = await request({
        url: `/restaurant-reviews/restaurant/${restaurantId}${queryString}`,
        method: 'GET'
      }) as ReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('根据餐厅获取评论失败:', error)
      // 返回模拟数据，根据餐厅ID筛选
      const mockReviews = getMockReviews()
      const filteredReviews = mockReviews.filter(review => review.restaurantId === restaurantId)
      return {
        success: true,
        message: '获取餐厅评论成功（模拟数据）',
        data: filteredReviews,
        pagination: {
          page: 1,
          limit: 10,
          total: filteredReviews.length,
          totalPages: Math.ceil(filteredReviews.length / 10),
          hasNext: false,
          hasPrev: false
        }
      }
    }
  },

  // 获取餐厅已审核通过的评论（公开展示用）
  getApprovedReviewsByRestaurant: async (restaurantId: number, params?: Omit<ReviewQueryParams, 'restaurantId' | 'status'>): Promise<ReviewResponse> => {
    try {
      const queryString = params ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      
      const response = await request({
        url: `/restaurant-reviews/restaurant/${restaurantId}/approved${queryString}`,
        method: 'GET'
      }) as ReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取餐厅已审核评论失败:', error)
      // 返回模拟数据，只返回已审核通过的评论
      const mockReviews = getMockReviews()
      const approvedReviews = mockReviews.filter(review => 
        review.restaurantId === restaurantId && review.status === 'approved'
      )
      return {
        success: true,
        message: '获取餐厅已审核评论成功（模拟数据）',
        data: approvedReviews,
        pagination: {
          page: 1,
          limit: 10,
          total: approvedReviews.length,
          totalPages: Math.ceil(approvedReviews.length / 10),
          hasNext: false,
          hasPrev: false
        }
      }
    }
  },

  // 根据用户获取评论
  getReviewsByUser: async (userId: number, params?: Omit<ReviewQueryParams, 'userId'>): Promise<ReviewResponse> => {
    try {
      const queryString = params ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      
      const response = await request({
        url: `/restaurant-reviews/user/${userId}${queryString}`,
        method: 'GET'
      }) as ReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('根据用户获取评论失败:', error)
      return { success: false, message: '获取数据失败', data: [] }
    }
  },

  // 创建新评论（默认状态为pending，需要审核）
  createReview: async (reviewData: Omit<RestaurantReview, 'id' | 'status' | 'moderatedBy' | 'moderatedAt' | 'rejectionReason' | 'createdAt' | 'updatedAt'>): Promise<RestaurantReview | null> => {
    try {
      // 确保新评论状态为pending
      const reviewWithStatus = {
        ...reviewData,
        status: 'pending' as const
      }
      
      const response = await request({
        url: '/restaurant-reviews',
        method: 'POST',
        data: reviewWithStatus
      }) as SingleReviewResponse
      
      return response?.data || null
    } catch (error) {
      console.error('创建评论失败:', error)
      throw error
    }
  },

  // 更新评论
  updateReview: async (id: number, reviewData: Pick<RestaurantReview, 'content' | 'rating'>): Promise<RestaurantReview | null> => {
    try {
      const response = await request({
        url: `/restaurant-reviews/${id}`,
        method: 'PUT',
        data: reviewData
      }) as SingleReviewResponse
      
      return response?.data || null
    } catch (error) {
      console.error('更新评论失败:', error)
      throw error
    }
  },

  // 删除评论
  deleteReview: async (id: number): Promise<boolean> => {
    try {
      const response = await request({
        url: `/restaurant-reviews/${id}`,
        method: 'DELETE'
      })
      
      return response?.success || false
    } catch (error) {
      console.error('删除评论失败:', error)
      throw error
    }
  },

  // 获取餐厅评论统计（只统计已审核通过的评论）
  getRestaurantReviewStats: async (restaurantId: number): Promise<ReviewStatsResponse['data'] | null> => {
    try {
      const response = await request({
        url: `/restaurant-reviews/restaurant/${restaurantId}/stats`,
        method: 'GET'
      }) as ReviewStatsResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取餐厅评论统计失败:', error)
      // 返回模拟统计数据，只统计已审核通过的评论
      const mockReviews = getMockReviews()
      const approvedReviews = mockReviews.filter(review => 
        review.restaurantId === restaurantId && review.status === 'approved'
      )
      
      if (approvedReviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
        }
      }
      
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / approvedReviews.length
      
      const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      approvedReviews.forEach(review => {
        ratingDistribution[review.rating.toString()]++
      })
      
      return {
        totalReviews: approvedReviews.length,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution
      }
    }
  },

  // 审核评论（管理员功能）
  moderateReview: async (reviewId: number, action: 'approve' | 'reject', moderatorId: number, rejectionReason?: string): Promise<RestaurantReview | null> => {
    try {
      const response = await request({
        url: `/restaurant-reviews/${reviewId}/moderate`,
        method: 'POST',
        data: {
          action,
          moderatorId,
          rejectionReason
        }
      }) as SingleReviewResponse
      
      return response?.data || null
    } catch (error) {
      console.error('审核评论失败:', error)
      throw error
    }
  },

  // 获取待审核评论（管理员功能）
  getPendingReviews: async (params?: Omit<ReviewQueryParams, 'status'>): Promise<ReviewResponse> => {
    try {
      const queryString = params ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      
      const response = await request({
        url: `/restaurant-reviews/pending${queryString}`,
        method: 'GET'
      }) as ReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取待审核评论失败:', error)
      // 返回模拟数据，只返回待审核的评论
      const mockReviews = getMockReviews()
      const pendingReviews = mockReviews.filter(review => review.status === 'pending')
      return {
        success: true,
        message: '获取待审核评论成功（模拟数据）',
        data: pendingReviews,
        pagination: {
          page: 1,
          limit: 10,
          total: pendingReviews.length,
          totalPages: Math.ceil(pendingReviews.length / 10),
          hasNext: false,
          hasPrev: false
        }
      }
    }
  },

  // 获取审核统计（管理员功能）
  getModerationStats: async (): Promise<{ pending: number; approved: number; rejected: number; total: number } | null> => {
    try {
      const response = await request({
        url: '/restaurant-reviews/moderation/stats',
        method: 'GET'
      })
      
      return response?.data || null
    } catch (error) {
      console.error('获取审核统计失败:', error)
      // 返回模拟统计数据
      const mockReviews = getMockReviews()
      const pending = mockReviews.filter(review => review.status === 'pending').length
      const approved = mockReviews.filter(review => review.status === 'approved').length
      const rejected = mockReviews.filter(review => review.status === 'rejected').length
      
      return {
        pending,
        approved,
        rejected,
        total: mockReviews.length
      }
    }
  }
}

// 模拟餐厅数据（用于展示和测试）
const getMockRestaurants = (): Restaurant[] => {
  return [
    {
      id: 1,
      name: '龙宫亚洲融合餐厅',
      description: '现代亚洲融合餐厅，提供传统与现代风味的独特融合。招牌菜包括北京烤鸭、日式拉面和泰式咖喱。',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
      streetAddress: '123 Brunswick Street',
      suburb: 'Fortitude Valley',
      postcode: '4006',
      state: 'QLD',
      overallRating: '4.25',
      totalReviews: 15,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-20T14:30:00.000Z'
    },
    {
      id: 2,
      name: '意式风情餐厅',
      description: '正宗意大利餐厅，提供手工制作的意大利面和传统比萨。使用进口意大利食材，营造地道的意式用餐体验。',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
      streetAddress: '456 Queen Street',
      suburb: 'Brisbane City',
      postcode: '4000',
      state: 'QLD',
      overallRating: '4.50',
      totalReviews: 28,
      createdAt: '2024-01-10T09:30:00.000Z',
      updatedAt: '2024-01-25T16:45:00.000Z'
    },
    {
      id: 3,
      name: '海鲜码头',
      description: '新鲜海鲜专门店，每日从黄金海岸直送最新鲜的海鲜。特色菜包括澳洲龙虾、生蚝和巴拉曼迪鱼。',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
      streetAddress: '789 Eagle Street Pier',
      suburb: 'Brisbane City',
      postcode: '4000',
      state: 'QLD',
      overallRating: '4.75',
      totalReviews: 42,
      createdAt: '2024-01-05T11:15:00.000Z',
      updatedAt: '2024-02-01T10:20:00.000Z'
    },
    {
      id: 4,
      name: '川味小厨',
      description: '正宗四川菜餐厅，提供麻辣鲜香的川菜。招牌菜有麻婆豆腐、水煮鱼和宫保鸡丁，适合喜欢辣味的食客。',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop',
      streetAddress: '321 Wickham Street',
      suburb: 'Fortitude Valley',
      postcode: '4006',
      state: 'QLD',
      overallRating: '4.10',
      totalReviews: 33,
      createdAt: '2024-01-20T13:45:00.000Z',
      updatedAt: '2024-02-05T09:30:00.000Z'
    },
    {
      id: 5,
      name: '法式小酒馆',
      description: '精致法式餐厅，提供经典法国菜和精选葡萄酒。浪漫的用餐环境，适合情侣约会和商务宴请。',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
      streetAddress: '654 Ann Street',
      suburb: 'Fortitude Valley',
      postcode: '4006',
      state: 'QLD',
      overallRating: '4.60',
      totalReviews: 19,
      createdAt: '2024-01-12T15:20:00.000Z',
      updatedAt: '2024-01-30T12:10:00.000Z'
    },
    {
      id: 6,
      name: '日式料理屋',
      description: '传统日本料理餐厅，提供新鲜寿司、刺身和各种日式热菜。由日本主厨亲自掌勺，保证正宗口味。',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop',
      streetAddress: '987 Adelaide Street',
      suburb: 'Brisbane City',
      postcode: '4000',
      state: 'QLD',
      overallRating: '4.35',
      totalReviews: 26,
      createdAt: '2024-01-08T10:45:00.000Z',
      updatedAt: '2024-01-28T14:55:00.000Z'
    },
    {
      id: 7,
      name: '墨西哥风情',
      description: '热情洋溢的墨西哥餐厅，提供正宗墨西哥菜和特色鸡尾酒。周末有现场音乐表演，营造欢乐的用餐氛围。',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop',
      streetAddress: '147 Boundary Street',
      suburb: 'West End',
      postcode: '4101',
      state: 'QLD',
      overallRating: '4.20',
      totalReviews: 31,
      createdAt: '2024-01-18T12:30:00.000Z',
      updatedAt: '2024-02-03T11:40:00.000Z'
    },
    {
      id: 8,
      name: '素食花园',
      description: '创意素食餐厅，提供健康美味的植物性料理。使用有机食材，适合素食主义者和注重健康的食客。',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
      streetAddress: '258 Given Terrace',
      suburb: 'Paddington',
      postcode: '4064',
      state: 'QLD',
      overallRating: '4.40',
      totalReviews: 22,
      createdAt: '2024-01-22T09:15:00.000Z',
      updatedAt: '2024-02-07T16:25:00.000Z'
    }
  ]
}

// 模拟评论数据（用于展示和测试）
const getMockReviews = (): RestaurantReview[] => {
  return [
    {
      id: 1,
      restaurantId: 1,
      userId: 101,
      username: 'foodie_sarah',
      content: '龙宫的饺子绝对是我吃过最好的！皮薄馅大，汤汁鲜美。服务员也很友善，会推荐适合的菜品。环境优雅，适合和朋友聚餐。',
      rating: 5,
      status: 'approved',
      moderatedBy: 1001,
      moderatedAt: '2024-01-20T11:00:00.000Z',
      createdAt: '2024-01-20T10:00:00.000Z',
      updatedAt: '2024-01-20T11:00:00.000Z',
      restaurantName: '龙宫亚洲融合餐厅',
      restaurantImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop'
    },
    {
      id: 2,
      restaurantId: 2,
      userId: 102,
      username: 'pasta_lover',
      content: '意式风情的意大利面真的很正宗！特别是他们的奶油蘑菇面，奶香浓郁，蘑菇新鲜。比萨饼底也很棒，薄脆可口。',
      rating: 5,
      status: 'approved',
      moderatedBy: 1001,
      moderatedAt: '2024-01-22T15:00:00.000Z',
      createdAt: '2024-01-22T14:30:00.000Z',
      updatedAt: '2024-01-22T15:00:00.000Z',
      restaurantName: '意式风情餐厅',
      restaurantImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'
    },
    {
      id: 3,
      restaurantId: 3,
      userId: 103,
      username: 'seafood_fan',
      content: '海鲜码头的龙虾超级新鲜！肉质Q弹，配上他们特制的蒜蓉酱，简直完美。生蚝也很棒，一口一个停不下来。',
      rating: 5,
      status: 'approved',
      moderatedBy: 1002,
      moderatedAt: '2024-01-25T19:30:00.000Z',
      createdAt: '2024-01-25T18:45:00.000Z',
      updatedAt: '2024-01-25T19:30:00.000Z',
      restaurantName: '海鲜码头',
      restaurantImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop'
    },
    {
      id: 4,
      restaurantId: 4,
      userId: 104,
      username: 'spicy_eater',
      content: '川味小厨的麻婆豆腐太正宗了！麻辣鲜香，豆腐嫩滑，配米饭吃特别下饭。水煮鱼也很棒，鱼肉鲜嫩，汤底够味。',
      rating: 4,
      status: 'approved',
      moderatedBy: 1001,
      moderatedAt: '2024-01-28T13:00:00.000Z',
      createdAt: '2024-01-28T12:15:00.000Z',
      updatedAt: '2024-01-28T13:00:00.000Z',
      restaurantName: '川味小厨',
      restaurantImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop'
    },
    {
      id: 5,
      restaurantId: 5,
      userId: 105,
      username: 'wine_connoisseur',
      content: '法式小酒馆的环境很浪漫，适合约会。鹅肝很棒，入口即化。红酒的选择也很丰富，服务员很专业，会根据菜品推荐合适的酒款。',
      rating: 5,
      status: 'approved',
      moderatedBy: 1002,
      moderatedAt: '2024-01-30T20:00:00.000Z',
      createdAt: '2024-01-30T19:20:00.000Z',
      updatedAt: '2024-01-30T20:00:00.000Z',
      restaurantName: '法式小酒馆',
      restaurantImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'
    },
    {
      id: 6,
      restaurantId: 6,
      userId: 106,
      username: 'sushi_master',
      content: '日式料理屋的寿司很新鲜，师傅的手艺很棒。特别推荐他们的三文鱼刺身，肥瘦适中，入口即化。味增汤也很正宗。',
      rating: 4,
      status: 'approved',
      moderatedBy: 1001,
      moderatedAt: '2024-02-01T14:00:00.000Z',
      createdAt: '2024-02-01T13:10:00.000Z',
      updatedAt: '2024-02-01T14:00:00.000Z',
      restaurantName: '日式料理屋',
      restaurantImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop'
    },
    {
      id: 7,
      restaurantId: 7,
      userId: 107,
      username: 'party_animal',
      content: '墨西哥风情的气氛超棒！现场音乐很嗨，玛格丽特鸡尾酒调得很好。塔可饼很正宗，牛肉很嫩，配菜也很丰富。',
      rating: 4,
      status: 'approved',
      moderatedBy: 1002,
      moderatedAt: '2024-02-03T21:15:00.000Z',
      createdAt: '2024-02-03T20:30:00.000Z',
      updatedAt: '2024-02-03T21:15:00.000Z',
      restaurantName: '墨西哥风情',
      restaurantImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop'
    },
    {
      id: 8,
      restaurantId: 8,
      userId: 108,
      username: 'health_conscious',
      content: '素食花园的菜品很有创意，完全颠覆了我对素食的印象。蘑菇牛排的口感很棒，素食汉堡也很好吃。环境清新，很舒服。',
      rating: 4,
      status: 'approved',
      moderatedBy: 1001,
      moderatedAt: '2024-02-05T12:30:00.000Z',
      createdAt: '2024-02-05T11:45:00.000Z',
      updatedAt: '2024-02-05T12:30:00.000Z',
      restaurantName: '素食花园',
      restaurantImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop'
    },
    {
      id: 9,
      restaurantId: 1,
      userId: 109,
      username: 'dim_sum_lover',
      content: '龙宫的点心很棒，虾饺皮薄馅大，烧卖也很香。茶水免费续杯，服务很贴心。就是人比较多，建议提前预订。',
      rating: 4,
      status: 'approved',
      moderatedBy: 1002,
      moderatedAt: '2024-02-07T16:00:00.000Z',
      createdAt: '2024-02-07T15:20:00.000Z',
      updatedAt: '2024-02-07T16:00:00.000Z',
      restaurantName: '龙宫亚洲融合餐厅',
      restaurantImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop'
    },
    {
      id: 10,
      restaurantId: 3,
      userId: 110,
      username: 'oyster_enthusiast',
      content: '海鲜码头的生蚝品种很多，悉尼岩蚝特别推荐！新鲜度没话说，配柠檬汁吃很棒。价格稍贵但物有所值。',
      rating: 5,
      status: 'approved',
      moderatedBy: 1001,
      moderatedAt: '2024-02-09T18:30:00.000Z',
      createdAt: '2024-02-09T17:55:00.000Z',
      updatedAt: '2024-02-09T18:30:00.000Z',
      restaurantName: '海鲜码头',
      restaurantImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop'
    },
    {
      id: 11,
      restaurantId: 2,
      userId: 111,
      username: 'pizza_expert',
      content: '意式风情的玛格丽特比萨很正宗，番茄酱酸甜适中，芝士拉丝效果很好。意面的分量也很足，性价比不错。',
      rating: 4,
      status: 'pending',
      createdAt: '2024-02-11T12:40:00.000Z',
      updatedAt: '2024-02-11T12:40:00.000Z',
      restaurantName: '意式风情餐厅',
      restaurantImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'
    },
    {
      id: 12,
      restaurantId: 5,
      userId: 112,
      username: 'romantic_diner',
      content: '法式小酒馆很适合庆祝纪念日，环境很浪漫，灯光柔和。法式洋葱汤很棒，牛排也很嫩。就是价格比较高，特殊场合来还是值得的。',
      rating: 5,
      status: 'approved',
      moderatedBy: 1002,
      moderatedAt: '2024-02-13T20:00:00.000Z',
      createdAt: '2024-02-13T19:15:00.000Z',
      updatedAt: '2024-02-13T20:00:00.000Z',
      restaurantName: '法式小酒馆',
      restaurantImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'
    },
    // 添加一些待审核和被拒绝的评价示例
    {
      id: 13,
      restaurantId: 1,
      userId: 113,
      username: 'new_customer',
      content: '刚去试了一下，感觉还不错，服务态度很好，菜品也挺新鲜的。',
      rating: 4,
      status: 'pending',
      createdAt: '2024-02-15T10:30:00.000Z',
      updatedAt: '2024-02-15T10:30:00.000Z',
      restaurantName: '龙宫亚洲融合餐厅',
      restaurantImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop'
    },
    {
      id: 14,
      restaurantId: 2,
      userId: 114,
      username: 'disappointed_user',
      content: '这家店太差了，服务态度恶劣，菜品质量也不行！',
      rating: 1,
      status: 'rejected',
      moderatedBy: 1001,
      moderatedAt: '2024-02-14T16:00:00.000Z',
      rejectionReason: '评价内容过于主观且缺乏具体描述',
      createdAt: '2024-02-14T15:20:00.000Z',
      updatedAt: '2024-02-14T16:00:00.000Z',
      restaurantName: '意式风情餐厅',
      restaurantImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'
    }
  ]
}

export default { restaurantApi, restaurantReviewApi }
