import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { eventsApi, Event, EventFilters } from '../../services/events'
import { Swiper } from '@nutui/nutui-react-taro'
import EventFiltersComponent from '../../components/EventFilters'
import Pagination from '../../components/Pagination'
import { useEventTypes } from '../../hooks/useTypes'
import './index.less'

const PastActivities: React.FC = () => {
  // Use event types hook
  const { getEventTypeName } = useEventTypes()

  // State for events data
  const [events, setEvents] = useState<Event[]>([])

  // State for loading
  const [loading, setLoading] = useState(false)

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false)

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // State for filters
  const [currentFilters, setCurrentFilters] = useState<EventFilters>({
    isHistorical: true,
    page: 1,
    limit: 10
  })
  
  // Fetch past events from API
  const fetchPastEvents = async (showLoading = true, filters: EventFilters = currentFilters) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      // 使用新的分页API
      const response = await eventsApi.getAllEvents(filters)

      // Sort events by start time in descending order (most recent first)
      const sortedEvents = response.data.sort((a: Event, b: Event) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )

      setEvents(sortedEvents)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      })
    } catch (error) {
      console.error('获取过去活动失败:', error)
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

  // Handle filter changes
  const handleFiltersChange = (filters: EventFilters) => {
    const newFilters = {
      ...filters,
      isHistorical: true, // 确保始终获取历史活动
      page: 1, // 重置到第一页
      limit: 10
    }
    setCurrentFilters(newFilters)
    fetchPastEvents(true, newFilters)
  }

  // Handle pagination change
  const handlePageChange = (page: number) => {
    const newFilters = {
      ...currentFilters,
      page
    }
    setCurrentFilters(newFilters)
    fetchPastEvents(true, newFilters)
  }
  
  // Pull to refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPastEvents(false)
  }
  
  // Fetch events on component mount
  useEffect(() => {
    fetchPastEvents()
  }, [])
  
  // 直接使用从API获取的已过滤事件
  const filteredEvents = events

  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Handle event card click
  const handleEventClick = (event: Event) => {
    Taro.navigateTo({
      url: `/pages/events/detail/index?id=${event.id}`
    })
  }



  return (
    <View className='enhanced-past-activities-container'>
      {/* 增强的头部区域 */}
      <View className='enhanced-header-section'>
        <View className='header-background'>
          <Image
            className='enhanced-header-image'
            src='https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop'
            mode='aspectFill'
          />
          <View className='header-particles'>
            <View className='particle particle-1'></View>
            <View className='particle particle-2'></View>
            <View className='particle particle-3'></View>
            <View className='particle particle-4'></View>
            <View className='particle particle-5'></View>
          </View>
          <View className='header-overlay'></View>
        </View>
        <View className='header-content'>
          <View className='title-section'>
            <Text className='enhanced-header-title'>往期活动</Text>
            <Text className='enhanced-header-subtitle'>回顾我们的精彩时刻</Text>
            <View className='stats-section'>
              <View className='stat-item'>
                <Text className='stat-number'>{events.length}</Text>
                <Text className='stat-label'>场活动</Text>
              </View>
              <View className='stat-divider'></View>
              <View className='stat-item'>
                <Text className='stat-number'>1000+</Text>
                <Text className='stat-label'>参与人次</Text>
              </View>
            </View>
          </View>
        </View>
      </View>



      {/* 增强的筛选器 */}
      {/* <View className='enhanced-filters-wrapper'> */}
      <EventFiltersComponent
        onFiltersChange={handleFiltersChange}
        initialFilters={currentFilters}
      />
      {/* </View> */}

      {/* 增强的活动列表 */}
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
                <Text className='loading-text'>正在加载往期活动...</Text>
              </View>
            </View>
          ) : filteredEvents.length > 0 ? (
            <View className='enhanced-activity-list'>
              {filteredEvents.map((event, index) => (
                <View
                  key={event.id}
                  className={`enhanced-activity-card card-${index % 2 === 0 ? 'left' : 'right'}`}
                  onClick={() => handleEventClick(event)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <View className='enhanced-activity-image-container'>
                    <View className='image-wrapper'>
                      {event.imageUrls && event.imageUrls.length > 1 ? (
                        <Swiper
                          circular
                          defaultValue={0}
                          indicator
                          autoplay={true}
                          style={{ height: '240rpx', width: '100%' }}
                        >
                          {event.imageUrls.map((imageUrl, imgIndex) => (
                            <Swiper.Item key={imgIndex}>
                              <Image
                                className='enhanced-activity-image'
                                src={imageUrl}
                                mode='aspectFill'
                                lazyLoad
                                onError={() => console.log('Image load failed:', imageUrl)}
                              />
                            </Swiper.Item>
                          ))}
                        </Swiper>
                      ) : (
                        <Image
                          className='enhanced-activity-image'
                          src={event.imageUrls?.[0] || event.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'}
                          mode='aspectFill'
                          lazyLoad
                        />
                      )}
                      <View className='image-overlay'></View>
                    </View>

                    {/* 增强的图片徽章 */}
                    <View className='image-badges'>
                      {event.imageUrls && event.imageUrls.length > 1 && (
                        <View className='image-count-badge'>
                          <Text className='badge-icon'>📷</Text>
                          <Text className='badge-count'>{event.imageUrls.length}</Text>
                        </View>
                      )}
                      <View className='status-badge'>
                        <Text className='status-text'>已结束</Text>
                      </View>
                    </View>

                    {/* 活动类型标签 */}
                    {event.eventTypeRid && (
                      <View className='type-badge-floating'>
                        <Text className='type-text'>{getEventTypeName(event.eventTypeRid)}</Text>
                      </View>
                    )}
                  </View>
                  <View className='enhanced-activity-info'>
                    <View className='info-header'>
                      <Text className='enhanced-activity-title'>{event.title}</Text>
                      <View className='activity-date'>
                        <Text className='date-text'>{formatDate(event.startTime)}</Text>
                      </View>
                    </View>

                    <View className='info-content'>
                      <Text className='enhanced-activity-desc'>
                        {event.description || '暂无描述'}
                      </Text>

                      <View className='enhanced-activity-meta'>
                        <View className='meta-row'>
                          <View className='enhanced-meta-item'>
                            <Text className='meta-icon'>🕒</Text>
                            <Text className='meta-text'>{formatTime(event.startTime)}</Text>
                          </View>
                          <View className='enhanced-meta-item'>
                            <Text className='meta-icon'>📍</Text>
                            <Text className='meta-text'>{event.location || '线上活动'}</Text>
                          </View>
                        </View>

                        <View className='meta-row'>
                          {event.capacity && (
                            <View className='enhanced-meta-item'>
                              <Text className='meta-icon'>👥</Text>
                              <Text className='meta-text'>{event.capacity}人</Text>
                            </View>
                          )}
                          {(event.priceFrom || event.price) && (
                            <View className='enhanced-meta-item price-item'>
                              <Text className='meta-icon'>💰</Text>
                              <Text className='meta-text'>
                                {event.priceFrom ?
                                  (event.priceTo && event.priceTo !== event.priceFrom ?
                                    `¥${event.priceFrom}-${event.priceTo}` :
                                    `¥${event.priceFrom}`
                                  ) :
                                  `¥${event.price}`
                                }
                              </Text>
                            </View>
                          )}
                          {event.free && (
                            <View className='enhanced-meta-item price-item'>
                              <Text className='meta-icon'>💰</Text>
                              <Text className='meta-text'>免费</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View className='info-footer'>
                      <View className='action-buttons'>
                        <View className='action-button view-button'>
                          <Text className='button-text'>查看详情</Text>
                          <Text className='button-icon'>→</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className='enhanced-empty-container'>
              <View className='empty-animation'>
                <Text className='empty-icon'>📅</Text>
                <Text className='empty-title'>暂无往期活动</Text>
                <Text className='empty-subtitle'>精彩活动即将到来，敬请期待</Text>
              </View>
            </View>
          )}

          {/* 增强的分页 */}
          {!loading && filteredEvents.length > 0 && pagination.totalPages > 1 && (
            <View className='enhanced-pagination-wrapper'>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </View>
          )}

        </ScrollView>
      </PullToRefresh>
    </View>
  )
}

export default PastActivities 
