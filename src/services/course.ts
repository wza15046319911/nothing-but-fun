import request from './api'

// 课程数据类型
export interface Course {
  id: number
  courseCode: string
  courseName: string
  overallRating: string
  totalReviews: number
  createdAt: string
  updatedAt: string
}

// 课程评论数据类型
export interface CourseReview {
  id: number
  courseId: number
  userId: number
  username: string
  rating: number
  content: string
  moderationStatus: 'pending' | 'approved' | 'rejected'
  isVisible: boolean
  moderatedBy: number | null
  moderatedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  courseCode?: string
  courseName?: string
}

// 课程查询参数接口
export interface CourseQueryParams {
  courseCode?: string
  courseName?: string
  minRating?: number
  page?: number
  limit?: number
  sortBy?: 'courseCode' | 'courseName' | 'overallRating' | 'totalReviews' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// 评论查询参数接口
export interface CourseReviewQueryParams {
  courseId?: number
  userId?: number
  minRating?: number
  maxRating?: number
  moderationStatus?: 'pending' | 'approved' | 'rejected'
  isVisible?: boolean
  page?: number
  limit?: number
  sortBy?: 'rating' | 'createdAt' | 'moderatedAt'
  sortOrder?: 'asc' | 'desc'
}

// API响应接口
export interface CourseResponse {
  success: boolean
  message: string
  data: Course[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SingleCourseResponse {
  success: boolean
  message: string
  data: Course
}

export interface CourseReviewResponse {
  success: boolean
  message: string
  data: CourseReview[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SingleCourseReviewResponse {
  success: boolean
  message: string
  data: CourseReview
}

export interface CourseReviewStatsResponse {
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

export interface ModerationStatsResponse {
  success: boolean
  message: string
  data: {
    pending: number
    approved: number
    rejected: number
    total: number
  }
}

// 课程API
export const courseApi = {
  // 获取所有课程
  getAllCourses: async (params?: CourseQueryParams): Promise<CourseResponse> => {
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
        url: `/courses${queryString}`,
        method: 'GET'
      }) as CourseResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取课程列表失败:', error)
      // 返回模拟数据用于展示
      return {
        success: true,
        message: '获取课程列表成功（模拟数据）',
        data: getMockCourses(),
        pagination: {
          page: 1,
          limit: 10,
          total: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  },

  // 根据ID获取单个课程
  getCourseById: async (id: number): Promise<Course | null> => {
    try {
      const response = await request({
        url: `/courses/${id}`,
        method: 'GET'
      }) as SingleCourseResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取课程详情失败:', error)
      // 返回模拟数据
      const mockCourses = getMockCourses()
      return mockCourses.find(course => course.id === id) || null
    }
  },

  // 根据课程代码获取课程
  getCourseByCode: async (courseCode: string): Promise<Course | null> => {
    try {
      const response = await request({
        url: `/courses/code/${encodeURIComponent(courseCode)}`,
        method: 'GET'
      }) as SingleCourseResponse
      
      return response?.data || null
    } catch (error) {
      console.error('根据课程代码获取课程失败:', error)
      // 返回模拟数据
      const mockCourses = getMockCourses()
      return mockCourses.find(course => course.courseCode === courseCode) || null
    }
  },

  // 创建新课程
  createCourse: async (courseData: Omit<Course, 'id' | 'overallRating' | 'totalReviews' | 'createdAt' | 'updatedAt'>): Promise<Course | null> => {
    try {
      const response = await request({
        url: '/courses',
        method: 'POST',
        data: courseData
      }) as SingleCourseResponse
      
      return response?.data || null
    } catch (error) {
      console.error('创建课程失败:', error)
      throw error
    }
  },

  // 更新课程
  updateCourse: async (id: number, courseData: Partial<Omit<Course, 'id' | 'overallRating' | 'totalReviews' | 'createdAt' | 'updatedAt'>>): Promise<Course | null> => {
    try {
      const response = await request({
        url: `/courses/${id}`,
        method: 'PUT',
        data: courseData
      }) as SingleCourseResponse
      
      return response?.data || null
    } catch (error) {
      console.error('更新课程失败:', error)
      throw error
    }
  },

  // 删除课程
  deleteCourse: async (id: number): Promise<boolean> => {
    try {
      const response = await request({
        url: `/courses/${id}`,
        method: 'DELETE'
      })
      
      return response?.success || false
    } catch (error) {
      console.error('删除课程失败:', error)
      throw error
    }
  },

  // 搜索课程
  searchCourses: async (keyword: string): Promise<Course[]> => {
    try {
      const response = await request({
        url: `/courses/search/${encodeURIComponent(keyword)}`,
        method: 'GET'
      }) as CourseResponse
      
      return response?.data || []
    } catch (error) {
      console.error('搜索课程失败:', error)
      return []
    }
  },

  // 获取热门课程
  getTopRatedCourses: async (limit: number = 10): Promise<Course[]> => {
    try {
      const response = await request({
        url: `/courses/top-rated?limit=${limit}`,
        method: 'GET'
      }) as CourseResponse
      
      return response?.data || []
    } catch (error) {
      console.error('获取热门课程失败:', error)
      return []
    }
  },

  // 根据院系获取课程
  getCoursesByDepartment: async (department: string): Promise<Course[]> => {
    try {
      const response = await request({
        url: `/courses/department/${encodeURIComponent(department)}`,
        method: 'GET'
      }) as CourseResponse
      
      return response?.data || []
    } catch (error) {
      console.error('根据院系获取课程失败:', error)
      return []
    }
  },

  // 更新课程评分
  updateCourseRating: async (id: number): Promise<boolean> => {
    try {
      const response = await request({
        url: `/courses/${id}/update-rating`,
        method: 'POST'
      })
      
      return response?.success || false
    } catch (error) {
      console.error('更新课程评分失败:', error)
      throw error
    }
  }
}

// 课程评论API
export const courseReviewApi = {
  // 获取所有评论
  getAllReviews: async (params?: CourseReviewQueryParams): Promise<CourseReviewResponse> => {
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
        url: `/course-reviews/course/${params?.courseId}${queryString}`,
        method: 'GET'
      }) as CourseReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取评论列表失败:', error)
      // 返回模拟数据用于展示
      return {
        success: true,
        message: '获取评论列表成功（模拟数据）',
        data: getMockCourseReviews(),
        pagination: {
          page: 1,
          limit: 10,
          total: 15,
          totalPages: 2,
          hasNext: true,
          hasPrev: false
        }
      }
    }
  },

  // 根据ID获取单个评论
  getReviewById: async (id: number): Promise<CourseReview | null> => {
    try {
      const response = await request({
        url: `/course-reviews/${id}`,
        method: 'GET'
      }) as SingleCourseReviewResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取评论详情失败:', error)
      // 返回模拟数据
      const mockReviews = getMockCourseReviews()
      return mockReviews.find(review => review.id === id) || null
    }
  },

  // 根据课程获取评论
  getReviewsByCourse: async (courseId: number, params?: Omit<CourseReviewQueryParams, 'courseId'>): Promise<CourseReviewResponse> => {
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
        url: `/course-reviews/course/${courseId}${queryString}`,
        method: 'GET'
      }) as CourseReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('根据课程获取评论失败:', error)
      // 返回模拟数据，根据课程ID筛选
      const mockReviews = getMockCourseReviews()
      const filteredReviews = mockReviews.filter(review => review.courseId === courseId)
      return {
        success: true,
        message: '获取课程评论成功（模拟数据）',
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

  // 获取课程已审核通过的评论（公开展示用）
  getApprovedReviewsByCourse: async (courseId: number, params?: Omit<CourseReviewQueryParams, 'courseId' | 'moderationStatus' | 'isVisible'>): Promise<CourseReviewResponse> => {
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
        url: `/course-reviews/course/${courseId}${queryString}`,
        method: 'GET'
      }) as CourseReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取课程已审核评论失败:', error)
      // 返回模拟数据，只返回已审核通过的评论
      const mockReviews = getMockCourseReviews()
      const approvedReviews = mockReviews.filter(review => 
        review.courseId === courseId && review.moderationStatus === 'approved' && review.isVisible
      )
      return {
        success: true,
        message: '获取课程已审核评论成功（模拟数据）',
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
  getReviewsByUser: async (userId: number, params?: Omit<CourseReviewQueryParams, 'userId'>): Promise<CourseReviewResponse> => {
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
        url: `/course-reviews/user/${userId}${queryString}`,
        method: 'GET'
      }) as CourseReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('根据用户获取评论失败:', error)
      return { success: false, message: '获取数据失败', data: [] }
    }
  },

