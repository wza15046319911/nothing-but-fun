import request from './api';

// 活动数据类型 - 更新以匹配后端schema
export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  image?: string; // Legacy field for backward compatibility
  imageUrls: string[]; // 多图片支持，来自Cloudinary
  capacity: number;
  free?: boolean; // 是否免费 - schema中的字段
  priceFrom?: number; // 起始价格
  priceTo?: number; // 结束价格
  pricingDetails?: string; // 价格详情
  video?: string; // 视频链接
  dateCreated?: string; // 后端返回的字段名
  dateUpdated?: string; // 后端返回的字段名
  createdAt?: string; // Legacy field for backward compatibility
  // Legacy fields - keeping for compatibility
  organizerId?: number; // Legacy field
  price?: number; // Legacy field, use priceFrom/priceTo instead
  eventTypeRid?: number; // 活动类型ID
}

// 活动类型接口
export interface EventType {
  id: number;
  name: string;
}

// 分页响应接口
export interface PaginatedEventsResponse {
  data: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 活动筛选参数接口 - 更新以匹配后端API
export interface EventFilters {
  keyword?: string;
  isHistorical?: boolean;
  event_type?: string; // 后端期望的参数名
  eventTypeRid?: number; // 前端使用的参数名，会映射到event_type
  free?: boolean; // 使用schema字段名
  isFree?: boolean; // Legacy field, mapped to free
  priceFrom?: number;
  priceTo?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  sortBy?: 'sort' | 'startTime' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 活动注册接口
export interface EventRegistration {
  id: number;
  userId: number;
  eventId: number;
  realName: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
  isAttended: boolean;
  checkedInAt?: string;
}

// 新注册请求接口
export interface NewEventRegistration {
  userId: number;
  realName: string;
  email: string;
  phoneNumber: string;
}

// 注册响应接口
export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: EventRegistration;
  error?: string;
}

// 用户活动响应接口
export interface UserEventsResponse {
  success: boolean;
  message: string;
  data?: Array<{
    registration: EventRegistration;
    event: Event;
  }>;
}

// 活动API
export const eventsApi = {
  // 获取所有活动（支持筛选和分页）
  getAllEvents: async (filters?: EventFilters): Promise<PaginatedEventsResponse> => {
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (filters?.keyword) {
        params.append('keyword', filters.keyword);
      }
      if (filters?.isHistorical !== undefined) {
        params.append('isHistorical', filters.isHistorical.toString());
      }
      if (filters?.event_type) {
        params.append('event_type', filters.event_type);
      }
      if (filters?.eventTypeRid !== undefined) {
        params.append('event_type', filters.eventTypeRid.toString());
      }
      if (filters?.event_type) {
        params.append('event_type', filters.event_type);
      }
      if (filters?.isFree !== undefined) {
        params.append('free', filters.isFree.toString());
      }
      if (filters?.free !== undefined) {
        params.append('free', filters.free.toString());
      }
      if (filters?.priceFrom !== undefined) {
        params.append('priceFrom', filters.priceFrom.toString());
      }
      if (filters?.priceTo !== undefined) {
        params.append('priceTo', filters.priceTo.toString());
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters?.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
      if (filters?.page !== undefined) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit !== undefined) {
        params.append('limit', filters.limit.toString());
      }
      const queryString = params.toString();
      console.log(queryString);
      const url = `/events${queryString ? `?${queryString}` : ''}`;

      const response = await request({
        url,
        method: 'GET',
      });

      // 检查响应格式 - 后端返回的格式是 { data: Event[], total, page, limit, totalPages }
      if (response && typeof response === 'object' && 'data' in response && 'total' in response) {
        return response as PaginatedEventsResponse;
      }

      // 如果是简单数组格式，包装成分页响应
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1,
        } as PaginatedEventsResponse;
      }

      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      } as PaginatedEventsResponse;
    } catch (error) {
      console.error('获取活动列表失败:', error);
      // 返回模拟数据用于展示，包装成分页响应格式
      const mockData = getMockEvents(filters?.isHistorical);
      return {
        data: mockData,
        total: mockData.length,
        page: 1,
        limit: mockData.length,
        totalPages: 1,
      };
    }
  },

  // 获取所有活动（简化版本，保持向后兼容）
  getAllEventsSimple: async (isHistorical?: boolean): Promise<Event[]> => {
    const result = await eventsApi.getAllEvents({ isHistorical });
    // 现在 getAllEvents 总是返回 PaginatedEventsResponse
    return result.data;
  },

  // 根据ID获取单个活动
  getEventById: async (id: number): Promise<Event | null> => {
    try {
      const response = (await request({
        url: `/events/${id}`,
        method: 'GET',
      })) as Event;

      return response || null;
    } catch (error) {
      console.error('获取活动详情失败:', error);
      // 返回模拟数据
      const mockEvents = getMockEvents();
      return mockEvents.find((event) => event.id === id) || null;
    }
  },

  // 创建新活动
  createEvent: async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event | null> => {
    try {
      const response = (await request({
        url: '/events',
        method: 'POST',
        data: eventData,
      })) as Event;

      return response || null;
    } catch (error) {
      console.error('创建活动失败:', error);
      throw error;
    }
  },

  // 更新活动
  updateEvent: async (
    id: number,
    eventData: Partial<Omit<Event, 'id' | 'createdAt'>>
  ): Promise<Event | null> => {
    try {
      const response = (await request({
        url: `/events/${id}`,
        method: 'PUT',
        data: eventData,
      })) as Event;

      return response || null;
    } catch (error) {
      console.error('更新活动失败:', error);
      throw error;
    }
  },

  // 删除活动
  deleteEvent: async (id: number): Promise<boolean> => {
    try {
      const response = (await request({
        url: `/events/${id}`,
        method: 'DELETE',
      })) as boolean;

      return response || false;
    } catch (error) {
      console.error('删除活动失败:', error);
      throw error;
    }
  },

  // 根据组织者ID获取活动
  getEventsByOrganizer: async (organizerId: number): Promise<Event[]> => {
    try {
      const response = (await request({
        url: `/organizers/${organizerId}/events`,
        method: 'GET',
      })) as Event[];

      return response || [];
    } catch (error) {
      console.error('获取组织者活动失败:', error);
      return [];
    }
  },

  // 获取所有活动类型
  getEventTypes: async (): Promise<EventType[]> => {
    try {
      const response = (await request({
        url: '/event-types',
        method: 'GET',
      })) as EventType[];

      return response || [];
    } catch (error) {
      console.error('获取活动类型失败:', error);
      // 返回默认活动类型
      return [
        { id: 1, name: '运动' },
        { id: 2, name: '文化' },
        { id: 3, name: '聚会' },
        { id: 4, name: '手工' },
        { id: 5, name: '美食' },
      ];
    }
  },

  // 根据类型ID获取类型名称的辅助函数
  getEventTypeName: async (typeId: number | undefined): Promise<string> => {
    if (!typeId) return '未分类';

    try {
      const types = await eventsApi.getEventTypes();
      const type = types.find((t) => t.id === typeId);
      return type?.name || `类型 ${typeId}`;
    } catch (error) {
      console.error('获取活动类型名称失败:', error);
      return `类型 ${typeId}`;
    }
  },
};

