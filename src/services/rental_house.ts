import request from './api'

// 租房数据类型
export interface RentalHouse {
  id: number
  title: string
  description: string
  weeklyPrice: string
  depositPrice: string
  bondAmount: string
  bedrooms: number
  bathrooms: number
  carSpaces: number
  studyRooms: number
  propertyType: string
  streetAddress: string
  suburb: string
  state: string
  postcode: string
  country: string
  latitude: string
  longitude: string
  images: string[]
  mainImageIndex: number
  features: string[]
  furnished: boolean
  petsAllowed: boolean
  smokingAllowed: boolean
  availableFrom: string
  minimumLeaseTerm: number
  maximumLeaseTerm: number | null
  floorArea: number
  landArea: number | null
  buildYear: number
  utilitiesIncluded: string[]
  additionalCosts: Array<{
    name: string
    amount: number
    frequency: string
  }>
  contactName: string
  contactPhone: string
  contactEmail: string
  agencyName: string
  status: string
  isActive: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  propertyConfig: string
}

// 查询参数接口
export interface RentalHouseQueryParams {
  page?: number
  limit?: number
  sortBy?: 'weeklyPrice' | 'createdAt' | 'viewCount'
  sortOrder?: 'asc' | 'desc'
  suburb?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  furnished?: boolean
  petsAllowed?: boolean
  smokingAllowed?: boolean
  status?: string
}

