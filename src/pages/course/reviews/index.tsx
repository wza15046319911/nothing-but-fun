import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Rate, Avatar, Button } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { courseReviewApi, CourseReview, CourseReviewQueryParams } from '../../../services/course'
import './index.less'

const CourseReviews: React.FC = () => {
  const router = useRouter()
  const { id, courseCode, courseName } = router.params
  
  // 状态管理
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<'rating' | 'createdAt'>('createdAt')
  const [filterRating, setFilterRating] = useState<number | null>(null)

  // 排序选项
  const sortOptions = [
    { value: 'createdAt', label: '最新评价' },
    { value: 'rating', label: '评分最高' }
  ]

  // 评分筛选选项
  const ratingFilters = [
    { value: null, label: '全部评分' },
    { value: 5, label: '5星好评' },
    { value: 4, label: '4星以上' },
    { value: 3, label: '3星以上' }
  ]

  // 加载评价数据
  const loadReviews = async (showLoading = true) => {
    if (!id) return
    
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      const params: Omit<CourseReviewQueryParams, 'courseId' | 'moderationStatus' | 'isVisible'> = {
        page: 1,
        limit: 50,
        sortBy: sortBy,
        sortOrder: 'desc'
      }

      // 添加评分筛选
      if (filterRating !== null) {
        params.minRating = filterRating
      }
      
      // 只获取已审核通过的评价用于公开展示
      const response = await courseReviewApi.getApprovedReviewsByCourse(Number(id), params)
      setReviews(response.data || [])
    } catch (error) {
      console.error('加载评价失败:', error)
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
    await loadReviews(false)
  }

  // 排序筛选
  const handleSortFilter = (sort: 'rating' | 'createdAt') => {
    setSortBy(sort)
  }

  // 评分筛选
  const handleRatingFilter = (rating: number | null) => {
    setFilterRating(rating)
  }

  // 跳转到撰写评价页面
  const handleWriteReview = () => {
    Taro.navigateTo({
      url: `/pages/course/write-review/index?id=${id}&courseCode=${encodeURIComponent(courseCode || '')}&courseName=${encodeURIComponent(courseName || '')}`
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
  }, [id, sortBy, filterRating])

  return (
    <View className='course-reviews-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='course-code'>{courseCode}</Text>
          <Text className='subtitle'>课程评价</Text>
        </View>
      </View>

      {/* 评价统计 */}
      {stats && (
        <View className='stats-section'>
          <View className='overall-rating'>
            <Text className='rating-score'>{stats.averageRating}</Text>
            <Rate 
              value={parseFloat(stats.averageRating)} 
              readOnly={true}
              // size={16}
              // activeColor='#faad14'
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

          {/* 撰写评价按钮 */}
          <Button
            className='write-review-btn'
            type='primary'
            size='small'
            onClick={handleWriteReview}
          >
            ✍️ 撰写评价
          </Button>
        </View>
      )}

      {/* 筛选和排序 */}
      <View className='filter-section'>
        <View className='filter-group'>
          <Text className='filter-label'>排序:</Text>
          <View className='filter-options'>
            {sortOptions.map((option) => (
              <Text
                key={option.value}
                className={`filter-option ${sortBy === option.value ? 'active' : ''}`}
                onClick={() => handleSortFilter(option.value as 'rating' | 'createdAt')}
              >
                {option.label}
              </Text>
            ))}
          </View>
        </View>
        
        <View className='filter-group'>
          <Text className='filter-label'>评分:</Text>
          <View className='filter-options'>
            {ratingFilters.map((option) => (
              <Text
                key={option.value || 'all'}
                className={`filter-option ${filterRating === option.value ? 'active' : ''}`}
                onClick={() => handleRatingFilter(option.value)}
              >
                {option.label}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* 评价列表 */}
      <PullToRefresh
        onRefresh={handleRefresh}
        // loading={refreshing}
        pullingText='下拉刷新'
        canReleaseText='释放刷新'
        refreshingText='刷新中...'
        completeText='刷新完成'
      >
        <ScrollView className='reviews-list' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : reviews.length === 0 ? (
            <View className='empty-container'>
              <Empty 
                description='暂无评价，快来写第一条评价吧！'
                imageSize={80}
              />
              <Button
                className='first-review-btn'
                type='primary'
                onClick={handleWriteReview}
              >
                撰写第一条评价
              </Button>
            </View>
          ) : (
            <View className='reviews-content'>
              {reviews.map((review) => (
                <View key={review.id} className='review-item'>
                  <View className='review-header'>
                    <View className='user-info'>
                      <Avatar
                        size='small'
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
                        readOnly={true}
                      />
                      <Text 
                        className='rating-text'
                        style={{ color: getRatingColor(review.rating) }}
                      >
                        {review.rating}分
                      </Text>
                    </View>
                  </View>
                  
                  <View className='review-content'>
                    <Text className='content-text'>{review.content}</Text>
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

export default CourseReviews 