// 活动注册API
export const eventRegistrationApi = {
  // 注册参加活动
  registerForEvent: async (
    eventId: number,
    userId: number,
    registrationData: NewEventRegistration
  ): Promise<EventRegistration | null> => {
    try {
      const response = (await request({
        url: `/events/register/${eventId}/${userId}`,
        method: 'POST',
        data: registrationData,
      })) as EventRegistration;

      return response || null;
    } catch (error: any) {
      console.error('注册活动失败:', error);

      // Enhanced error handling with specific error messages
      if (error?.response?.status === 409) {
        throw new Error('您已经报名过这个活动了');
      } else if (error?.response?.status === 400) {
        const errorData = error?.response?.data;
        if (errorData?.error?.includes('已满员')) {
          throw new Error('活动已满员，报名失败');
        } else if (errorData?.error?.includes('无效的注册信息')) {
          throw new Error('注册信息不完整或格式错误');
        } else {
          throw new Error(errorData?.error || '报名失败，请检查输入信息');
        }
      } else if (error?.response?.status === 404) {
        throw new Error('活动不存在');
      } else if (error?.response?.status >= 500) {
        throw new Error('服务器错误，请稍后重试');
      } else {
        throw new Error(error?.message || '网络连接失败，请检查网络后重试');
      }
    }
  },

  // 获取用户注册的所有活动
  getUserEvents: async (
    userId: number
  ): Promise<Array<{ registration: EventRegistration; event: Event }>> => {
    try {
      const response = (await request({
        url: `/events/register/${userId}`,
        method: 'GET',
      })) as Array<{ registration: EventRegistration; event: Event }>;

      return response || [];
    } catch (error) {
      console.error('获取用户活动失败:', error);
      return [];
    }
  },

  // 更新注册信息
  updateRegistration: async (
    eventId: number,
    userId: number,
    registrationData: NewEventRegistration
  ): Promise<EventRegistration | null> => {
    try {
      const response = (await request({
        url: `/events/register/${eventId}/${userId}`,
        method: 'PUT',
        data: registrationData,
      })) as EventRegistration;

      return response || null;
    } catch (error) {
      console.error('更新注册信息失败:', error);
      throw error;
    }
  },

  // 取消注册
  cancelRegistration: async (userId: number, eventId: number): Promise<boolean> => {
    try {
      await request({
        url: `/users/${userId}/events/${eventId}`,
        method: 'DELETE',
      });

      return true;
    } catch (error: any) {
      console.error('取消注册失败:', error);

      // Enhanced error handling
      if (error?.response?.status === 404) {
        throw new Error('未找到该报名记录');
      } else if (error?.response?.status >= 500) {
        throw new Error('服务器错误，请稍后重试');
      } else {
        throw new Error(error?.message || '取消报名失败，请稍后重试');
      }
    }
  },

  // 检查用户是否已注册活动
  isUserRegistered: async (userId: number, eventId: number): Promise<boolean> => {
    try {
      const userEvents = await eventRegistrationApi.getUserEvents(userId);
      return userEvents.some((item) => item.event.id === eventId);
    } catch (error) {
      console.error('检查注册状态失败:', error);
      return false;
    }
  },

  // 获取活动注册人数
  getEventRegistrationCount: async (eventId: number): Promise<number> => {
    try {
      // Use the existing endpoint to get all registrations and count them
      const response = (await request({
        url: `/events/${eventId}/registrations`,
        method: 'GET',
      })) as EventRegistration[];

      return response?.length || 0;
    } catch (error) {
      console.error('获取注册人数失败:', error);
      return 0;
    }
  },
};