  // 获取待审核评论
  getPendingReviews: async (params?: Omit<CourseReviewQueryParams, 'moderationStatus'>): Promise<CourseReviewResponse> => {
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
        url: `/course-reviews/pending${queryString}`,
        method: 'GET'
      }) as CourseReviewResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取待审核评论失败:', error)
      return { success: false, message: '获取数据失败', data: [] }
    }
  },

  // 创建新评论
  createReview: async (reviewData: Omit<CourseReview, 'id' | 'moderationStatus' | 'isVisible' | 'moderatedBy' | 'moderatedAt' | 'rejectionReason' | 'createdAt' | 'updatedAt'>): Promise<CourseReview | null> => {
    try {
      const response = await request({
        url: '/course-reviews',
        method: 'POST',
        data: reviewData
      }) as SingleCourseReviewResponse
      
      return response?.data || null
    } catch (error) {
      console.error('创建评论失败:', error)
      throw error
    }
  },

  // 更新评论
  updateReview: async (id: number, reviewData: Pick<CourseReview, 'rating' | 'content'>): Promise<CourseReview | null> => {
    try {
      const response = await request({
        url: `/course-reviews/${id}`,
        method: 'PUT',
        data: reviewData
      }) as SingleCourseReviewResponse
      
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
        url: `/course-reviews/${id}`,
        method: 'DELETE'
      })
      
      return response?.success || false
    } catch (error) {
      console.error('删除评论失败:', error)
      throw error
    }
  },

  // 审核评论
  moderateReview: async (id: number, moderationData: {
    action: 'approve' | 'reject'
    moderatorId: number
    rejectionReason?: string
  }): Promise<CourseReview | null> => {
    try {
      const response = await request({
        url: `/course-reviews/${id}/moderate`,
        method: 'POST',
        data: moderationData
      }) as SingleCourseReviewResponse
      
      return response?.data || null
    } catch (error) {
      console.error('审核评论失败:', error)
      throw error
    }
  },

  // 获取课程评论统计（只统计已审核通过的评论）
  getCourseReviewStats: async (courseId: number): Promise<CourseReviewStatsResponse['data'] | null> => {
    try {
      const response = await request({
        url: `/course-reviews/course/${courseId}/stats`,
        method: 'GET'
      }) as CourseReviewStatsResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取课程评论统计失败:', error)
      // 返回模拟统计数据，只统计已审核通过的评论
      const mockReviews = getMockCourseReviews()
      const approvedReviews = mockReviews.filter(review => 
        review.courseId === courseId && review.moderationStatus === 'approved' && review.isVisible
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

  // 获取审核统计
  getModerationStats: async (): Promise<ModerationStatsResponse['data'] | null> => {
    try {
      const response = await request({
        url: '/course-reviews/moderation/stats',
        method: 'GET'
      }) as ModerationStatsResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取审核统计失败:', error)
      return null
    }
  }
}

// 模拟课程数据（用于展示和测试）
const getMockCourses = (): Course[] => {
  return [
    {
      id: 1,
      courseCode: 'COMP3506',
      courseName: '算法与数据结构',
      overallRating: '4.25',
      totalReviews: 15,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z'
    },
    {
      id: 2,
      courseCode: 'COMP3301',
      courseName: '操作系统架构',
      overallRating: '3.85',
      totalReviews: 22,
      createdAt: '2024-01-10T09:15:00.000Z',
      updatedAt: '2024-01-25T11:30:00.000Z'
    },
    {
      id: 3,
      courseCode: 'COMP3702',
      courseName: '人工智能',
      overallRating: '4.60',
      totalReviews: 18,
      createdAt: '2024-01-08T14:20:00.000Z',
      updatedAt: '2024-01-28T16:10:00.000Z'
    },
    {
      id: 4,
      courseCode: 'COMP3200',
      courseName: '数据库系统',
      overallRating: '4.10',
      totalReviews: 28,
      createdAt: '2024-01-12T11:45:00.000Z',
      updatedAt: '2024-01-30T13:25:00.000Z'
    },
    {
      id: 5,
      courseCode: 'COMP3900',
      courseName: '计算机系统工程',
      overallRating: '3.95',
      totalReviews: 12,
      createdAt: '2024-01-18T15:30:00.000Z',
      updatedAt: '2024-02-02T10:15:00.000Z'
    },
    {
      id: 6,
      courseCode: 'COMP4500',
      courseName: '高级算法与复杂性',
      overallRating: '4.40',
      totalReviews: 8,
      createdAt: '2024-01-22T12:00:00.000Z',
      updatedAt: '2024-02-05T14:30:00.000Z'
    },
    {
      id: 7,
      courseCode: 'COMP3400',
      courseName: '函数式编程',
      overallRating: '3.70',
      totalReviews: 16,
      createdAt: '2024-01-25T09:45:00.000Z',
      updatedAt: '2024-02-08T11:20:00.000Z'
    },
    {
      id: 8,
      courseCode: 'COMP3800',
      courseName: '机器学习',
      overallRating: '4.55',
      totalReviews: 25,
      createdAt: '2024-01-20T16:15:00.000Z',
      updatedAt: '2024-02-10T12:45:00.000Z'
    },
    {
      id: 9,
      courseCode: 'COMP3100',
      courseName: '软件工程',
      overallRating: '4.05',
      totalReviews: 31,
      createdAt: '2024-01-14T13:30:00.000Z',
      updatedAt: '2024-02-12T15:10:00.000Z'
    },
    {
      id: 10,
      courseCode: 'COMP3600',
      courseName: '计算机网络',
      overallRating: '3.90',
      totalReviews: 19,
      createdAt: '2024-01-28T10:20:00.000Z',
      updatedAt: '2024-02-15T09:35:00.000Z'
    }
  ]
}

// 模拟课程评论数据（用于展示和测试）
const getMockCourseReviews = (): CourseReview[] => {
  return [
    {
      id: 1,
      courseId: 1,
      userId: 123,
      username: 'john_doe',
      rating: 5,
      content: '这门课程非常棒！教授讲解得很清楚，作业也很有挑战性。通过这门课我对算法和数据结构有了深入的理解。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 456,
      moderatedAt: '2024-01-16T09:15:00.000Z',
      rejectionReason: null,
      createdAt: '2024-01-15T14:30:00.000Z',
      updatedAt: '2024-01-16T09:15:00.000Z',
      courseCode: 'COMP3506',
      courseName: '算法与数据结构'
    },
    {
      id: 2,
      courseId: 3,
      userId: 124,
      username: 'ai_enthusiast',
      rating: 5,
      content: '人工智能课程内容很前沿，涵盖了机器学习、深度学习等热门话题。项目作业很实用，能够应用到实际问题中。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 456,
      moderatedAt: '2024-01-18T11:20:00.000Z',
      rejectionReason: null,
      createdAt: '2024-01-17T16:45:00.000Z',
      updatedAt: '2024-01-18T11:20:00.000Z',
      courseCode: 'COMP3702',
      courseName: '人工智能'
    },
    {
      id: 3,
      courseId: 8,
      userId: 125,
      username: 'ml_student',
      rating: 4,
      content: '机器学习课程理论和实践结合得很好。教授会用很多实例来解释复杂的概念，作业项目也很有趣。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 457,
      moderatedAt: '2024-01-22T14:10:00.000Z',
      rejectionReason: null,
      createdAt: '2024-01-21T10:15:00.000Z',
      updatedAt: '2024-01-22T14:10:00.000Z',
      courseCode: 'COMP3800',
      courseName: '机器学习'
    },
    {
      id: 4,
      courseId: 4,
      userId: 126,
      username: 'database_pro',
      rating: 4,
      content: '数据库系统课程很实用，学到了SQL优化、事务处理等重要概念。期末项目设计数据库很有挑战性。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 456,
      moderatedAt: '2024-01-25T09:30:00.000Z',
      rejectionReason: null,
      createdAt: '2024-01-24T13:20:00.000Z',
      updatedAt: '2024-01-25T09:30:00.000Z',
      courseCode: 'COMP3200',
      courseName: '数据库系统'
    },
    {
      id: 5,
      courseId: 2,
      userId: 127,
      username: 'system_admin',
      rating: 3,
      content: '操作系统课程内容比较难，需要花很多时间理解。不过学完后对计算机系统有了更深的认识。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 457,
      moderatedAt: '2024-01-28T15:45:00.000Z',
      rejectionReason: null,
      createdAt: '2024-01-27T11:30:00.000Z',
      updatedAt: '2024-01-28T15:45:00.000Z',
      courseCode: 'COMP3301',
      courseName: '操作系统架构'
    },
    {
      id: 6,
      courseId: 9,
      userId: 128,
      username: 'software_dev',
      rating: 4,
      content: '软件工程课程很实用，学到了敏捷开发、版本控制等实际工作中会用到的技能。团队项目很有意思。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 456,
      moderatedAt: '2024-01-30T12:15:00.000Z',
      rejectionReason: null,
      createdAt: '2024-01-29T14:45:00.000Z',
      updatedAt: '2024-01-30T12:15:00.000Z',
      courseCode: 'COMP3100',
      courseName: '软件工程'
    },
    {
      id: 7,
      courseId: 6,
      userId: 129,
      username: 'algo_master',
      rating: 5,
      content: '高级算法课程非常有挑战性，但收获很大。教授讲解了很多前沿的算法理论，对研究很有帮助。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 457,
      moderatedAt: '2024-02-02T10:30:00.000Z',
      rejectionReason: null,
      createdAt: '2024-02-01T16:20:00.000Z',
      updatedAt: '2024-02-02T10:30:00.000Z',
      courseCode: 'COMP4500',
      courseName: '高级算法与复杂性'
    },
    {
      id: 8,
      courseId: 10,
      userId: 130,
      username: 'network_guy',
      rating: 4,
      content: '计算机网络课程涵盖了TCP/IP、路由协议等重要内容。实验课很有趣，能够亲手配置网络设备。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 456,
      moderatedAt: '2024-02-05T13:45:00.000Z',
      rejectionReason: null,
      createdAt: '2024-02-04T09:10:00.000Z',
      updatedAt: '2024-02-05T13:45:00.000Z',
      courseCode: 'COMP3600',
      courseName: '计算机网络'
    },
    {
      id: 9,
      courseId: 7,
      userId: 131,
      username: 'fp_learner',
      rating: 3,
      content: '函数式编程课程概念比较抽象，需要转换思维方式。不过学会后写代码的思路确实不一样了。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 457,
      moderatedAt: '2024-02-08T11:20:00.000Z',
      rejectionReason: null,
      createdAt: '2024-02-07T15:30:00.000Z',
      updatedAt: '2024-02-08T11:20:00.000Z',
      courseCode: 'COMP3400',
      courseName: '函数式编程'
    },
    {
      id: 10,
      courseId: 5,
      userId: 132,
      username: 'engineer_student',
      rating: 4,
      content: '计算机系统工程课程很综合，涉及硬件、软件、系统设计等多个方面。项目管理部分很实用。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 456,
      moderatedAt: '2024-02-10T14:15:00.000Z',
      rejectionReason: null,
      createdAt: '2024-02-09T12:45:00.000Z',
      updatedAt: '2024-02-10T14:15:00.000Z',
      courseCode: 'COMP3900',
      courseName: '计算机系统工程'
    },
    {
      id: 11,
      courseId: 1,
      userId: 133,
      username: 'data_struct_fan',
      rating: 4,
      content: '算法与数据结构是计算机专业的基础课程，内容很重要。虽然有些算法比较复杂，但理解后很有成就感。',
      moderationStatus: 'pending',
      isVisible: false,
      moderatedBy: null,
      moderatedAt: null,
      rejectionReason: null,
      createdAt: '2024-02-12T10:30:00.000Z',
      updatedAt: '2024-02-12T10:30:00.000Z',
      courseCode: 'COMP3506',
      courseName: '算法与数据结构'
    },
    {
      id: 12,
      courseId: 3,
      userId: 134,
      username: 'ai_researcher',
      rating: 5,
      content: '人工智能课程内容很前沿，教授经常分享最新的研究成果。对想从事AI研究的学生来说非常有价值。',
      moderationStatus: 'pending',
      isVisible: false,
      moderatedBy: null,
      moderatedAt: null,
      rejectionReason: null,
      createdAt: '2024-02-14T16:20:00.000Z',
      updatedAt: '2024-02-14T16:20:00.000Z',
      courseCode: 'COMP3702',
      courseName: '人工智能'
    },
    {
      id: 13,
      courseId: 8,
      userId: 135,
      username: 'ml_practitioner',
      rating: 4,
      content: '机器学习课程理论扎实，实践项目也很丰富。建议有一定数学基础再选这门课，会学得更轻松。',
      moderationStatus: 'pending',
      isVisible: false,
      moderatedBy: null,
      moderatedAt: null,
      rejectionReason: null,
      createdAt: '2024-02-15T11:45:00.000Z',
      updatedAt: '2024-02-15T11:45:00.000Z',
      courseCode: 'COMP3800',
      courseName: '机器学习'
    },
    {
      id: 14,
      courseId: 4,
      userId: 136,
      username: 'db_expert',
      rating: 3,
      content: '数据库系统课程内容很多，需要记忆的概念比较多。实验部分很有趣，能够实际操作数据库。',
      moderationStatus: 'rejected',
      isVisible: false,
      moderatedBy: 456,
      moderatedAt: '2024-02-16T09:30:00.000Z',
      rejectionReason: '评论内容过于简单，缺乏具体细节',
      createdAt: '2024-02-15T14:20:00.000Z',
      updatedAt: '2024-02-16T09:30:00.000Z',
      courseCode: 'COMP3200',
      courseName: '数据库系统'
    },
    {
      id: 15,
      courseId: 9,
      userId: 137,
      username: 'agile_dev',
      rating: 5,
      content: '软件工程课程非常实用，学到的敏捷开发方法在实习中就用上了。团队协作项目让我学会了如何与他人合作开发软件。',
      moderationStatus: 'approved',
      isVisible: true,
      moderatedBy: 457,
      moderatedAt: '2024-02-17T13:15:00.000Z',
      rejectionReason: null,
      createdAt: '2024-02-16T15:40:00.000Z',
      updatedAt: '2024-02-17T13:15:00.000Z',
      courseCode: 'COMP3100',
      courseName: '软件工程'
    }
  ]
}

export default { courseApi, courseReviewApi }
