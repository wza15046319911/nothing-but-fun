import request from './api';

// 租赁商品数据类型
export interface RentalItem {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  rentalRate: string;
  rentalPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly';
  deposit: string;
  status: 'available' | 'rented_out' | 'in_maintenance';
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// 租赁分类类型
export interface RentalCategory {
  id: number;
  name: string;
  icon: string;
}

// API响应类型
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 租赁商品API
export const rentalsApi = {
  // 获取所有租赁商品
  getAllItems: async (): Promise<RentalItem[]> => {
    try {
      const response = (await request({
        url: '/rentals',
        method: 'GET',
      })) as ApiResponse<RentalItem[]>;

      return response.data || [];
    } catch (error) {
      console.error('获取租赁商品失败:', error);
      // 返回模拟数据用于展示
      return getMockRentals();
    }
  },

  // 获取可用的租赁商品
  getAvailableItems: async (): Promise<RentalItem[]> => {
    try {
      const response = (await request({
        url: '/rentals/available',
        method: 'GET',
      })) as ApiResponse<RentalItem[]>;

      return response.data || [];
    } catch (error) {
      console.error('获取可用租赁商品失败:', error);
      // 返回模拟数据中的可用商品
      return getMockRentals().filter((item) => item.status === 'available');
    }
  },

  // 根据分类获取租赁商品
  getItemsByCategory: async (categoryId: number): Promise<RentalItem[]> => {
    try {
      const response = (await request({
        url: `/rentals/category/${categoryId}`,
        method: 'GET',
      })) as ApiResponse<RentalItem[]>;

      return response.data || [];
    } catch (error) {
      console.error('获取分类租赁商品失败:', error);
      // 返回模拟数据中的对应分类商品
      return getMockRentals().filter((item) => item.categoryId === categoryId);
    }
  },

  // 根据ID获取单个租赁商品
  getItemById: async (id: number): Promise<RentalItem | null> => {
    try {
      const response = (await request({
        url: `/rentals/${id}`,
        method: 'GET',
      })) as ApiResponse<RentalItem>;

      return response.data || null;
    } catch (error) {
      console.error('获取租赁商品详情失败:', error);
      // 返回模拟数据
      const mockItems = getMockRentals();
      return mockItems.find((item) => item.id === id) || null;
    }
  },
};

// 租赁分类数据
export const getRentalCategories = (): RentalCategory[] => {
  return [
    { id: 1, name: '摄影设备', icon: '📷' },
    { id: 2, name: '运动器材', icon: '🏀' },
    { id: 3, name: '电子设备', icon: '💻' },
    { id: 4, name: '户外用品', icon: '🏕️' },
    { id: 5, name: '音响设备', icon: '🎵' },
    { id: 6, name: '交通工具', icon: '🚲' },
  ];
};

// 模拟数据（用于展示）
const getMockRentals = (): RentalItem[] => {
  return [
    {
      id: 1,
      name: '佳能EOS R5专业相机',
      description: '全画幅无反相机，4500万像素，8K视频录制，适合专业摄影和视频制作',
      categoryId: 1,
      categoryName: '摄影设备',
      rentalRate: '200.00',
      rentalPeriod: 'daily',
      deposit: '3000.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: '专业三脚架套装',
      description: '碳纤维材质，承重15kg，适合各种相机设备，包含云台和收纳包',
      categoryId: 1,
      categoryName: '摄影设备',
      rentalRate: '50.00',
      rentalPeriod: 'daily',
      deposit: '500.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
    },
    {
      id: 3,
      name: '山地自行车',
      description: '27速变速系统，铝合金车架，适合山地骑行和城市通勤',
      categoryId: 6,
      categoryName: '交通工具',
      rentalRate: '80.00',
      rentalPeriod: 'daily',
      deposit: '1000.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      createdAt: '2024-01-18T09:15:00Z',
      updatedAt: '2024-01-18T09:15:00Z',
    },
    {
      id: 4,
      name: 'MacBook Pro 16寸',
      description: 'M2 Max芯片，32GB内存，1TB存储，适合视频剪辑、设计等专业工作',
      categoryId: 3,
      categoryName: '电子设备',
      rentalRate: '300.00',
      rentalPeriod: 'daily',
      deposit: '8000.00',
      status: 'rented_out',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      createdAt: '2024-01-20T16:45:00Z',
      updatedAt: '2024-01-25T10:30:00Z',
    },
    {
      id: 5,
      name: '专业音响系统',
      description: '2000W功率，包含调音台、音箱、无线麦克风，适合活动演出',
      categoryId: 5,
      categoryName: '音响设备',
      rentalRate: '500.00',
      rentalPeriod: 'daily',
      deposit: '2000.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      createdAt: '2024-01-22T11:20:00Z',
      updatedAt: '2024-01-22T11:20:00Z',
    },
    {
      id: 6,
      name: '户外帐篷套装',
      description: '4人帐篷，防水防风，包含睡袋、防潮垫等配件，适合露营活动',
      categoryId: 4,
      categoryName: '户外用品',
      rentalRate: '120.00',
      rentalPeriod: 'daily',
      deposit: '800.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=400&fit=crop',
      createdAt: '2024-01-25T13:00:00Z',
      updatedAt: '2024-01-25T13:00:00Z',
    },
    {
      id: 7,
      name: '篮球装备套装',
      description: '包含篮球、球衣、护具等，适合团队活动和比赛',
      categoryId: 2,
      categoryName: '运动器材',
      rentalRate: '60.00',
      rentalPeriod: 'daily',
      deposit: '300.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
      createdAt: '2024-01-28T08:30:00Z',
      updatedAt: '2024-01-28T08:30:00Z',
    },
    {
      id: 8,
      name: '无人机航拍设备',
      description: 'DJI Mini 3 Pro，4K摄像，智能避障，适合航拍摄影',
      categoryId: 1,
      categoryName: '摄影设备',
      rentalRate: '180.00',
      rentalPeriod: 'daily',
      deposit: '2500.00',
      status: 'in_maintenance',
      imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop',
      createdAt: '2024-02-01T15:10:00Z',
      updatedAt: '2024-02-05T09:45:00Z',
    },
    {
      id: 9,
      name: '电动滑板车',
      description: '续航30公里，最高时速25km/h，折叠便携，适合短途出行',
      categoryId: 6,
      categoryName: '交通工具',
      rentalRate: '100.00',
      rentalPeriod: 'daily',
      deposit: '1200.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop',
      createdAt: '2024-02-03T12:25:00Z',
      updatedAt: '2024-02-03T12:25:00Z',
    },
    {
      id: 10,
      name: '游戏主机套装',
      description: 'PlayStation 5，包含手柄、热门游戏光盘，适合娱乐聚会',
      categoryId: 3,
      categoryName: '电子设备',
      rentalRate: '150.00',
      rentalPeriod: 'daily',
      deposit: '2000.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
      createdAt: '2024-02-05T17:40:00Z',
      updatedAt: '2024-02-05T17:40:00Z',
    },
  ];
};

export default rentalsApi;
