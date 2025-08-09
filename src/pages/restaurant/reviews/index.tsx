import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Rate, Avatar, Button } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { restaurantReviewApi, RestaurantReview, ReviewQueryParams } from '../../../services/restaurant'
import ReviewFiltersComponent from '../../../components/ReviewFilters'
import './index.less'

const RestaurantReviews: React.FC = () => {
  const router = useRouter()
  const { id, name } = router.params
  
  // 状态管理
  const [reviews, setReviews] = useState<RestaurantReview[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // const [stats, setStats] = useState<any>(null)
  const [currentFilters, setCurrentFilters] = useState<ReviewQueryParams>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })



  // 加载评价数据
  const loadReviews = async (showLoading = true, filters: ReviewQueryParams = currentFilters) => {
    if (!id) return

    try {
      if (showLoading) {
        setLoading(true)
      }

      const params: Omit<ReviewQueryParams, 'restaurantId'> = {
        page: 1,
        limit: 50,
        ...filters
      }

      // 只获取已审核通过的评价用于公开展示
      const response = await restaurantReviewApi.getApprovedReviewsByRestaurant(Number(id), params)
      setReviews(response.data || [])
    } catch (error) {
      console.error('加载评价失败:', error)
      const errorMessage = error instanceof Error ? error.message : '网络连接失败'
      Taro.showToast({
        title: `加载失败: ${errorMessage}`,
        icon: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (filters: ReviewQueryParams) => {
    setCurrentFilters(filters)
    loadReviews(true, filters)
  }

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReviews(false)
  }



  // 跳转到撰写评价页面
  const handleWriteReview = () => {
    Taro.navigateTo({
      url: `/pages/restaurant/write-review/index?id=${id}&name=${encodeURIComponent(name || '')}`
    })
  }

  // 格式化时间显示
  const formatTime = (timeStr: string) => {
    const time = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - time.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days < 30) {
      return `${days}天前`
    } else {
      return time.toLocaleDateString('zh-CN')
    }
  }

  // 获取评分颜色
  const getRatingColor = (rating: number) => {
    if (rating >= 5) return '#52c41a'
    if (rating >= 4) return '#faad14'
    if (rating >= 3) return '#fa8c16'
    return '#ff4d4f'
  }

  // 获取用户头像
  const getUserAvatar = (username: string) => {
    // 根据用户名生成简单的头像背景色
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
    const index = username.length % colors.length
    return colors[index]
  }

  // 计算评价统计
  const getReviewStats = () => {
    if (reviews.length === 0) return null
    
    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    }
    
    return {
      totalReviews,
      averageRating: averageRating.toFixed(1),
      ratingDistribution
    }
  }

  const stats = getReviewStats()

  // 组件挂载时加载数据
  useEffect(() => {
    loadReviews()
  }, [id])

  return (
    <View className='restaurant-reviews-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='restaurant-name'>{decodeURIComponent(name || '')}</Text>
          <Text className='subtitle'>用户评价</Text>
        </View>
      </View>

      {/* 评价统计 */}
      {stats && (
        <View className='stats-section'>
          <View className='overall-rating'>
            <Text className='rating-score'>{stats.averageRating}</Text>
            <Rate
              value={parseFloat(stats.averageRating)}
              readOnly
            />
            <Text className='total-reviews'>共 {stats.totalReviews} 条评价</Text>
          </View>

          <View className='rating-distribution'>
            {Object.entries(stats.ratingDistribution).reverse().map(([rating, count]) => (
              <View key={rating} className='distribution-item'>
                <Text className='rating-label'>{rating}星</Text>
                <View className='progress-bar'>
                  <View
                    className='progress-fill'
                    style={{
                      width: `${(count / stats.totalReviews) * 100}%`,
                      backgroundColor: getRatingColor(Number(rating))
                    }}
                  />
                </View>
                <Text className='count-text'>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 撰写评价按钮 - 始终显示 */}
      <View className='write-review-action'>
        <Button
          className='write-review-button'
          type='primary'
          size='small'
          onClick={handleWriteReview}
        >
          ✍️ 撰写评价
        </Button>
      </View>

      {/* 筛选栏 */}
      <View className='filter-section'>
      </View>

      {/* Review Filters */}
      <ReviewFiltersComponent
        onFiltersChange={handleFiltersChange}
        initialFilters={currentFilters}
      />

      {/* 评价列表 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : reviews.length === 0 ? (
            <View className='empty-reviews'>
              <Empty
                description="暂无评价，成为第一个评价的人吧！"
                imageSize={120}
              />
              <View className='empty-action'>
                <Button
                  className='first-review-button'
                  type='primary'
                  onClick={handleWriteReview}
                >
                  🌟 写下第一条评价
                </Button>
              </View>
            </View>
          ) : (
            <View className='reviews-list'>
              {reviews.map(review => (
                <View key={review.id} className='review-card'>
                  {/* 用户信息 */}
                  <View className='review-header'>
                    <View className='user-info'>
                      <Avatar 
                        style={{ backgroundColor: getUserAvatar(review.username) }}
                      >
                        {review.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <View className='user-details'>
                        <Text className='username'>{review.username}</Text>
                        <Text className='review-time'>{formatTime(review.createdAt)}</Text>
                      </View>
                    </View>
                    
                    <View className='rating-info'>
                      <Rate 
                        value={review.rating} 
                        readOnly 
                      />
                      <Text 
                        className='rating-text'
                        style={{ color: getRatingColor(review.rating) }}
                      >
                        {review.rating}分
                      </Text>
                    </View>
                  </View>

                  {/* 评价内容 */}
                  <View className='review-content'>
                    <Text className='content-text'>{review.content}</Text>
                  </View>

                  {/* 维度评分 */}
                  {(review.tasteRating || review.environmentRating || review.serviceRating || review.priceRating) && (
                    <View className='dimensional-ratings'>
                      <Text className='ratings-title'>详细评分</Text>
                      <View className='ratings-grid'>
                        {review.tasteRating && (
                          <View className='rating-dimension'>
                            <Text className='dimension-label'>🍽️ 口味</Text>
                            <View className='dimension-rating'>
                              <Rate
                                value={review.tasteRating}
                                readOnly
                                size={16}
                              />
                              <Text className='dimension-score'>{review.tasteRating}</Text>
                            </View>
                          </View>
                        )}
                        {review.environmentRating && (
                          <View className='rating-dimension'>
                            <Text className='dimension-label'>🏪 环境</Text>
                            <View className='dimension-rating'>
                              <Rate
                                value={review.environmentRating}
                                readOnly
                                size={16}
                              />
                              <Text className='dimension-score'>{review.environmentRating}</Text>
                            </View>
                          </View>
                        )}
                        {review.serviceRating && (
                          <View className='rating-dimension'>
                            <Text className='dimension-label'>👥 服务</Text>
                            <View className='dimension-rating'>
                              <Rate
                                value={review.serviceRating}
                                readOnly
                                size={16}
                              />
                              <Text className='dimension-score'>{review.serviceRating}</Text>
                            </View>
                          </View>
                        )}
                        {review.priceRating && (
                          <View className='rating-dimension'>
                            <Text className='dimension-label'>💰 价格</Text>
                            <View className='dimension-rating'>
                              <Rate
                                value={review.priceRating}
                                readOnly
                                size={16}
                              />
                              <Text className='dimension-score'>{review.priceRating}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
    </View>
  )
}

export default RestaurantReviews 