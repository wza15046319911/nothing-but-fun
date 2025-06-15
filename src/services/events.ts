import request from './api'

// 活动数据类型
export interface Event {
  id: number
  organizerId: number
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  image: string
  capacity: number
  createdAt: string
}



// 活动API
export const eventsApi = {
  // 获取所有活动
  getAllEvents: async (isHistorical?: boolean): Promise<Event[]> => {
    try {
      const params = isHistorical !== undefined ? `?isHistorical=${isHistorical}` : ''
      const response = await request({
        url: `/events${params}`,
        method: 'GET'
      }) as Event[]
      
      return response || []
    } catch (error) {
      console.error('获取活动列表失败:', error)
      // 返回模拟数据用于展示
      return getMockEvents(isHistorical)
    }
  },

  // 根据ID获取单个活动
  getEventById: async (id: number): Promise<Event | null> => {
    try {
      const response = await request({
        url: `/events/${id}`,
        method: 'GET'
      }) as Event
      
      return response || null
    } catch (error) {
      console.error('获取活动详情失败:', error)
      // 返回模拟数据
      const mockEvents = getMockEvents()
      return mockEvents.find(event => event.id === id) || null
    }
  },

  // 创建新活动
  createEvent: async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event | null> => {
    try {
      const response = await request({
        url: '/events',
        method: 'POST',
        data: eventData
      }) as Event
      
      return response || null
    } catch (error) {
      console.error('创建活动失败:', error)
      throw error
    }
  },

  // 更新活动
  updateEvent: async (id: number, eventData: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<Event | null> => {
    try {
      const response = await request({
        url: `/events/${id}`,
        method: 'PUT',
        data: eventData
      }) as Event
      
      return response || null
    } catch (error) {
      console.error('更新活动失败:', error)
      throw error
    }
  },

  // 删除活动
  deleteEvent: async (id: number): Promise<boolean> => {
    try {
      const response = await request({
        url: `/events/${id}`,
        method: 'DELETE'
      }) as boolean
      
      return response || false
    } catch (error) {
      console.error('删除活动失败:', error)
      throw error
    }
  },

  // 根据组织者ID获取活动
  getEventsByOrganizer: async (organizerId: number): Promise<Event[]> => {
    try {
      const response = await request({
        url: `/organizers/${organizerId}/events`,
        method: 'GET'
      }) as Event[]
      
      return response || []
    } catch (error) {
      console.error('获取组织者活动失败:', error)
      return []
    }
  }
}

// 模拟数据（用于展示和测试）
const getMockEvents = (isHistorical?: boolean): Event[] => {
  const allEvents: Event[] = [
    {
      id: 1,
      organizerId: 101,
      title: '布里斯班河畔BBQ聚会',
      description: '在美丽的布里斯班河畔享受轻松的BBQ时光，认识新朋友，品尝美食，欣赏河景。活动包含各种烤肉、素食选择和饮料。',
      location: '布里斯班河畔公园',
      startTime: '2024-01-15T17:00:00.000Z',
      endTime: '2024-01-15T21:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
      capacity: 50,
      createdAt: '2024-01-10T08:30:00.000Z'
    },
    {
      id: 2,
      organizerId: 102,
      title: '黄金海岸冲浪体验',
      description: '专业教练指导的冲浪课程，适合初学者和有经验的冲浪者。包含冲浪板租赁和安全装备，在世界著名的冲浪者天堂海滩体验冲浪乐趣。',
      location: '冲浪者天堂海滩',
      startTime: '2024-01-20T09:00:00.000Z',
      endTime: '2024-01-20T15:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
      capacity: 20,
      createdAt: '2024-01-12T14:20:00.000Z'
    },
    {
      id: 3,
      organizerId: 103,
      title: '澳洲野生动物园探索',
      description: '参观澳洲著名的野生动物园，近距离接触袋鼠、考拉、鳄鱼等澳洲特有动物。包含门票、导游讲解和动物喂食体验。',
      location: '澳洲动物园',
      startTime: '2024-01-25T10:00:00.000Z',
      endTime: '2024-01-25T16:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop',
      capacity: 30,
      createdAt: '2024-01-18T11:45:00.000Z'
    },
    {
      id: 4,
      organizerId: 104,
      title: '布里斯班市区徒步游',
      description: '专业导游带领的布里斯班市区文化徒步游，探索城市历史、建筑和当地文化。路线包含南岸公园、故事桥和皇后街购物中心。',
      location: '布里斯班市中心',
      startTime: '2024-02-01T14:00:00.000Z',
      endTime: '2024-02-01T17:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      capacity: 25,
      createdAt: '2024-01-22T09:15:00.000Z'
    },
    {
      id: 5,
      organizerId: 105,
      title: '摩顿岛沙滑体验',
      description: '前往摩顿岛体验刺激的沙滑运动，享受4WD沙丘驾驶和海豚喂食。包含往返渡轮、午餐和所有活动装备。',
      location: '摩顿岛',
      startTime: '2024-02-08T07:30:00.000Z',
      endTime: '2024-02-08T18:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
      capacity: 40,
      createdAt: '2024-01-28T16:30:00.000Z'
    },
    {
      id: 6,
      organizerId: 106,
      title: '春节庆祝晚会',
      description: '传统中国春节庆祝活动，包含舞龙舞狮表演、传统美食、红包游戏和卡拉OK。让海外华人感受浓浓的年味。',
      location: '布里斯班华人社区中心',
      startTime: '2024-02-10T18:00:00.000Z',
      endTime: '2024-02-10T23:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      capacity: 100,
      createdAt: '2024-02-01T12:00:00.000Z'
    },
    {
      id: 7,
      organizerId: 107,
      title: '蓝山国家公园一日游',
      description: '探索壮观的蓝山国家公园，参观三姐妹岩、乘坐景观缆车、游览珍罗兰钟乳石洞。包含交通、门票和导游服务。',
      location: '蓝山国家公园',
      startTime: '2024-03-15T08:00:00.000Z',
      endTime: '2024-03-15T19:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      capacity: 35,
      createdAt: '2024-03-01T10:20:00.000Z'
    },
    {
      id: 8,
      organizerId: 108,
      title: '悉尼歌剧院音乐会',
      description: '在世界著名的悉尼歌剧院欣赏古典音乐会，体验澳洲顶级的艺术文化。包含往返交通和音乐会门票。',
      location: '悉尼歌剧院',
      startTime: '2024-03-22T19:30:00.000Z',
      endTime: '2024-03-22T22:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&h=400&fit=crop',
      capacity: 60,
      createdAt: '2024-03-10T15:45:00.000Z'
    }
  ]

  const currentTime = new Date()
  console.log('当前时间:', currentTime)
  console.log('isHistorical参数:', isHistorical)
  console.log('所有活动数量:', allEvents.length)

  // 根据isHistorical参数过滤
  if (isHistorical === true) {
    // 返回过去的活动（开始时间在当前时间之前）
    const pastEvents = allEvents.filter(event => {
      const eventTime = new Date(event.startTime)
      const isPast = eventTime < currentTime
      console.log(`活动 "${event.title}" 时间: ${eventTime}, 是否过去: ${isPast}`)
      return isPast
    })
    console.log('过去活动数量:', pastEvents.length)
    return pastEvents
  } else if (isHistorical === false) {
    // 返回未来的活动（开始时间在当前时间之后）
    const futureEvents = allEvents.filter(event => {
      const eventTime = new Date(event.startTime)
      const isFuture = eventTime >= currentTime
      console.log(`活动 "${event.title}" 时间: ${eventTime}, 是否未来: ${isFuture}`)
      return isFuture
    })
    console.log('未来活动数量:', futureEvents.length)
    return futureEvents
  }
  
  // 返回所有活动
  console.log('返回所有活动数量:', allEvents.length)
  return allEvents
}

export default eventsApi
