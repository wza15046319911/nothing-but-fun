import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import {
  rentalApi,
  RentalItem,
  RentalCategory,
  RentalFilters,
} from "../../services/rental";
import "./index.less";

const RentalPage: React.FC = () => {
  // State
  const [items, setItems] = useState<RentalItem[]>([]);
  const [categories, setCategories] = useState<RentalCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Data Fetching
  const fetchItems = async (category?: string) => {
    try {
      setLoading(true);
      const filters: RentalFilters = {
        limit: 20,
        page: 1,
        sortOrder: "desc",
        sortBy: "date_created",
      };

      if (category && category !== "all") {
        filters.category = category;
      }

      const response = await rentalApi.getAllItems(filters);
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch rentals:", error);
      Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await rentalApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  // Handlers
  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    fetchItems(slug);
  };

  const handleItemClick = (id: number) => {
    Taro.navigateTo({
      url: `/pages/rental/detail/index?id=${id}`,
    });
  };

  // Render Helpers
  const renderLoading = () => (
    <View className="loading-state">
      <View className="state-icon">🌱</View>
      <Text className="state-text">正在寻找好物...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View className="empty-state">
      <View className="state-icon">🍃</View>
      <Text className="state-text">暂无相关租赁物品</Text>
    </View>
  );

  return (
    <View className="rental-container">
      {/* Immersive Header */}
      <View className="rental-header">
        <View className="header-content">
          <Text className="header-title">布好玩租赁</Text>
          <Text className="header-subtitle">精选房产、车辆与设备租赁</Text>

          <View className="header-stats">
            <View className="stat-item">
              <Text className="stat-value">{items.length}</Text>
              <Text className="stat-label">在租</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-value">{categories.length}</Text>
              <Text className="stat-label">分类</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Floating Filters */}
      <View className="filter-section">
        <ScrollView scrollX className="filter-scroll" showScrollbar={false}>
          <View className="filter-options">
            <View
              className={`filter-chip ${
                activeCategory === "all" ? "active" : ""
              }`}
              onClick={() => handleCategoryChange("all")}
            >
              全部
            </View>
            {categories.map((cat) => (
              <View
                key={cat.id}
                className={`filter-chip ${
                  activeCategory === cat.slug ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(cat.slug)}
              >
                {cat.name}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Rental List */}
      <View className="rental-list">
        {loading ? (
          renderLoading()
        ) : items.length === 0 ? (
          renderEmpty()
        ) : (
          <View className="rental-grid">
            {items.map((item) => (
              <View
                key={item.id}
                className="rental-card"
                onClick={() => handleItemClick(item.id)}
              >
                <View className="card-image-wrapper">
                  <Image
                    className="card-image"
                    src={
                      item.imageUrls?.[0] ||
                      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                    }
                    mode="aspectFill"
                    lazyLoad
                  />
                  <View className="category-tag">
                    {categories.find((c) => c.slug === item.category)?.name ||
                      item.category}
                  </View>
                  <View className={`status-badge ${item.status}`} />
                </View>

                <View className="card-content">
                  <Text className="card-title">{item.title}</Text>

                  <View className="card-price-row">
                    <Text className="currency">$</Text>
                    <Text className="price">{item.price}</Text>
                    <Text className="period">
                      /{" "}
                      {item.period === "day"
                        ? "天"
                        : item.period === "week"
                        ? "周"
                        : "月"}
                    </Text>
                  </View>

                  <View className="card-footer">
                    <View className="seller-info">
                      <View className="seller-avatar" />
                      <Text className="seller-name">
                        {item.contact_info || "布好玩管家"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default RentalPage;
