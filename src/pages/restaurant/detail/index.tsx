import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Rate, Button } from '@nutui/nutui-react-taro'
import { Swiper } from '@taroify/core'
import Taro, { useRouter, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { restaurantApi, Restaurant } from '../../../services/restaurant'
import { useAuth } from '../../../context/auth'
import './index.less'
import '@taroify/core/swiper/style'

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

  // 当前餐厅ID（使用状态以确保参数可用时再加载）
  const [restaurantId, setRestaurantId] = useState<number>(0)

  // Load restaurant details
  const loadRestaurantDetail = async (id?: number) => {
    try {
      setLoading(true)
      const targetId = typeof id === 'number' ? id : restaurantId
      console.log('Loading restaurant detail for ID:', targetId)

      if (!targetId || targetId === 0) {
        throw new Error('餐厅ID无效')
      }

      const response = await restaurantApi.getRestaurantById(targetId)
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
      const numericUserId = Number(userInfo.id)

      if (!Number.isFinite(numericUserId)) {
        Taro.showToast({
          title: '用户信息异常，请重新登录',
          icon: 'none',
          duration: 2000
        })
        return
      }

      const ratingData = {
        userId: numericUserId,
        tasteRating: ratings.taste,
        environmentRating: ratings.environment,
        serviceRating: ratings.service,
        priceRating: ratings.price
      }

      const ratingResult = await restaurantApi.rateRestaurant(restaurantId, ratingData)

      if (ratingResult) {
        setRestaurant(prev => {
          if (!prev) return prev
          return {
            ...prev,
            overallRating: ratingResult.overallRating,
            totalReviews: ratingResult.totalReviews
          }
        })

        setRatings(prev => ({
          ...prev,
          overall: Math.round(Number(ratingResult.overallRating) || prev.overall)
        }))
      }

      Taro.showToast({
        title: '评分提交成功',
        icon: 'success',
        duration: 2000
      })
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

  const resolveShareId = (): number | undefined => {
    if (restaurantId > 0) return restaurantId
    const paramId = router?.params?.id ? Number(router.params.id) : NaN
    if (Number.isFinite(paramId) && paramId > 0) {
      return paramId
    }
    const currentInstanceId = Taro.getCurrentInstance()?.router?.params?.id
    const parsed = currentInstanceId ? Number(currentInstanceId) : NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }

  useShareAppMessage(() => {
    const shareId = resolveShareId()
    const redirect = encodeURIComponent('/pages/restaurant/detail/index')
    const basePath = `/pages/loading/index?redirect=${redirect}`
    const images = getAllImages()
    const imageUrl = images.length > 0 ? images[0] : undefined

    const title = restaurant?.name ? `${restaurant.name} · 精选美味` : '精选餐厅推荐'

    return {
      title,
      path: `${basePath}${shareId ? `&id=${shareId}` : ''}`,
      imageUrl
    }
  })

  useShareTimeline(() => {
    const shareId = resolveShareId()
    const redirect = encodeURIComponent('/pages/restaurant/detail/index')
    const title = restaurant?.name ? `${restaurant.name} · 精选美味` : '精选餐厅推荐'

    const queryParts = [`redirect=${redirect}`]
    if (shareId) {
      queryParts.push(`id=${shareId}`)
    }

    return {
      title,
      query: queryParts.join('&')
    }
  })

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true})
    Taro.showToast({ title: '分享面板已打开', icon: 'none', duration: 1500 })
  }

  // Handle swiper change
  const handleSwiperChange = (
    value: number | { detail?: { current?: number } }
  ) => {
    if (typeof value === 'number') {
      setCurrentImageIndex(value)
      return
    }
    const next = value?.detail?.current
    if (typeof next === 'number') {
      setCurrentImageIndex(next)
    }
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

  // 解析并设置餐厅ID（处理初次进入和再次展示）
  const resolveAndSetRestaurantId = () => {
    // 优先从 Taro 实例读取，作为 useRouter 的兜底
    const currentParams = Taro.getCurrentInstance()?.router?.params || {}
    const idFromRouter = router?.params?.id
    const idStr = (currentParams.id || idFromRouter || '0') as string
    const idNum = parseInt(idStr)
    if (!Number.isNaN(idNum) && idNum > 0) {
      setRestaurantId(idNum)
    }
  }

  // 首次挂载时解析ID并加载
  useEffect(() => {
    resolveAndSetRestaurantId()
  }, [])

  // 页面显示时确保加载（适配小程序返回后再次展示）
  // useDidShow(() => {
  //   resolveAndSetRestaurantId()
  //   if (restaurantId > 0) {
  //     loadRestaurantDetail(restaurantId)
  //   }
  // })

  // 当 restaurantId 变更时加载
  useEffect(() => {
    if (restaurantId > 0) {
      loadRestaurantDetail(restaurantId)
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

  const handleImagePreview = (index: number) => {
    if (!images.length) return
    Taro.previewImage({
      current: images[Math.max(0, Math.min(index, images.length - 1))],
      urls: images
    })
  }

  return (
    <View className='enhanced-restaurant-detail-container'>
      <ScrollView className='enhanced-content' scrollY>
        {/* Restaurant Header Images */}
        {images.length > 0 && (
          <View className='enhanced-header-image-section'>
            <View className='image-hero-container'>
              {images.length > 0 && (
                <View className='enhanced-swiper-container'>
                  <Swiper
                    className='enhanced-image-swiper'
                    autoplay={1000}
                    lazyRender
                    defaultValue={0}
                    onChange={handleSwiperChange}
                  >
                    {images.map((imageUrl, index) => (
                      <Swiper.Item key={index}>
                        <View className='image-item-container'>
                          <Image
                            className='enhanced-restaurant-main-image'
                            src={imageUrl}
                            mode='aspectFill'
                            lazyLoad
                            onClick={() => handleImagePreview(index)}
                            onError={() => console.log('Image load failed:', imageUrl)}
                          />
                        </View>
                      </Swiper.Item>
                    ))}
                  </Swiper>
                  {images.length > 1 && (
                    <View className='enhanced-image-counter'>
                      <View className='counter-badge'>
                        <Text className='counter-icon'>📷</Text>
                        <Text className='counter-text'>
                          {currentImageIndex + 1}/{images.length}
                        </Text>
                      </View>
                    </View>
                  )}
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

            {/* Detailed Aspect Ratings */}
            {restaurant.aspectRatings && restaurant.totalReviews > 0 && (
              <View className='aspect-ratings-section'>
                <Text className='aspect-ratings-title'>详细评分</Text>
                <View className='aspect-ratings-grid'>
                  <View className='aspect-rating-item'>
                    <View className='aspect-rating-header'>
                      <Text className='aspect-emoji'>🍽️</Text>
                      <Text className='aspect-label'>口味</Text>
                    </View>
                    <View className='aspect-rating-info'>
                      <Text className='aspect-score'>{restaurant.aspectRatings.taste.average}</Text>
                      <Text className='aspect-count'>({restaurant.aspectRatings.taste.count}人评价)</Text>
                    </View>
                    <View className='aspect-stars'>
                      <Rate
                        value={parseFloat(restaurant.aspectRatings.taste.average || '0')}
                        readOnly
                      />
                    </View>
                  </View>

                  <View className='aspect-rating-item'>
                    <View className='aspect-rating-header'>
                      <Text className='aspect-emoji'>🏪</Text>
                      <Text className='aspect-label'>环境</Text>
                    </View>
                    <View className='aspect-rating-info'>
                      <Text className='aspect-score'>{restaurant.aspectRatings.environment.average}</Text>
                      <Text className='aspect-count'>({restaurant.aspectRatings.environment.count}人评价)</Text>
                    </View>
                    <View className='aspect-stars'>
                      <Rate
                        value={parseFloat(restaurant.aspectRatings.environment.average || '0')}
                        readOnly
                      />
                    </View>
                  </View>

                  <View className='aspect-rating-item'>
                    <View className='aspect-rating-header'>
                      <Text className='aspect-emoji'>👨‍💼</Text>
                      <Text className='aspect-label'>服务</Text>
                    </View>
                    <View className='aspect-rating-info'>
                      <Text className='aspect-score'>{restaurant.aspectRatings.service.average}</Text>
                      <Text className='aspect-count'>({restaurant.aspectRatings.service.count}人评价)</Text>
                    </View>
                    <View className='aspect-stars'>
                      <Rate
                        value={parseFloat(restaurant.aspectRatings.service.average || '0')}
                        readOnly
                      />
                    </View>
                  </View>

                  <View className='aspect-rating-item'>
                    <View className='aspect-rating-header'>
                      <Text className='aspect-emoji'>💰</Text>
                      <Text className='aspect-label'>性价比</Text>
                    </View>
                    <View className='aspect-rating-info'>
                      <Text className='aspect-score'>{restaurant.aspectRatings.price.average}</Text>
                      <Text className='aspect-count'>({restaurant.aspectRatings.price.count}人评价)</Text>
                    </View>
                    <View className='aspect-stars'>
                      <Rate
                        value={parseFloat(restaurant.aspectRatings.price.average || '0')}
                        readOnly
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
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
            <View className='action-item' onClick={handleShare}>
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
