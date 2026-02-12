import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { restaurantApi, Restaurant, RestaurantFilters } from '../../services/restaurant';
import { useRestaurantTypes } from '../../hooks/useTypes';
import RestaurantFiltersComponent from '../../components/RestaurantFiltersNew';
import Pagination from '../../components/Pagination';
import './index.less';

const RestaurantList: React.FC = () => {
  const { getRestaurantTypeName, getPriceRangeName } = useRestaurantTypes();

  // State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Filter State
  const [currentFilters, setCurrentFilters] = useState<RestaurantFilters>({
    page: 1,
    limit: 10,
    sortBy: 'sort',
    sortOrder: 'asc',
  });

  // Load Data
  const loadRestaurants = async (
    showLoading = true,
    filters: RestaurantFilters = currentFilters
  ) => {
    try {
      if (showLoading) setLoading(true);

      const response = await restaurantApi.getAllRestaurantsPaginated(filters);
      setRestaurants(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('加载餐厅失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  };

  // Handle Filter Change
  const handleFiltersChange = (filters: RestaurantFilters) => {
    const newFilters = {
      ...filters,
      page: 1,
      limit: 10,
    };
    if (!newFilters.sortBy) newFilters.sortBy = 'sort';
    if (!newFilters.sortOrder) newFilters.sortOrder = 'asc';

    setCurrentFilters(newFilters);
    loadRestaurants(true, newFilters);
  };

  // Handle Page Change
  const handlePageChange = (page: number) => {
    const newFilters = { ...currentFilters, page };
    setCurrentFilters(newFilters);
    loadRestaurants(true, newFilters);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    Taro.navigateTo({
      url: `/pages/restaurant/detail/index?id=${restaurant.id}&name=${encodeURIComponent(restaurant.name)}`,
    });
  };

  const getAllImages = (restaurant: Restaurant) => {
    if (restaurant.imageUrls && restaurant.imageUrls.length > 0) return restaurant.imageUrls;
    return restaurant.image ? [restaurant.image] : [];
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  return (
    <ScrollView
      className="restaurant-container"
      scrollY
      style={{ height: '100vh' }}
    >
      {/* Immersive Header */}
      <View className="enhanced-header">
        <View className="header-content">
          <View className="title-section">
            <Text className="main-title">布村好吃榜</Text>
            <Text className="subtitle">真点评 · 发现布里斯班地道美味</Text>
            <View className="stats-row">
              <View className="stat-item">
                <Text className="stat-number">{restaurants.length}</Text>
                <Text className="stat-label">家精选</Text>
              </View>
              <View className="stat-divider"></View>
              <View className="stat-item">
                <Text className="stat-number">4.5+</Text>
                <Text className="stat-label">严选标准</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Floating Filters */}
      <RestaurantFiltersComponent
        onFiltersChange={handleFiltersChange}
        initialFilters={currentFilters}
      />

      {/* List Content */}
      <View className="enhanced-content">
        {loading ? (
          <View className="enhanced-loading-container">
            <View className="loading-dots">
              <View className="dot"></View>
            </View>
            <Text>正在寻觅美味...</Text>
          </View>
        ) : restaurants.length === 0 ? (
          <View className="enhanced-empty-container">
            <Text className="empty-icon">🍽️</Text>
            <Text style={{ fontSize: '32rpx', fontWeight: 'bold', marginBottom: '16rpx' }}>
              暂无餐厅
            </Text>
            <Text>换个筛选条件试试吧</Text>
          </View>
        ) : (
          <View className="enhanced-restaurants-list">
            {restaurants.map((restaurant, index) => {
              const images = getAllImages(restaurant);
              // 完全按照 detail 页面的逻辑
              let priceDisplay = '';
              if (restaurant.pricingDetails) {
                priceDisplay = restaurant.pricingDetails;
              } else {
                const hasFrom = restaurant.priceFrom !== undefined && restaurant.priceFrom !== null;
                const hasTo = restaurant.priceTo !== undefined && restaurant.priceTo !== null;
                if (hasFrom && hasTo) {
                  priceDisplay =
                    restaurant.priceFrom === restaurant.priceTo
                      ? `$${restaurant.priceFrom}`
                      : `$${restaurant.priceFrom} - $${restaurant.priceTo}`;
                } else if (hasFrom) {
                  priceDisplay = `$${restaurant.priceFrom}+`;
                } else if (hasTo) {
                  priceDisplay = `Up to $${restaurant.priceTo}`;
                } else if (restaurant.priceRangeRid) {
                  priceDisplay = getPriceRangeName(restaurant.priceRangeRid);
                }
              }
              return (
                <View
                  key={restaurant.id}
                  className="enhanced-restaurant-card"
                  onClick={() => handleRestaurantClick(restaurant)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Section */}
                  <View className="card-image-wrapper">
                    {images.length > 0 ? (
                      <Image className="card-image" src={images[0]} mode="aspectFill" lazyLoad />
                    ) : (
                      <View className="card-image-placeholder"></View>
                    )}
                    <View className="card-overlay"></View>

                    {/* Top Badges */}
                    <View className="card-badges">
                      <View className="badges-left" style={{ display: 'flex', gap: '12rpx' }}>
                        <View className="badge type-badge">
                          <Text>{getRestaurantTypeName(restaurant.restaurantTypeRid)}</Text>
                        </View>
                        {priceDisplay && (
                          <View className="badge price-badge">
                            <Text>{priceDisplay}</Text>
                          </View>
                        )}
                      </View>
                      <View className="badge rating-badge">
                        <Text className="star">⭐</Text>
                        <Text className="score">{restaurant.overallRating}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Content Section */}
                  <View className="card-content">
                    <View className="card-header">
                      <Text className="restaurant-name">{restaurant.name}</Text>
                      {restaurant.pricingDetails && (
                        <Text className="restaurant-price">{restaurant.pricingDetails}</Text>
                      )}
                    </View>

                    <View className="card-meta">
                      <Text className="meta-text">{restaurant.suburb}</Text>
                      {restaurant.state && <Text className="meta-dot">·</Text>}
                      {restaurant.state && <Text className="meta-text">{restaurant.state}</Text>}
                    </View>

                    <View className="card-footer">
                      <View className="review-stat">
                        <Text className="icon">💬</Text>
                        <Text className="count">{restaurant.totalReviews} 条真实点评</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {!loading && restaurants.length > 0 && pagination.totalPages > 1 && (
          <View style={{ marginTop: '40rpx' }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.totalPages * pagination.limit} // Approximation
              pageSize={pagination.limit}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </View>
        )}

        <View style={{ height: '60rpx' }}></View>
      </View>
    </ScrollView>
  );
};

export default RestaurantList;
