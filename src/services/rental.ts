import request from "./api";

// 租赁商品数据类型
export interface RentalItem {
  id: number;
  title: string;
  description: string;
  price: number | string;
  period: string; // 'day', 'week', 'month'
  images?: string[]; // Legacy or direct URLs
  imageUrls: string[]; // Main images from relations
  status: "available" | "rented";
  category: string;
  contact_info: string;
  features?: string[];
  date_created: string;
  date_updated?: string;
  sellerName?: string;
  sellerAvatar?: string;
}

// 租赁筛选参数
export interface RentalFilters {
  priceFrom?: number;
  priceTo?: number;
  keyword?: string;
  category?: string;
  status?: "available" | "rented";
  sortBy?: "date_created" | "price";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// 分页响应接口
export interface PaginatedRentalResponse {
  data: RentalItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 租赁分类接口
export interface RentalCategory {
  id: number;
  name: string;
  slug: string;
}

// 租赁API服务
export const rentalApi = {
  // 获取所有租赁商品（支持筛选和分页）
  getAllItems: async (
    filters?: RentalFilters
  ): Promise<PaginatedRentalResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.priceFrom !== undefined)
        queryParams.append("priceFrom", filters.priceFrom.toString());
      if (filters?.priceTo !== undefined)
        queryParams.append("priceTo", filters.priceTo.toString());
      if (filters?.keyword) queryParams.append("keyword", filters.keyword);
      if (filters?.category) queryParams.append("category", filters.category);
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.page !== undefined)
        queryParams.append("page", filters.page.toString());
      if (filters?.limit !== undefined)
        queryParams.append("limit", filters.limit.toString());
      if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters?.sortOrder)
        queryParams.append("sortOrder", filters.sortOrder);

      const url = queryParams.toString()
        ? `/rental?${queryParams.toString()}`
        : "/rental";

      // Note: Since backend endpoints might not be ready, we handle potential 404s gracefully or expect standard response structure
      const response = await request({
        url,
        method: "GET",
      });

      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        "total" in response
      ) {
        return response as PaginatedRentalResponse;
      }

      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1,
        } as PaginatedRentalResponse;
      }

      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      } as PaginatedRentalResponse;
    } catch (error) {
      console.error("Failed to fetch rental items:", error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      } as PaginatedRentalResponse;
    }
  },

  // 根据ID获取租赁商品
  getItemById: (id: number): Promise<RentalItem> => {
    return request({
      url: `/rental/${id}`,
      method: "GET",
    });
  },

  // 获取租赁分类
  getCategories: async (): Promise<RentalCategory[]> => {
    try {
      const response = await request({
        url: "/rental/categories",
        method: "GET",
      });

      // Backend returns { success: true, data: [...] }
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map(
          (cat: { id: string; name: string }, index: number) => ({
            id: index + 1,
            name: cat.name,
            slug: cat.id, // Backend returns category value as id
          })
        );
      }

      // Fallback to hardcoded categories if API fails
      return [
        { id: 1, name: "房产", slug: "house" },
        { id: 2, name: "车辆", slug: "car" },
        { id: 3, name: "设备", slug: "equipment" },
        { id: 4, name: "接送机", slug: "pickup" },
        { id: 5, name: "拼车", slug: "carpool" },
        { id: 6, name: "其他", slug: "other" },
      ];
    } catch (error) {
      console.error("Failed to fetch rental categories:", error);
      // Fallback to hardcoded categories on error
      return [
        { id: 1, name: "房产", slug: "house" },
        { id: 2, name: "车辆", slug: "car" },
        { id: 3, name: "设备", slug: "equipment" },
        { id: 4, name: "接送机", slug: "pickup" },
        { id: 5, name: "拼车", slug: "carpool" },
        { id: 6, name: "其他", slug: "other" },
      ];
    }
  },
};