// 模拟数据（用于展示和测试）
const getMockEvents = (isHistorical?: boolean): Event[] => {
  const allEvents: Event[] = [
    {
      id: 1,
      organizerId: 101,
      title: '布里斯班河畔BBQ聚会',
      description:
        '在美丽的布里斯班河畔享受轻松的BBQ时光，认识新朋友，品尝美食，欣赏河景。活动包含各种烤肉、素食选择和饮料。',
      location: '布里斯班河畔公园',
      startTime: '2024-01-15T17:00:00.000Z',
      endTime: '2024-01-15T21:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop',
      ],
      capacity: 50,
      createdAt: '2024-01-10T08:30:00.000Z',
      price: 25,
      pricingDetails: '包含BBQ食材和饮料',
      eventTypeRid: 3,
    },
    {
      id: 2,
      organizerId: 102,
      title: '黄金海岸冲浪体验',
      description:
        '专业教练指导的冲浪课程，适合初学者和有经验的冲浪者。包含冲浪板租赁和安全装备，在世界著名的冲浪者天堂海滩体验冲浪乐趣。',
      location: '冲浪者天堂海滩',
      startTime: '2024-01-20T09:00:00.000Z',
      endTime: '2024-01-20T15:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop',
      ],
      capacity: 20,
      createdAt: '2024-01-12T14:20:00.000Z',
      price: 80,
      pricingDetails: '包含冲浪板租赁、安全装备和教练指导',
      eventTypeRid: 1,
    },
    {
      id: 3,
      organizerId: 103,
      title: '澳洲野生动物园探索',
      description:
        '参观澳洲著名的野生动物园，近距离接触袋鼠、考拉、鳄鱼等澳洲特有动物。包含门票、导游讲解和动物喂食体验。',
      location: '澳洲动物园',
      startTime: '2024-01-25T10:00:00.000Z',
      endTime: '2024-01-25T16:00:00.000Z',
      image: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&h=400&fit=crop',
      ],
      capacity: 30,
      createdAt: '2024-01-18T11:45:00.000Z',
      price: 45,
      pricingDetails: '包含门票、导游讲解和动物喂食体验',
      eventTypeRid: 2,
    },
  ];

  const currentTime = new Date();

  // 根据isHistorical参数过滤
  if (isHistorical === true) {
    // 返回过去的活动（开始时间在当前时间之前）
    const pastEvents = allEvents.filter((event) => {
      const eventTime = new Date(event.startTime);
      const isPast = eventTime < currentTime;
      console.log(`活动 "${event.title}" 时间: ${eventTime}, 是否过去: ${isPast}`);
      return isPast;
    });
    console.log('过去活动数量:', pastEvents.length);
    return pastEvents;
  } else if (isHistorical === false) {
    // 返回未来的活动（开始时间在当前时间之后）
    const futureEvents = allEvents.filter((event) => {
      const eventTime = new Date(event.startTime);
      const isFuture = eventTime >= currentTime;
      console.log(`活动 "${event.title}" 时间: ${eventTime}, 是否未来: ${isFuture}`);
      return isFuture;
    });
    console.log('未来活动数量:', futureEvents.length);
    return futureEvents;
  }

  // 返回所有活动
  console.log('返回所有活动数量:', allEvents.length);
  return allEvents;
};

export default eventsApi;
