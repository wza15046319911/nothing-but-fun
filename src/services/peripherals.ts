import request from './api'

// 周边商品数据类型 - 更新以匹配后端schema
export interface PeripheralItem {
  id: number
  name: string
  description: string
  price: number | string  // 后端使用integer，但支持字符串兼容性
  stock: number
  image?: string  // Legacy field for backward compatibility
  imageUrls: string[]  // 主要图片字段，来自关联表
  dateCreated: string  // 后端schema字段名
  createdAt?: string  // Legacy field for backward compatibility
  categoryName?: string | null
  categoryRid?: number  // 分类ID
}

// 周边商品分类接口
export interface PeripheralCategory {
  id: number
  name: string
}

// 周边商品筛选参数接口
export interface PeripheralFilters {
  keyword?: string
  categoryId?: number
  priceFrom?: number
  priceTo?: number
  page?: number
  limit?: number
}

// 分页响应接口
export interface PaginatedPeripheralResponse {
  data: PeripheralItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API响应类型
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 周边商品API
export const peripheralsApi = {
  // 获取所有周边商品（支持筛选和分页）
  getAllItems: async (filters?: PeripheralFilters): Promise<PaginatedPeripheralResponse> => {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()

      if (filters?.keyword) {
        queryParams.append('keyword', filters.keyword)
      }
      if (filters?.categoryId !== undefined) {
        queryParams.append('categoryId', filters.categoryId.toString())
      }
      if (filters?.priceFrom !== undefined) {
        queryParams.append('priceFrom', filters.priceFrom.toString())
      }
      if (filters?.priceTo !== undefined) {
        queryParams.append('priceTo', filters.priceTo.toString())
      }
      if (filters?.page !== undefined) {
        queryParams.append('page', filters.page.toString())
      }
      if (filters?.limit !== undefined) {
        queryParams.append('limit', filters.limit.toString())
      }

      const url = queryParams.toString() ? `/peripherals?${queryParams.toString()}` : '/peripherals'

      const response = await request({
        url,
        method: 'GET'
      })

      // 检查响应格式 - 后端返回的格式是 { data: PeripheralItem[], total, page, limit, totalPages }
      if (response && typeof response === 'object' && 'data' in response && 'total' in response) {
        // 处理数据兼容性
        const processedData = response.data.map((item: any) => ({
          ...item,
          createdAt: item.dateCreated || item.createdAt, // 兼容旧字段
          imageUrls: item.imageUrls || [], // 确保图片数组存在
        }))
        return {
          ...response,
          data: processedData
        } as PaginatedPeripheralResponse
      }

      // 如果是简单数组格式，包装成分页响应
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1
        } as PaginatedPeripheralResponse
      }

      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      } as PaginatedPeripheralResponse
    } catch (error) {
      console.error('获取周边商品失败:', error)
      // 返回模拟数据用于展示
      const mockData = getMockPeripherals()
      return {
        data: mockData,
        total: mockData.length,
        page: 1,
        limit: mockData.length,
        totalPages: 1
      }
    }
  },

  // 获取所有周边商品（简化版本，保持向后兼容）
  getAllItemsSimple: async (): Promise<PeripheralItem[]> => {
    const result = await peripheralsApi.getAllItems()
    return result.data
  },

  // 根据ID获取单个周边商品
  getItemById: async (id: number): Promise<PeripheralItem | null> => {
    try {
      const response = await request({
        url: `/peripherals/${id}`,
        method: 'GET'
      }) as any

      if (response) {
        // 处理数据兼容性
        return {
          ...response,
          createdAt: response.dateCreated || response.createdAt, // 兼容旧字段
          imageUrls: response.imageUrls || [], // 确保图片数组存在
        } as PeripheralItem
      }

      return null
    } catch (error) {
      console.error('获取周边商品详情失败:', error)
      // 返回模拟数据
      const mockItems = getMockPeripherals()
      return mockItems.find(item => item.id === id) || null
    }
  },

  // 获取所有周边商品分类
  getAllCategories: async (): Promise<PeripheralCategory[]> => {
    try {
      const response = await request({
        url: '/peripherals/categories',
        method: 'GET'
      })

      if (response && typeof response === 'object' && 'success' in response && response.success) {
        return response.data as PeripheralCategory[]
      }

      return []
    } catch (error) {
      console.error('获取周边商品分类失败:', error)
      // 返回模拟分类数据
      return [
        { id: 1, name: '服装' },
        { id: 2, name: '配饰' },
        { id: 3, name: '数码' },
        { id: 4, name: '文具' },
        { id: 5, name: '生活用品' },
      ]
    }
  }
}

// 模拟数据（用于展示）- 更新以匹配新的数据结构
const getMockPeripherals = (): PeripheralItem[] => {
  return [
    {
      id: 1,
      name: 'NBF 经典T恤',
      description: '100%纯棉材质，舒适透气，经典LOGO设计，多色可选',
      price: 99,
      stock: 150,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      imageUrls: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
      dateCreated: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'NBF 限量版帽子',
      description: '棒球帽设计，可调节帽围，刺绣工艺LOGO，时尚百搭',
      price: 79,
      stock: 88,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
      imageUrls: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop'],
      dateCreated: '2024-01-20T14:30:00Z',
      createdAt: '2024-01-20T14:30:00Z'
    },
    {
      id: 3,
      name: 'NBF 保温杯',
      description: '316不锈钢内胆，24小时保温，500ml大容量，防漏设计',
      price: '128.00',
      stock: 200,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
      createdAt: '2024-01-25T09:15:00Z'
    },
    {
      id: 4,
      name: 'NBF 帆布包',
      description: '环保帆布材质，大容量设计，结实耐用，适合日常使用',
      price: '89.00',
      stock: 120,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      createdAt: '2024-02-01T16:45:00Z'
    },
    {
      id: 5,
      name: 'NBF 鼠标垫',
      description: '超大尺寸，防滑底座，精美印刷，游戏办公两相宜',
      price: '45.00',
      stock: 300,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
      createdAt: '2024-02-05T11:20:00Z'
    },
    {
      id: 6,
      name: 'NBF 纪念徽章套装',
      description: '金属材质，精工制作，5枚装纪念徽章，收藏价值高',
      price: '68.00',
      stock: 75,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      createdAt: '2024-02-10T13:00:00Z'
    },
    {
      id: 7,
      name: 'NBF 笔记本',
      description: '精装硬壳封面，内页采用优质纸张，适合记录灵感和想法',
      price: '35.00',
      stock: 180,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
      createdAt: '2024-02-15T08:30:00Z'
    },
    {
      id: 8,
      name: 'NBF 手机壳',
      description: '多款手机型号适配，TPU软胶材质，防摔保护，个性图案',
      price: '39.00',
      stock: 250,
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
      createdAt: '2024-02-20T15:10:00Z'
    }
  ]
}

export default peripheralsApi 