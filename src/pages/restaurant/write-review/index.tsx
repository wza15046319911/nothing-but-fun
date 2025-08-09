import React, { useState, useEffect } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import { Button, Rate, Toast, Dialog } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { restaurantReviewApi, restaurantApi, Restaurant, NewRestaurantReview } from '../../../services/restaurant'
import './index.less'

const WriteReview: React.FC = () => {
  const router = useRouter()
  const { id, name } = router.params
  
  // 状态管理
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // 维度评分状态
  const [tasteRating, setTasteRating] = useState(5)
  const [environmentRating, setEnvironmentRating] = useState(5)
  const [serviceRating, setServiceRating] = useState(5)
  const [priceRating, setPriceRating] = useState(5)

  // 模拟用户信息（实际项目中应该从用户登录状态获取）
  const currentUser = {
    id: Math.floor(Math.random() * 1000) + 100, // 模拟用户ID
    username: `用户${Math.floor(Math.random() * 1000) + 1}` // 模拟用户名
  }

  // 加载餐厅信息
  const loadRestaurant = async () => {
    if (!id) return
    
    try {
      const restaurantData = await restaurantApi.getRestaurantById(Number(id))
      setRestaurant(restaurantData)
    } catch (error) {
      console.error('加载餐厅信息失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
        duration: 2000
      })
    }
  }

  // 提交评价
  const handleSubmit = async () => {
    // 表单验证
    if (!content.trim()) {
      Toast.show('请填写评价内容')
      return
    }

    if (content.trim().length < 10) {
      Toast.show('评价内容至少需要10个字符')
      return
    }

    if (content.trim().length > 500) {
      Toast.show('评价内容不能超过500个字符')
      return
    }

    try {
      setSubmitting(true)
      
      // 创建评价数据
      const reviewData: NewRestaurantReview = {
        restaurantId: Number(id),
        userId: currentUser.id,
        username: currentUser.username,
        content: content.trim(),
        rating: rating,
        tasteRating: tasteRating,
        environmentRating: environmentRating,
        serviceRating: serviceRating,
        priceRating: priceRating
      }

      // 提交评价
      await restaurantReviewApi.createReview(reviewData)
      
      // 显示成功对话框
      setShowSuccessDialog(true)
      
    } catch (error) {
      console.error('提交评价失败:', error)
      
      // 检查是否是重复评价错误
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message
        if (errorMessage.includes('已经评价') || errorMessage.includes('already reviewed')) {
          Toast.show('您已经评价过这家餐厅了')
        } else {
          Toast.show('提交失败，请稍后重试')
        }
      } else {
        Toast.show('提交失败，请稍后重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 处理成功对话框确认
  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false)
    // 返回评价列表页面
    Taro.navigateBack()
  }

  // 获取评分描述
  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case 1: return '非常不满意'
      case 2: return '不满意'
      case 3: return '一般'
      case 4: return '满意'
      case 5: return '非常满意'
      default: return '请评分'
    }
  }

  // 获取评分颜色
  const getRatingColor = (rating: number) => {
    if (rating >= 5) return '#52c41a'
    if (rating >= 4) return '#faad14'
    if (rating >= 3) return '#fa8c16'
    if (rating >= 2) return '#ff7875'
    return '#ff4d4f'
  }

  // 字符计数颜色
  const getCharCountColor = () => {
    const length = content.length
    if (length > 500) return '#ff4d4f'
    if (length > 400) return '#fa8c16'
    return '#666'
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadRestaurant()
  }, [id])

  return (
    <View className='write-review-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>撰写评价</Text>
          <Text className='subtitle'>分享您的用餐体验</Text>
        </View>
      </View>

      {/* 餐厅信息 */}
      {restaurant && (
        <View className='restaurant-info'>
          <Text className='restaurant-name'>{restaurant.name}</Text>
          <Text className='restaurant-address'>📍 {restaurant.streetAddress}, {restaurant.suburb}</Text>
        </View>
      )}

      {/* 评分区域 */}
      <View className='rating-section'>
        <View className='section-header'>
          <Text className='section-title'>整体评分</Text>
          <Text className='required-mark'>*</Text>
        </View>
        
        <View className='rating-content'>
          <Rate 
            value={rating}
            size={32}
            activeColor={getRatingColor(rating)}
            onChange={(value) => setRating(value)}
          />
          <Text 
            className='rating-description'
            style={{ color: getRatingColor(rating) }}
          >
            {getRatingDescription(rating)}
          </Text>
        </View>
      </View>

      {/* 维度评分区域 */}
      <View className='dimensional-rating-section'>
        <View className='section-header'>
          <Text className='section-title'>详细评分</Text>
          <Text className='optional-mark'>（可选）</Text>
        </View>

        <View className='dimensional-ratings'>
          {/* 口味评分 */}
          <View className='rating-item'>
            <View className='rating-label-container'>
              <Text className='rating-label'>🍽️ 口味</Text>
              <Text className='rating-score'>{tasteRating}分</Text>
            </View>
            <Rate
              value={tasteRating}
              size={24}
              activeColor={getRatingColor(tasteRating)}
              onChange={(value) => setTasteRating(value)}
            />
          </View>

          {/* 环境评分 */}
          <View className='rating-item'>
            <View className='rating-label-container'>
              <Text className='rating-label'>🏪 环境</Text>
              <Text className='rating-score'>{environmentRating}分</Text>
            </View>
            <Rate
              value={environmentRating}
              size={24}
              activeColor={getRatingColor(environmentRating)}
              onChange={(value) => setEnvironmentRating(value)}
            />
          </View>

          {/* 服务评分 */}
          <View className='rating-item'>
            <View className='rating-label-container'>
              <Text className='rating-label'>👥 服务</Text>
              <Text className='rating-score'>{serviceRating}分</Text>
            </View>
            <Rate
              value={serviceRating}
              size={24}
              activeColor={getRatingColor(serviceRating)}
              onChange={(value) => setServiceRating(value)}
            />
          </View>

          {/* 价格评分 */}
          <View className='rating-item'>
            <View className='rating-label-container'>
              <Text className='rating-label'>💰 价格</Text>
              <Text className='rating-score'>{priceRating}分</Text>
            </View>
            <Rate
              value={priceRating}
              size={24}
              activeColor={getRatingColor(priceRating)}
              onChange={(value) => setPriceRating(value)}
            />
          </View>
        </View>
      </View>

      {/* 评价内容区域 */}
      <View className='content-section'>
        <View className='section-header'>
          <Text className='section-title'>评价内容</Text>
          <Text className='required-mark'>*</Text>
        </View>
        
        <View className='textarea-container'>
          <Textarea
            className='review-textarea'
            placeholder='请详细描述您的用餐体验，包括菜品口味、服务质量、环境氛围等...'
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={500}
            showConfirmBar={false}
            adjustPosition={false}
          />
          <View className='char-count'>
            <Text 
              className='count-text'
              style={{ color: getCharCountColor() }}
            >
              {content.length}/500
            </Text>
          </View>
        </View>
        
        <View className='content-tips'>
          <Text className='tip-text'>💡 温馨提示：</Text>
          <Text className='tip-text'>• 评价内容需要至少10个字符</Text>
          <Text className='tip-text'>• 请客观真实地描述用餐体验</Text>
          <Text className='tip-text'>• 评价提交后需要审核，审核通过后才会显示</Text>
        </View>
      </View>

      {/* 提交按钮 */}
      <View className='submit-section'>
        <Button
          className='submit-button'
          type='primary'
          size='large'
          loading={submitting}
          disabled={submitting || !content.trim() || content.trim().length < 10}
          onClick={handleSubmit}
        >
          {submitting ? '提交中...' : '提交评价'}
        </Button>
      </View>

      {/* 成功提示对话框 */}
      <Dialog
        visible={showSuccessDialog}
        title='评价提交成功'
        content={
          <View className='success-dialog-content'>
            <Text className='success-text'>✅ 您的评价已提交成功！</Text>
            <Text className='review-info'>评分：{rating}星 - {getRatingDescription(rating)}</Text>
            <Text className='audit-notice'>📋 评价正在审核中，审核通过后将会显示在评价列表中。</Text>
          </View>
        }
        confirmText='确定'
        onConfirm={handleSuccessConfirm}
        onCancel={handleSuccessConfirm}
      />
    </View>
  )
}

export default WriteReview 