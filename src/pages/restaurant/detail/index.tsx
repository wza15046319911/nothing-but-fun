import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import { Rate, Button } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { restaurantApi, Restaurant } from '../../../services/restaurant'
import { useAuth } from '../../../context/auth'
import './index.less'

const RestaurantDetail: React.FC = () => {
  const router = useRouter()
  const { state: authState } = useAuth()
  const { isLoggedIn, userInfo } = authState  // 修复：使用userInfo而不是user
  
  // State management
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Rating state
  const [ratings, setRatings] = useState({
    overall: 5,
    taste: 5,
    environment: 5,
    service: 5,
    price: 5
  })

  // Get restaurant ID from router params
  const restaurantId = parseInt(router.params.id || '0')

  // Load restaurant details
  const loadRestaurantDetail = async () => {
    try {
      setLoading(true)
      console.log('Loading restaurant detail for ID:', restaurantId)

      if (!restaurantId || restaurantId === 0) {
        throw new Error('餐厅ID无效')
      }

      const response = await restaurantApi.getRestaurantById(restaurantId)
      console.log('Restaurant detail response:', response)

      if (response) {
        setRestaurant(response)
      } else {
        throw new Error('餐厅不存在')
      }
    } catch (error) {
      console.error('加载餐厅详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!isLoggedIn || !userInfo) {  // 修复：使用userInfo而不是user
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      // 可以跳转到登录页面
      Taro.navigateTo({
        url: '/pages/user-login/index'
      })
      return
    }

    try {
      const ratingData = {
        userId: parseInt(userInfo.id),  // 修复：转换为number类型
        username: userInfo.nickname || '匿名用户',  // 修复：使用userInfo而不是user
        content: '用户评分', // 简化版本，不需要评价内容
        rating: ratings.overall,
        tasteRating: ratings.taste,
        environmentRating: ratings.environment,
        serviceRating: ratings.service,
        priceRating: ratings.price
      }

      await restaurantApi.rateRestaurant(restaurantId, ratingData)
      
      Taro.showToast({
        title: '评分提交成功',
        icon: 'success',
        duration: 2000
      })
      
      // Reload restaurant details to get updated ratings
      loadRestaurantDetail()
    } catch (error) {
      console.error('提交评分失败:', error)
      Taro.showToast({
        title: '提交失败',
        icon: 'error',
        duration: 2000
      })
    }
  }

  // Handle rating change
  const handleRatingChange = (type: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [type]: value
    }))
  }



  // Get all images (prioritize imageUrls array, fallback to single image)
  const getAllImages = () => {
    if (!restaurant) return []

    // 优先使用 imageUrls 字段
    if (restaurant.imageUrls && restaurant.imageUrls.length > 0) {
      return restaurant.imageUrls
    }
    // 备用方案：使用单个 image 字段
    return restaurant.image ? [restaurant.image] : []
  }

  // Handle swiper change
  const handleSwiperChange = (e: any) => {
    setCurrentImageIndex(e.detail.current)
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

  // Load data on component mount
  useEffect(() => {
    if (restaurantId) {
      loadRestaurantDetail()
    }
  }, [restaurantId])

  if (loading) {
    return (
      <View className='enhanced-restaurant-detail-container'>
        <View className='enhanced-loading-container'>
          <View className='loading-animation'>
            <View className='loading-spinner'>
              <View className='spinner-ring'></View>
              <View className='spinner-ring'></View>
              <View className='spinner-ring'></View>
            </View>
            <Text className='loading-text'>正在加载餐厅详情...</Text>
          </View>
        </View>
      </View>
    )
  }

  if (!restaurant) {
    return (
      <View className='enhanced-restaurant-detail-container'>
        <View className='enhanced-error-container'>
          <View className='error-animation'>
            <Text className='error-icon'>🍽️</Text>
            <Text className='error-title'>餐厅信息不存在</Text>
            <Text className='error-subtitle'>该餐厅可能已被删除或不存在</Text>
            <Button
              type="primary"
              onClick={() => Taro.navigateBack()}
              className='enhanced-back-button'
            >
              返回餐厅列表
            </Button>
          </View>
        </View>
      </View>
    )
  }

  const images = getAllImages()

  return (
    <View className='enhanced-restaurant-detail-container'>
      <ScrollView className='enhanced-content' scrollY>
        {/* Restaurant Header Images */}
        {images.length > 0 && (
          <View className='enhanced-header-image-section'>
            <View className='image-hero-container'>
              {images.length > 1 ? (
                <View className='enhanced-swiper-container'>
                  <Swiper
                    className='enhanced-image-swiper'
                    indicatorDots
                    indicatorColor='rgba(255, 255, 255, 0.4)'
                    indicatorActiveColor='#fff'
                    autoplay={false}
                    onChange={handleSwiperChange}
                  >
                    {images.map((imageUrl, index) => (
                      <SwiperItem key={index}>
                        <View className='image-item-container'>
                          <Image
                            className='enhanced-restaurant-main-image'
                            src={imageUrl}
                            mode='aspectFill'
                            onError={() => console.log('Image load failed:', imageUrl)}
                          />
                          {/* <View className='image-overlay'></View> */}
                        </View>
                      </SwiperItem>
                    ))}
                  </Swiper>
                </View>
              ) : (
                <View className='enhanced-single-image-container'>
                  <Image
                    className='enhanced-restaurant-main-image'
                    src={images[0]}
                    mode='aspectFill'
                  />
                  <View className='image-overlay'></View>
                </View>
              )}

              {/* 浮动返回按钮 */}
              <View className='floating-back-button' onClick={() => Taro.navigateBack()}>
                <Text className='back-icon'>←</Text>
              </View>

            </View>
          </View>
        )}

        {/* 增强的餐厅基本信息 */}
        <View className='enhanced-basic-info-card'>
          <View className='info-header'>
            <View className='name-section'>
              <Text className='enhanced-restaurant-name'>{restaurant.name}</Text>
              <View className='restaurant-badges'>
                <View className='type-badge'>
                  <Text className='badge-text'>{getRestaurantType(restaurant.name)}</Text>
                </View>
                {restaurant.pricingDetails && (
                  <View className='price-badge'>
                    <Text className='badge-icon'>💰</Text>
                    <Text className='badge-text'>{restaurant.pricingDetails}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className='enhanced-rating-section'>
            <View className='rating-display'>
              <View className='rating-stars'>
                <Rate
                  value={parseFloat(restaurant.overallRating || '0')}
                  readOnly
                />
              </View>
              <View className='rating-info'>
                <Text className='rating-score'>{restaurant.overallRating || '暂无评分'}</Text>
                <Text className='rating-reviews'>({restaurant.totalReviews || 0} 条评价)</Text>
              </View>
            </View>
          </View>

          <View className='enhanced-location-section'>
            <View className='location-row'>
              <Text className='location-icon'>📍</Text>
              <View className='location-details'>
                <Text className='street-address'>{restaurant.streetAddress}</Text>
                <Text className='suburb-state'>{restaurant.suburb}, {restaurant.state}</Text>
              </View>
              <View className='location-actions'>
                <View className='action-button' onClick={() => Taro.showToast({ title: '导航功能开发中', icon: 'none' })}>
                  <Text className='action-icon'>🧭</Text>
                </View>
              </View>
            </View>
          </View>

          {restaurant.description && (
            <View className='enhanced-description-section'>
              <Text className='section-title'>餐厅介绍</Text>
              <Text className='enhanced-description-text'>{restaurant.description}</Text>
            </View>
          )}

          <View className='quick-actions'>
            <View className='action-item' onClick={() => Taro.showToast({ title: '电话功能开发中', icon: 'none' })}>
              <Text className='action-icon'>📞</Text>
              <Text className='action-text'>电话</Text>
            </View>
            <View className='action-item' onClick={() => Taro.showToast({ title: '收藏功能开发中', icon: 'none' })}>
              <Text className='action-icon'>❤️</Text>
              <Text className='action-text'>收藏</Text>
            </View>
            <View className='action-item' onClick={() => Taro.showToast({ title: '分享功能开发中', icon: 'none' })}>
              <Text className='action-icon'>📤</Text>
              <Text className='action-text'>分享</Text>
            </View>
          </View>
        </View>

        {/* 增强的评分区域 */}
        <View className='enhanced-rating-card'>
          <View className='rating-header'>
            <Text className='rating-title'>为这家餐厅评分</Text>
            <Text className='rating-subtitle'>分享您的用餐体验</Text>
          </View>

          <View className='enhanced-rating-form'>
            <View className='rating-categories'>
              <View className='enhanced-rating-item'>
                <View className='rating-item-header'>
                  <Text className='rating-emoji'>⭐</Text>
                  <Text className='rating-label'>总体评分</Text>
                  <Text className='rating-value'>{ratings.overall}星</Text>
                </View>
                <Rate
                  value={ratings.overall}
                  onChange={(value) => handleRatingChange('overall', value)}
                />
              </View>

              <View className='enhanced-rating-item'>
                <View className='rating-item-header'>
                  <Text className='rating-emoji'>🍽️</Text>
                  <Text className='rating-label'>口味</Text>
                  <Text className='rating-value'>{ratings.taste}星</Text>
                </View>
                <Rate
                  value={ratings.taste}
                  onChange={(value) => handleRatingChange('taste', value)}
                />
              </View>

              <View className='enhanced-rating-item'>
                <View className='rating-item-header'>
                  <Text className='rating-emoji'>🏪</Text>
                  <Text className='rating-label'>环境</Text>
                  <Text className='rating-value'>{ratings.environment}星</Text>
                </View>
                <Rate
                  value={ratings.environment}
                  onChange={(value) => handleRatingChange('environment', value)}
                />
              </View>

              <View className='enhanced-rating-item'>
                <View className='rating-item-header'>
                  <Text className='rating-emoji'>👨‍💼</Text>
                  <Text className='rating-label'>服务</Text>
                  <Text className='rating-value'>{ratings.service}星</Text>
                </View>
                <Rate
                  value={ratings.service}
                  onChange={(value) => handleRatingChange('service', value)}
                />
              </View>

              <View className='enhanced-rating-item'>
                <View className='rating-item-header'>
                  <Text className='rating-emoji'>💰</Text>
                  <Text className='rating-label'>性价比</Text>
                  <Text className='rating-value'>{ratings.price}星</Text>
                </View>
                <Rate
                  value={ratings.price}
                  onChange={(value) => handleRatingChange('price', value)}
                />
              </View>
            </View>
            <Button
              type="primary"
              className='enhanced-submit-rating-btn'
              onClick={handleSubmitRating}
              disabled={!isLoggedIn}
            >
              {isLoggedIn ? '🌟 提交评分' : '🔐 登录后评分'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default RestaurantDetail
