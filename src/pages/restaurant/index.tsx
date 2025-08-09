import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Rate, Swiper } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { restaurantApi, Restaurant, RestaurantFilters } from '../../services/restaurant'
import { useRestaurantTypes } from '../../hooks/useTypes'
import RestaurantFiltersComponent from '../../components/RestaurantFilters'
import Pagination from '../../components/Pagination'
import './index.less'

const RestaurantList: React.FC = () => {
  // 状态管理
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)


  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    // total: 0,
    totalPages: 0
  })

  // State for filters
  const [currentFilters, setCurrentFilters] = useState<RestaurantFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'asc'
  })



  // 加载餐厅数据
  const loadRestaurants = async (showLoading = true, filters: RestaurantFilters = currentFilters) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      // 使用新的分页API
      const response = await restaurantApi.getAllRestaurantsPaginated(filters)
      setRestaurants(response.data)
      setPagination({
        page: response.page,
        limit: response.limit,
        // total: response.total,
        totalPages: response.totalPages
      })
    } catch (error) {
      console.error('加载餐厅失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      Taro.showToast({
        title: `加载失败: ${errorMessage}`,
        icon: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (filters: RestaurantFilters) => {
    const newFilters = {
      ...filters,
      page: 1, // 重置到第一页
      limit: 10
    }
    setCurrentFilters(newFilters)
    loadRestaurants(true, newFilters)
  }

  // Handle pagination change
  const handlePageChange = (page: number) => {
    const newFilters = {
      ...currentFilters,
      page
    }
    setCurrentFilters(newFilters)
    loadRestaurants(true, newFilters)
  }

  // 下拉刷新
  const handleRefresh = async () => {
    await loadRestaurants(true)
  }



  // 餐厅点击事件
  const handleRestaurantClick = (restaurant: Restaurant) => {
    Taro.navigateTo({ url: `/pages/restaurant/detail/index?id=${restaurant.id}&name=${encodeURIComponent(restaurant.name)}` })
  }

  // 格式化评分显示
  const formatRating = (rating: string) => {
    return parseFloat(rating)
  }

  // 获取评分颜色
  const getRatingColor = (rating: string) => {
    const score = parseFloat(rating)
    if (score >= 4.5) return '#52c41a'
    if (score >= 4.0) return '#faad14'
    if (score >= 3.5) return '#fa8c16'
    return '#ff4d4f'
  }

  // 获取餐厅所有图片 (优先使用 imageUrls 数组，备用 image)
  const getAllImages = (restaurant: Restaurant) => {
    // 优先使用 imageUrls 字段
    if (restaurant.imageUrls && restaurant.imageUrls.length > 0) {
      return restaurant.imageUrls
    }
    // 备用方案：使用单个 image 字段
    return restaurant.image ? [restaurant.image] : []
  }

  // 从后端加载餐厅类型
  const { getRestaurantTypeName } = useRestaurantTypes()

  // 组件挂载时加载数据
  useEffect(() => {
    loadRestaurants()
  }, [])

  return (
    <View className='restaurant-container'>
      {/* 增强的页面头部 */}
      <View className='enhanced-header'>
        <View className='header-background'>
          <View className='floating-shapes'>
            <View className='shape shape-1'></View>
            <View className='shape shape-2'></View>
            <View className='shape shape-3'></View>
          </View>
        </View>
        <View className='header-content'>
          <View className='title-section'>
            <Text className='main-title'>美食餐厅</Text>
            <Text className='subtitle'>发现身边的美味</Text>
            <View className='stats-row'>
              <View className='stat-item'>
                <Text className='stat-number'>{restaurants.length}</Text>
                <Text className='stat-label'>家餐厅</Text>
              </View>
              <View className='stat-divider'></View>
              <View className='stat-item'>
                <Text className='stat-number'>4.5+</Text>
                <Text className='stat-label'>平均评分</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 筛选器 - 浮动卡片样式 */}
      <View className='filters-wrapper'>
        <RestaurantFiltersComponent
          onFiltersChange={handleFiltersChange}
          initialFilters={currentFilters}
        />
      </View>

      {/* 餐厅列表 - 重新设计 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className='enhanced-content' scrollY>
          {loading ? (
            <View className='enhanced-loading-container'>
              <View className='loading-animation'>
                <View className='loading-dots'>
                  <View className='dot dot-1'></View>
                  <View className='dot dot-2'></View>
                  <View className='dot dot-3'></View>
                </View>
                <Text className='loading-text'>正在为您寻找美味...</Text>
              </View>
            </View>
          ) : restaurants.length === 0 ? (
            <View className='enhanced-empty-container'>
              <View className='empty-animation'>
                <Text className='empty-icon'>🍽️</Text>
                <Text className='empty-title'>暂无餐厅信息</Text>
                <Text className='empty-subtitle'>换个筛选条件试试吧</Text>
              </View>
            </View>
          ) : (
            <View className='enhanced-restaurants-list'>
              {restaurants.map((restaurant, index) => (
                <View
                  key={restaurant.id}
                  className={`enhanced-restaurant-card card-${index % 2 === 0 ? 'left' : 'right'}`}
                  onClick={() => handleRestaurantClick(restaurant)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 增强的餐厅图片区域 */}
                  <View className='enhanced-image-section'>
                    {(() => {
                      const images = getAllImages(restaurant)

                      return (
                        <View className='image-container'>
                          {images.length > 1 ? (
                            <View className='swiper-container'>
                              <Swiper
                                defaultValue={0}
                                indicator
                                autoplay={false}
                                style={{ height: '240rpx', width: '100%' }}
                              >
                                {images.map((imageUrl, index) => (
                                  <Swiper.Item key={index}>
                                    <Image
                                      className='enhanced-restaurant-image'
                                      src={imageUrl}
                                      mode='aspectFill'
                                      lazyLoad
                                      onError={() => console.log('Image load failed:', imageUrl)}
                                    />
                                  </Swiper.Item>
                                ))}
                              </Swiper>
                            </View>
                          ) : (
                            <View className='single-image-container'>
                              <Image
                                className='enhanced-restaurant-image'
                                src={images[0] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'}
                                mode='aspectFill'
                                lazyLoad
                              />
                            </View>
                          )}

                          {/* 浮动标签 */}
                          <View className='floating-badges'>
                            <View className='type-badge-enhanced'>
                              <Text className='type-text'>
                                {getRestaurantTypeName(restaurant.restaurantTypeRid)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )
                    })()}
                  </View>

                  {/* 增强的餐厅信息 */}
                  <View className='enhanced-restaurant-info'>
                    <View className='info-header'>
                      <View className='name-section'>
                        <Text className='enhanced-restaurant-name'>{restaurant.name}</Text>
                        <View className='quick-stats'>
                          <View className='stat-chip'>
                            <Text className='chip-icon'>💬</Text>
                            <Text className='chip-text'>{restaurant.totalReviews}</Text>
                          </View>
                          {restaurant.pricingDetails && (
                            <View className='stat-chip price-chip'>
                              <Text className='chip-icon'>💰</Text>
                              <Text className='chip-text'>{restaurant.pricingDetails}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View className='location-section'>
                      <View className='location-row'>
                        <Text className='location-icon'>📍</Text>
                        <View className='location-details'>
                          <Text className='street-address'>{restaurant.streetAddress}</Text>
                          <Text className='suburb-state'>{restaurant.suburb}, {restaurant.state}</Text>
                        </View>
                      </View>
                    </View>

                    <View className='description-section'>
                      <Text className='enhanced-description'>{restaurant.description}</Text>
                    </View>

                    <View className='action-section'>
                      
                      <View className='action-button'>
                        <Text className='action-text'>查看详情</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 增强的分页 */}
          {!loading && restaurants.length > 0 && pagination.totalPages > 1 && (
            <View className='enhanced-pagination-wrapper'>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.totalPages * pagination.limit}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </View>
          )}

          {/* 增强的底部提示 */}
          {!loading && restaurants.length > 0 && pagination.totalPages <= 1 && (
            <View className='enhanced-bottom-tip'>
              <View className='tip-content'>
                <Text className='tip-icon'>🎉</Text>
                <Text className='tip-text'>已显示全部餐厅</Text>
                <Text className='tip-subtext'>发现了 {restaurants.length} 家美味餐厅</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
    </View>
  )
}

export default RestaurantList 