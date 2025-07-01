import request from './api'

// 周边商品数据类型
export interface PeripheralItem {
  id: number
  name: string
  description: string
  price: string
  stock: number
  image: string
  createdAt: string
}

// API响应类型
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 周边商品API
export const peripheralsApi = {
  // 获取所有周边商品
  getAllItems: async (): Promise<PeripheralItem[]> => {
    try {
      const response = await request({
        url: '/peripherals',
        method: 'GET'
      }) as PeripheralItem[]
      
      return response || []
    } catch (error) {
      console.error('获取周边商品失败:', error)
      // 返回模拟数据用于展示
      return getMockPeripherals()
    }
  },

  // 根据ID获取单个周边商品
  getItemById: async (id: number): Promise<PeripheralItem | null> => {
    try {
      const response = await request({
        url: `/peripherals/${id}`,
        method: 'GET'
      }) as PeripheralItem
      
      return response || null
    } catch (error) {
      console.error('获取周边商品详情失败:', error)
      // 返回模拟数据
      const mockItems = getMockPeripherals()
      return mockItems.find(item => item.id === id) || null
    }
  }
}

// 模拟数据（用于展示）
const getMockPeripherals = (): PeripheralItem[] => {
  return [
    {
      id: 1,
      name: 'NBF 经典T恤',
      description: '100%纯棉材质，舒适透气，经典LOGO设计，多色可选',
      price: '99.00',
      stock: 150,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'NBF 限量版帽子',
      description: '棒球帽设计，可调节帽围，刺绣工艺LOGO，时尚百搭',
      price: '79.00',
      stock: 88,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
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