// API响应接口
export interface RentalHouseResponse {
  success: boolean
  message: string
  data: RentalHouse[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SingleRentalHouseResponse {
  success: boolean
  message: string
  data: RentalHouse
}

// 租房API
export const rentalHouseApi = {
  // 获取所有租房信息
  getAllRentalHouses: async (params?: RentalHouseQueryParams): Promise<RentalHouseResponse> => {
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
        url: `/rental-houses${queryString}`,
        method: 'GET'
      }) as RentalHouseResponse
      
      return response || { success: false, message: '获取数据失败', data: [] }
    } catch (error) {
      console.error('获取租房列表失败:', error)
      // 返回模拟数据用于展示
      return {
        success: true,
        message: '获取租房列表成功（模拟数据）',
        data: getMockRentalHouses(),
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

  // 根据ID获取单个租房信息
  getRentalHouseById: async (id: number): Promise<RentalHouse | null> => {
    try {
      const response = await request({
        url: `/rental-houses/${id}`,
        method: 'GET'
      }) as SingleRentalHouseResponse
      
      return response?.data || null
    } catch (error) {
      console.error('获取租房详情失败:', error)
      // 返回模拟数据
      const mockHouses = getMockRentalHouses()
      return mockHouses.find(house => house.id === id) || null
    }
  },

  // 创建新租房信息
  createRentalHouse: async (houseData: Omit<RentalHouse, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'propertyConfig' | 'viewCount'>): Promise<RentalHouse | null> => {
    try {
      const response = await request({
        url: '/rental-houses',
        method: 'POST',
        data: houseData
      }) as SingleRentalHouseResponse
      
      return response?.data || null
    } catch (error) {
      console.error('创建租房信息失败:', error)
      throw error
    }
  },

  // 更新租房信息
  updateRentalHouse: async (id: number, houseData: Partial<Omit<RentalHouse, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'propertyConfig' | 'viewCount'>>): Promise<RentalHouse | null> => {
    try {
      const response = await request({
        url: `/rental-houses/${id}`,
        method: 'PUT',
        data: houseData
      }) as SingleRentalHouseResponse
      
      return response?.data || null
    } catch (error) {
      console.error('更新租房信息失败:', error)
      throw error
    }
  },

  // 删除租房信息
  deleteRentalHouse: async (id: number): Promise<boolean> => {
    try {
      const response = await request({
        url: `/rental-houses/${id}`,
        method: 'DELETE'
      })
      
      return response?.success || false
    } catch (error) {
      console.error('删除租房信息失败:', error)
      throw error
    }
  },

  // 根据区域获取租房信息
  getRentalHousesBySuburb: async (suburb: string): Promise<RentalHouse[]> => {
    try {
      const response = await request({
        url: `/rental-houses/suburb/${encodeURIComponent(suburb)}`,
        method: 'GET'
      }) as RentalHouseResponse
      
      return response?.data || []
    } catch (error) {
      console.error('根据区域获取租房信息失败:', error)
      return []
    }
  },

  // 根据价格范围获取租房信息
  getRentalHousesByPriceRange: async (minPrice: number, maxPrice: number): Promise<RentalHouse[]> => {
    try {
      const response = await request({
        url: `/rental-houses/price-range/${minPrice}/${maxPrice}`,
        method: 'GET'
      }) as RentalHouseResponse
      
      return response?.data || []
    } catch (error) {
      console.error('根据价格范围获取租房信息失败:', error)
      return []
    }
  },

  // 搜索租房信息
  searchRentalHouses: async (keyword: string): Promise<RentalHouse[]> => {
    try {
      const response = await request({
        url: `/rental-houses/search/${encodeURIComponent(keyword)}`,
        method: 'GET'
      }) as RentalHouseResponse
      
      return response?.data || []
    } catch (error) {
      console.error('搜索租房信息失败:', error)
      return []
    }
  }
}

// 模拟数据（用于展示和测试）
const getMockRentalHouses = (): RentalHouse[] => {
  return [
    {
      id: 1,
      title: '现代2卧公寓，城市景观',
      description: '位于南布里斯班的现代化2卧室公寓，享有壮观的城市天际线景观。公寓设施齐全，包含健身房、游泳池和24小时礼宾服务。',
      weeklyPrice: '650.00',
      depositPrice: '2600.00',
      bondAmount: '1300.00',
      bedrooms: 2,
      bathrooms: 2,
      carSpaces: 1,
      studyRooms: 0,
      propertyType: 'apartment',
      streetAddress: '123 Grey Street',
      suburb: 'South Brisbane',
      state: 'QLD',
      postcode: '4101',
      country: 'Australia',
      latitude: '-27.4810',
      longitude: '153.0234',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['pool', 'gym', 'balcony', 'air_conditioning'],
      furnished: true,
      petsAllowed: false,
      smokingAllowed: false,
      availableFrom: '2024-02-01T00:00:00.000Z',
      minimumLeaseTerm: 12,
      maximumLeaseTerm: 24,
      floorArea: 85,
      landArea: null,
      buildYear: 2018,
      utilitiesIncluded: ['water', 'internet'],
      additionalCosts: [{ name: 'Parking', amount: 50, frequency: 'weekly' }],
      contactName: 'Sarah Johnson',
      contactPhone: '0412345678',
      contactEmail: 'sarah@realestate.com.au',
      agencyName: 'Brisbane Premium Properties',
      status: 'available',
      isActive: true,
      viewCount: 45,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
      publishedAt: '2024-01-15T10:00:00.000Z',
      propertyConfig: '2b2b1c'
    },
    {
      id: 2,
      title: '宽敞3卧别墅，带花园',
      description: '位于Paddington的迷人家庭别墅，拥有现代化设施和私人花园。保留了历史建筑的特色，同时提供现代化的舒适生活。',
      weeklyPrice: '850.00',
      depositPrice: '3400.00',
      bondAmount: '1700.00',
      bedrooms: 3,
      bathrooms: 2,
      carSpaces: 2,
      studyRooms: 1,
      propertyType: 'house',
      streetAddress: '45 Latrobe Terrace',
      suburb: 'Paddington',
      state: 'QLD',
      postcode: '4064',
      country: 'Australia',
      latitude: '-27.4598',
      longitude: '152.9987',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['garden', 'heritage_features', 'polished_floors'],
      furnished: false,
      petsAllowed: true,
      smokingAllowed: false,
      availableFrom: '2024-03-01T00:00:00.000Z',
      minimumLeaseTerm: 12,
      maximumLeaseTerm: null,
      floorArea: 120,
      landArea: 405,
      buildYear: 1920,
      utilitiesIncluded: ['water'],
      additionalCosts: [],
      contactName: 'Michael Chen',
      contactPhone: '0423456789',
      contactEmail: 'michael@paddingtonrealty.com.au',
      agencyName: 'Paddington Realty',
      status: 'available',
      isActive: true,
      viewCount: 32,
      createdAt: '2024-01-20T14:30:00.000Z',
      updatedAt: '2024-01-20T14:30:00.000Z',
      publishedAt: '2024-01-20T14:30:00.000Z',
      propertyConfig: '3b2b2c1s'
    },
    {
      id: 3,
      title: '温馨1卧公寓，近市中心',
      description: '位于Fortitude Valley的现代1卧室公寓，步行即可到达市中心和各种娱乐设施。完美适合年轻专业人士或学生。',
      weeklyPrice: '450.00',
      depositPrice: '1800.00',
      bondAmount: '900.00',
      bedrooms: 1,
      bathrooms: 1,
      carSpaces: 0,
      studyRooms: 0,
      propertyType: 'apartment',
      streetAddress: '789 Ann Street',
      suburb: 'Fortitude Valley',
      state: 'QLD',
      postcode: '4006',
      country: 'Australia',
      latitude: '-27.4575',
      longitude: '153.0354',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['balcony', 'air_conditioning', 'close_to_transport'],
      furnished: true,
      petsAllowed: false,
      smokingAllowed: false,
      availableFrom: '2024-02-15T00:00:00.000Z',
      minimumLeaseTerm: 6,
      maximumLeaseTerm: 12,
      floorArea: 55,
      landArea: null,
      buildYear: 2015,
      utilitiesIncluded: ['water', 'internet'],
      additionalCosts: [],
      contactName: 'Emma Wilson',
      contactPhone: '0434567890',
      contactEmail: 'emma@valleyproperties.com.au',
      agencyName: 'Valley Properties',
      status: 'available',
      isActive: true,
      viewCount: 28,
      createdAt: '2024-01-25T09:15:00.000Z',
      updatedAt: '2024-01-25T09:15:00.000Z',
      publishedAt: '2024-01-25T09:15:00.000Z',
      propertyConfig: '1b1b'
    },
    {
      id: 4,
      title: '豪华4卧别墅，河景',
      description: '位于Bulimba的豪华4卧室别墅，享有布里斯班河的壮丽景色。拥有私人码头、游泳池和娱乐区域，是家庭生活的理想选择。',
      weeklyPrice: '1200.00',
      depositPrice: '4800.00',
      bondAmount: '2400.00',
      bedrooms: 4,
      bathrooms: 3,
      carSpaces: 2,
      studyRooms: 1,
      propertyType: 'house',
      streetAddress: '12 Riverfront Drive',
      suburb: 'Bulimba',
      state: 'QLD',
      postcode: '4171',
      country: 'Australia',
      latitude: '-27.4456',
      longitude: '153.0598',
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['pool', 'river_views', 'private_jetty', 'entertainment_area'],
      furnished: false,
      petsAllowed: true,
      smokingAllowed: false,
      availableFrom: '2024-04-01T00:00:00.000Z',
      minimumLeaseTerm: 12,
      maximumLeaseTerm: 24,
      floorArea: 280,
      landArea: 650,
      buildYear: 2010,
      utilitiesIncluded: ['water'],
      additionalCosts: [
        { name: 'Pool Maintenance', amount: 80, frequency: 'weekly' },
        { name: 'Garden Maintenance', amount: 60, frequency: 'weekly' }
      ],
      contactName: 'David Thompson',
      contactPhone: '0445678901',
      contactEmail: 'david@riverfrontrealty.com.au',
      agencyName: 'Riverfront Realty',
      status: 'available',
      isActive: true,
      viewCount: 67,
      createdAt: '2024-02-01T11:20:00.000Z',
      updatedAt: '2024-02-01T11:20:00.000Z',
      publishedAt: '2024-02-01T11:20:00.000Z',
      propertyConfig: '4b3b2c1s'
    },
    {
      id: 5,
      title: '学生公寓，近昆士兰大学',
      description: '位于St Lucia的现代学生公寓，步行5分钟即可到达昆士兰大学。设施齐全，包含学习区域和公共休息室。',
      weeklyPrice: '380.00',
      depositPrice: '1520.00',
      bondAmount: '760.00',
      bedrooms: 1,
      bathrooms: 1,
      carSpaces: 0,
      studyRooms: 1,
      propertyType: 'apartment',
      streetAddress: '456 Sir William MacGregor Drive',
      suburb: 'St Lucia',
      state: 'QLD',
      postcode: '4067',
      country: 'Australia',
      latitude: '-27.4975',
      longitude: '153.0137',
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['study_area', 'close_to_university', 'furnished', 'common_room'],
      furnished: true,
      petsAllowed: false,
      smokingAllowed: false,
      availableFrom: '2024-02-20T00:00:00.000Z',
      minimumLeaseTerm: 6,
      maximumLeaseTerm: 12,
      floorArea: 45,
      landArea: null,
      buildYear: 2019,
      utilitiesIncluded: ['water', 'internet', 'electricity'],
      additionalCosts: [],
      contactName: 'Lisa Zhang',
      contactPhone: '0456789012',
      contactEmail: 'lisa@studentliving.com.au',
      agencyName: 'Student Living Solutions',
      status: 'available',
      isActive: true,
      viewCount: 89,
      createdAt: '2024-02-05T16:45:00.000Z',
      updatedAt: '2024-02-05T16:45:00.000Z',
      publishedAt: '2024-02-05T16:45:00.000Z',
      propertyConfig: '1b1b1s'
    },
    {
      id: 6,
      title: '海滨公寓，黄金海岸',
      description: '位于Surfers Paradise的豪华海滨公寓，享有太平洋的无敌海景。设施包含度假村式游泳池、健身房和桑拿浴室。',
      weeklyPrice: '950.00',
      depositPrice: '3800.00',
      bondAmount: '1900.00',
      bedrooms: 2,
      bathrooms: 2,
      carSpaces: 1,
      studyRooms: 0,
      propertyType: 'apartment',
      streetAddress: '88 The Esplanade',
      suburb: 'Surfers Paradise',
      state: 'QLD',
      postcode: '4217',
      country: 'Australia',
      latitude: '-27.9979',
      longitude: '153.4309',
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['ocean_views', 'pool', 'gym', 'sauna', 'beachfront'],
      furnished: true,
      petsAllowed: false,
      smokingAllowed: false,
      availableFrom: '2024-03-15T00:00:00.000Z',
      minimumLeaseTerm: 6,
      maximumLeaseTerm: 12,
      floorArea: 95,
      landArea: null,
      buildYear: 2016,
      utilitiesIncluded: ['water'],
      additionalCosts: [{ name: 'Resort Facilities', amount: 100, frequency: 'weekly' }],
      contactName: 'Mark Roberts',
      contactPhone: '0467890123',
      contactEmail: 'mark@goldcoastliving.com.au',
      agencyName: 'Gold Coast Living',
      status: 'available',
      isActive: true,
      viewCount: 156,
      createdAt: '2024-02-10T13:30:00.000Z',
      updatedAt: '2024-02-10T13:30:00.000Z',
      publishedAt: '2024-02-10T13:30:00.000Z',
      propertyConfig: '2b2b1c'
    },
    {
      id: 7,
      title: '工业风阁楼，West End',
      description: '位于West End的独特工业风阁楼公寓，拥有高天花板和大窗户。周围有众多咖啡馆、餐厅和艺术画廊。',
      weeklyPrice: '720.00',
      depositPrice: '2880.00',
      bondAmount: '1440.00',
      bedrooms: 2,
      bathrooms: 1,
      carSpaces: 1,
      studyRooms: 0,
      propertyType: 'apartment',
      streetAddress: '234 Boundary Street',
      suburb: 'West End',
      state: 'QLD',
      postcode: '4101',
      country: 'Australia',
      latitude: '-27.4848',
      longitude: '153.0081',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['high_ceilings', 'industrial_style', 'large_windows', 'artistic_area'],
      furnished: false,
      petsAllowed: true,
      smokingAllowed: false,
      availableFrom: '2024-03-01T00:00:00.000Z',
      minimumLeaseTerm: 12,
      maximumLeaseTerm: null,
      floorArea: 110,
      landArea: null,
      buildYear: 1995,
      utilitiesIncluded: ['water'],
      additionalCosts: [],
      contactName: 'Sophie Martinez',
      contactPhone: '0478901234',
      contactEmail: 'sophie@westendproperties.com.au',
      agencyName: 'West End Properties',
      status: 'available',
      isActive: true,
      viewCount: 73,
      createdAt: '2024-02-15T10:00:00.000Z',
      updatedAt: '2024-02-15T10:00:00.000Z',
      publishedAt: '2024-02-15T10:00:00.000Z',
      propertyConfig: '2b1b1c'
    },
    {
      id: 8,
      title: '家庭别墅，安静社区',
      description: '位于Carindale的宁静家庭别墅，拥有大后院和双车库。靠近优质学校和购物中心，是家庭生活的理想选择。',
      weeklyPrice: '680.00',
      depositPrice: '2720.00',
      bondAmount: '1360.00',
      bedrooms: 3,
      bathrooms: 2,
      carSpaces: 2,
      studyRooms: 0,
      propertyType: 'house',
      streetAddress: '567 Creek Road',
      suburb: 'Carindale',
      state: 'QLD',
      postcode: '4152',
      country: 'Australia',
      latitude: '-27.5186',
      longitude: '153.1019',
      images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop'],
      mainImageIndex: 0,
      features: ['large_backyard', 'double_garage', 'family_friendly', 'quiet_area'],
      furnished: false,
      petsAllowed: true,
      smokingAllowed: false,
      availableFrom: '2024-04-01T00:00:00.000Z',
      minimumLeaseTerm: 12,
      maximumLeaseTerm: 24,
      floorArea: 160,
      landArea: 600,
      buildYear: 2005,
      utilitiesIncluded: ['water'],
      additionalCosts: [{ name: 'Garden Maintenance', amount: 40, frequency: 'weekly' }],
      contactName: 'James Wilson',
      contactPhone: '0489012345',
      contactEmail: 'james@familyhomes.com.au',
      agencyName: 'Family Homes Realty',
      status: 'available',
      isActive: true,
      viewCount: 41,
      createdAt: '2024-02-20T14:15:00.000Z',
      updatedAt: '2024-02-20T14:15:00.000Z',
      publishedAt: '2024-02-20T14:15:00.000Z',
      propertyConfig: '3b2b2c'
    }
  ]
}

export default rentalHouseApi
