import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Rate } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { restaurantApi, Restaurant, RestaurantQueryParams } from '../../services/restaurant'
import './index.less'

const RestaurantList: React.FC = () => {
  // 状态管理
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSuburb, setSelectedSuburb] = useState<string>('')
  const [sortBy, setSortBy] = useState<'overallRating' | 'totalReviews' | 'createdAt'>('overallRating')

  // 常用区域
  const popularSuburbs = [
    '全部', 'Brisbane City', 'Fortitude Valley', 'West End', 'Paddington'
  ]

  // 排序选项
  const sortOptions = [
    { value: 'overallRating', label: '评分最高' },
    { value: 'totalReviews', label: '评论最多' },
    { value: 'createdAt', label: '最新添加' }
  ]

  // 加载餐厅数据
  const loadRestaurants = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      const params: RestaurantQueryParams = {
        page: 1,
        limit: 20,
        sortBy: sortBy,
        sortOrder: 'desc'
      }

      // 添加筛选条件
      if (selectedSuburb && selectedSuburb !== '全部') {
        params.suburb = selectedSuburb
      }
      
      const response = await restaurantApi.getAllRestaurants(params)
      setRestaurants(response.data || [])
    } catch (error) {
      console.error('加载餐厅失败:', error)
      Taro.showToast({
        title: '加载失败，请稍后重试',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRestaurants(false)
  }

  // 区域筛选
  const handleSuburbFilter = (suburb: string) => {
    setSelectedSuburb(suburb)
  }

  // 排序筛选
  const handleSortFilter = (sort: 'overallRating' | 'totalReviews' | 'createdAt') => {
    setSortBy(sort)
  }

  // 餐厅点击事件
  const handleRestaurantClick = (restaurant: Restaurant) => {
    Taro.navigateTo({
      url: `/pages/restaurant/reviews/index?id=${restaurant.id}&name=${encodeURIComponent(restaurant.name)}`
    })
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

  // 获取餐厅类型标签
  const getRestaurantType = (name: string) => {
    if (name.includes('亚洲') || name.includes('龙宫')) return '亚洲菜'
    if (name.includes('意式') || name.includes('意大利')) return '意大利菜'
    if (name.includes('海鲜')) return '海鲜'
    if (name.includes('川味') || name.includes('川菜')) return '川菜'
    if (name.includes('法式')) return '法国菜'
    if (name.includes('日式')) return '日本菜'
    if (name.includes('墨西哥')) return '墨西哥菜'
    if (name.includes('素食')) return '素食'
    return '其他'
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadRestaurants()
  }, [selectedSuburb, sortBy])

  return (
    <View className='restaurant-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>美食餐厅</Text>
          <Text className='subtitle'>发现身边的美味</Text>
        </View>
      </View>

      {/* 筛选栏 */}
      <View className='filter-section'>
        {/* 区域筛选 */}
        <ScrollView className='suburb-filter' scrollX>
          <View className='filter-list'>
            {popularSuburbs.map(suburb => (
              <View 
                key={suburb}
                className={`filter-item ${selectedSuburb === suburb || (suburb === '全部' && !selectedSuburb) ? 'active' : ''}`}
                onClick={() => handleSuburbFilter(suburb === '全部' ? '' : suburb)}
              >
                <Text className='filter-text'>{suburb}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 排序筛选 */}
        <ScrollView className='sort-filter' scrollX>
          <View className='filter-list'>
            {sortOptions.map(option => (
              <View 
                key={option.value}
                className={`filter-item ${sortBy === option.value ? 'active' : ''}`}
                onClick={() => handleSortFilter(option.value as any)}
              >
                <Text className='filter-text'>{option.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 餐厅列表 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : restaurants.length === 0 ? (
            <Empty 
              description="暂无餐厅信息"
              imageSize={120}
            />
          ) : (
            <View className='restaurants-list'>
              {restaurants.map(restaurant => (
                <View 
                  key={restaurant.id} 
                  className='restaurant-card'
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  {/* 餐厅图片 */}
                  <View className='restaurant-image-container'>
                    <Image 
                      className='restaurant-image'
                      src={restaurant.image}
                      mode='aspectFill'
                      lazyLoad
                    />
                    {/* 餐厅类型标签 */}
                    <View className='type-badge'>
                      {getRestaurantType(restaurant.name)}
                    </View>
                  </View>

                  {/* 餐厅信息 */}
                  <View className='restaurant-info'>
                    <View className='restaurant-header'>
                      <Text className='restaurant-name'>{restaurant.name}</Text>
                      <View className='rating-container'>
                        <Rate 
                          value={formatRating(restaurant.overallRating)} 
                          readOnly 
                        />
                        <Text 
                          className='rating-score'
                          style={{ color: getRatingColor(restaurant.overallRating) }}
                        >
                          {restaurant.overallRating}
                        </Text>
                      </View>
                    </View>
                    
                    <View className='restaurant-location'>
                      <Text className='location-text'>📍 {restaurant.streetAddress}</Text>
                      <Text className='suburb-text'>{restaurant.suburb}, {restaurant.state}</Text>
                    </View>

                    <Text className='restaurant-description'>{restaurant.description}</Text>
                    
                    {/* 底部信息 */}
                    <View className='restaurant-footer'>
                      <View className='review-info'>
                        <Text className='review-count'>💬 {restaurant.totalReviews} 条评价</Text>
                      </View>
                      <View className='action-hint'>
                        <Text className='hint-text'>点击查看评价 →</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
    </View>
  )
}

export default RestaurantList 