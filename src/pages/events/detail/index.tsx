import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Image, ScrollView, Video } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Swiper } from '@nutui/nutui-react-taro'
import { eventsApi, Event } from '../../../services/events'
import { useEventTypes } from '../../../hooks/useTypes'
import './index.less'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&h=600&fit=crop'

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '待定'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '待定'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatPrice = (event: Event | null) => {
  if (!event) return '待定'
  if (event.free) return '免费'
  if (event.priceFrom !== undefined && event.priceFrom !== null) {
    if (event.priceTo !== undefined && event.priceTo !== null && event.priceTo !== event.priceFrom) {
      return `¥${event.priceFrom}-${event.priceTo}`
    }
    return `¥${event.priceFrom}`
  }
  if (event.price !== undefined && event.price !== null) {
    return `¥${event.price}`
  }
  return '待定'
}

const EventDetail: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  const { getEventTypeName } = useEventTypes()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const images = useMemo(() => {
    if (!event) return [FALLBACK_IMAGE]
    if (event.imageUrls && event.imageUrls.length > 0) {
      return event.imageUrls
    }
    if (event.image) {
      return [event.image]
    }
    return [FALLBACK_IMAGE]
  }, [event])

  const loadEventDetail = async (eventId: number) => {
    try {
      setLoading(true)
      setError(null)
      const detail = await eventsApi.getEventById(eventId)
      if (!detail) {
        setError('未找到该活动或已下线')
        Taro.showToast({ title: '活动不存在', icon: 'none' })
        return
      }
      setEvent(detail)
    } catch (err) {
      console.error('加载活动详情失败:', err)
      setError('加载活动详情失败，请稍后重试')
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) {
      Taro.showToast({ title: '缺少活动ID', icon: 'none' })
      Taro.navigateBack()
      return
    }

    const numericId = parseInt(id, 10)
    if (Number.isNaN(numericId)) {
      Taro.showToast({ title: '活动ID无效', icon: 'none' })
      Taro.navigateBack()
      return
    }

    loadEventDetail(numericId)
  }, [id])

  const handleImagePreview = (index: number) => {
    if (!images || images.length === 0) return
    Taro.previewImage({
      current: images[Math.max(0, Math.min(index, images.length - 1))],
      urls: images
    })
  }

  if (loading) {
    return (
      <View className='event-detail-page loading-state'>
        <Text>正在加载活动详情...</Text>
      </View>
    )
  }

  if (error || !event) {
    return (
      <View className='event-detail-page error-state'>
        <Text className='error-text'>{error || '未找到该活动'}</Text>
      </View>
    )
  }

  const priceText = formatPrice(event)

  return (
    <View className='event-detail-page'>
      <ScrollView className='event-detail-scroll' scrollY>
        <View className='media-section'>
          <View className='carousel-wrapper'>
            <Swiper
              circular
              autoplay
              indicator
              style={{ height: '400rpx', width: '100%' }}
            >
              {images.map((imageUrl, index) => (
                <Swiper.Item key={`${imageUrl}-${index}`}>
                  <Image
                    className='carousel-image'
                    src={imageUrl}
                    mode='aspectFill'
                    lazyLoad
                    onClick={() => handleImagePreview(index)}
                  />
                </Swiper.Item>
              ))}
            </Swiper>
            <View className='image-count-badge'>
              <Text className='badge-icon'>📷</Text>
              <Text className='badge-text'>{images.length}</Text>
            </View>
          </View>

          {event.video && (
            <View className='video-section'>
              <Text className='section-title'>活动视频</Text>
              <Video
                className='event-video'
                src={event.video}
                controls
                autoplay={false}
                enableProgressGesture
                initialTime={0}
              />
            </View>
          )}
        </View>

        <View className='detail-card primary-card'>
          <View className='title-row'>
            <Text className='event-title'>{event.title}</Text>
            {event.eventTypeRid && (
              <View className='event-type-tag'>
                <Text className='type-text'>{getEventTypeName(event.eventTypeRid)}</Text>
              </View>
            )}
          </View>

          <Text className='event-subtitle'>{event.description || '暂无活动介绍'}</Text>

          <View className='price-row'>
            <Text className='price-label'>价格</Text>
            <Text className={`price-value ${priceText === '免费' ? 'free' : ''}`}>{priceText}</Text>
          </View>

          {event.pricingDetails && (
            <Text className='pricing-details'>{event.pricingDetails}</Text>
          )}
        </View>

        <View className='detail-card info-card'>
          <Text className='section-title'>活动信息</Text>
          <View className='info-grid'>
            <View className='info-item'>
              <Text className='info-label'>开始时间</Text>
              <Text className='info-value'>{formatDateTime(event.startTime)}</Text>
            </View>
            <View className='info-item'>
              <Text className='info-label'>结束时间</Text>
              <Text className='info-value'>{formatDateTime(event.endTime)}</Text>
            </View>
            <View className='info-item'>
              <Text className='info-label'>活动地点</Text>
              <Text className='info-value'>{event.location || '待定'}</Text>
            </View>
            <View className='info-item'>
              <Text className='info-label'>活动容量</Text>
              <Text className='info-value'>{event.capacity ? `${event.capacity} 人` : '不限'}</Text>
            </View>
            <View className='info-item'>
              <Text className='info-label'>报名状态</Text>
              <Text className='info-value'>{event.free ? '免费参与' : '收费活动'}</Text>
            </View>
            {event.dateCreated && (
              <View className='info-item'>
                <Text className='info-label'>创建时间</Text>
                <Text className='info-value'>{formatDateTime(event.dateCreated)}</Text>
              </View>
            )}
          </View>
        </View>

        <View className='detail-card description-card'>
          <Text className='section-title'>活动详情</Text>
          <Text className='description-text'>
            {event.description || '主办方暂未提供更多活动详情，敬请期待。'}
          </Text>
        </View>

        {event.video && (
          <View className='detail-card tips-card'>
            <Text className='section-title'>温馨提示</Text>
            <Text className='tips-text'>视频仅供预热和回顾使用，如需更多现场内容可联系主办方。</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default EventDetail
