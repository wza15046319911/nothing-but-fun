import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Toast } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { eventsApi, Event, EventFilters, PaginatedEventsResponse } from '../../services/events'
import EventRegistrationStatus from '../../components/EventRegistrationStatus'
import EventFiltersComponent from '../../components/EventFilters'
import Pagination from '../../components/Pagination'
import { useEventTypes } from '../../hooks/useTypes'
import './index.less'

// Helper function to generate dates for the next 14 days
const generateDates = () => {
  const dates: any = []
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date()

  for (let i = 0; i < 14; i++) {
    const date = new Date()
    date.setDate(today.getDate() + i)

    dates.push({
      date: date,
      day: date.getDate(),
      weekday: days[date.getDay()],
      isToday: i === 0,
      month: date.getMonth() + 1,
      dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    })
  }

  return dates
}

const RecentActivities: React.FC = () => {
  // Use event types hook
  const { getEventTypeName } = useEventTypes()

  // Generate dates for navigation
  const dates = generateDates()

  // State management
  const [selectedDate, setSelectedDate] = useState(dates[0].dateString)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // State for filters
  const [currentFilters, setCurrentFilters] = useState<EventFilters>({
    isHistorical: false,
    page: 1,
    limit: 10
  })

  // Fetch upcoming events from API
  const fetchUpcomingEvents = async (showLoading = true, filters: EventFilters = currentFilters) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      // 使用新的分页API
      const response = await eventsApi.getAllEvents(filters)
      setEvents(response.data)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      })
    } catch (error) {
      console.error('获取即将到来的活动失败:', error)
      showToastMessage('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (filters: EventFilters) => {
    const newFilters = {
      ...filters,
      isHistorical: false, // 确保始终获取未来活动
      page: 1, // 重置到第一页
      limit: 10
    }
    setCurrentFilters(newFilters)
    fetchUpcomingEvents(true, newFilters)
  }

  // Handle pagination change
  const handlePageChange = (page: number) => {
    const newFilters = {
      ...currentFilters,
      page
    }
    setCurrentFilters(newFilters)
    fetchUpcomingEvents(true, newFilters)
  }

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // Load events on component mount
  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  // Filter events based on selected date
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startTime)
    const eventDateString = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
    return eventDateString === selectedDate
  })

  // Format date and time helpers
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Handle event click
  const handleEventClick = (event: Event) => {
    Taro.navigateTo({
      url: `/pages/events/detail/index?id=${event.id}`
    })
  }

  return (
    <View className='enhanced-events-container'>
      {/* 增强的页面头部 */}
      <View className='enhanced-header'>
        <View className='header-background'>
          <View className='floating-shapes'>
            <View className='shape shape-1'></View>
            <View className='shape shape-2'></View>
            <View className='shape shape-3'></View>
            <View className='shape shape-4'></View>
          </View>
          <View className='header-overlay'></View>
        </View>
        <View className='header-content'>
          <View className='title-section'>
            <Text className='enhanced-title'>最近活动</Text>
            <Text className='enhanced-subtitle'>探索丰富多彩的活动，加入我们一起玩乐！</Text>
            <View className='stats-section'>
              <View className='stat-item'>
                <Text className='stat-number'>{events.length}</Text>
                <Text className='stat-label'>个活动</Text>
              </View>
              <View className='stat-divider'></View>
              <View className='stat-item'>
                <Text className='stat-number'>{filteredEvents.length}</Text>
                <Text className='stat-label'>今日活动</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className='enhanced-content' scrollY>
        {/* Date navigation */}
        <View className='enhanced-date-nav'>
          <View className='month-text'>{dates[0].month}月</View>
          <ScrollView className='date-scroll' scrollX showScrollbar={false}>
            {dates.map((date, index) => (
              <View
                key={index}
                className={`date-item ${date.dateString === selectedDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(date.dateString)}
              >
                <View className='day-number'>
                  {date.day}
                </View>
                <View className='day-name'>
                  {date.isToday ? '今天' : `周${date.weekday}`}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Event Filters */}
        <EventFiltersComponent
          onFiltersChange={handleFiltersChange}
          initialFilters={currentFilters}
        />

        {/* Activity section */}
        <View className='activity-section'>
          <View className='section-title'>
            {selectedDate === dates[0].dateString ? '今日活动' : `${selectedDate.slice(5).replace('-', '月')}日活动`}
          </View>

          {loading ? (
            <View className='enhanced-loading-container'>
              <View className='loading-animation'>
                <View className='loading-dots'>
                  <View className='dot dot-1'></View>
                  <View className='dot dot-2'></View>
                  <View className='dot dot-3'></View>
                </View>
                <Text className='loading-text'>正在加载活动...</Text>
              </View>
            </View>
          ) : filteredEvents.length > 0 ? (
            <View className='enhanced-events-grid'>
              {filteredEvents.map((event, index) => (
                <View
                  key={event.id}
                  className={`enhanced-event-card card-${index % 2 === 0 ? 'left' : 'right'}`}
                  onClick={() => handleEventClick(event)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 增强的活动图片 */}
                  <View className='enhanced-event-image-container'>
                    <View className='image-wrapper'>
                      <Image
                        className='enhanced-event-image'
                        src={event.imageUrls?.[0] || event.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'}
                        mode='aspectFill'
                        lazyLoad
                      />
                      <View className='image-overlay'></View>
                    </View>

                    {/* 价格浮动标签 - 更新以支持新的价格结构 */}
                    {event.priceFrom || event.price ? (
                      <View className='price-badge-floating'>
                        <Text className='price-symbol'>¥</Text>
                        <Text className='price-amount'>
                          {event.priceFrom ?
                            (event.priceTo && event.priceTo !== event.priceFrom ?
                              `${event.priceFrom}-${event.priceTo}` :
                              `${event.priceFrom}`
                            ) :
                            event.price
                          }
                        </Text>
                      </View>
                    ) : event.free ? (
                      <View className='price-badge-floating free'>
                        <Text className='free-text'>免费</Text>
                      </View>
                    ) : (
                      <View className='price-badge-floating free'>
                        <Text className='free-text'>免费</Text>
                      </View>
                    )}

                    {/* 活动类型标签 */}
                    {event.eventTypeRid && (
                      <View className='event-type-badge'>
                        <Text className='type-text'>{getEventTypeName(event.eventTypeRid)}</Text>
                      </View>
                    )}
                  </View>

                  {/* 增强的活动信息 */}
                  <View className='enhanced-event-info'>
                    <View className='info-header'>
                      <Text className='enhanced-event-title'>{event.title}</Text>
                      <View className='event-meta'>
                        <Text className='meta-time'>{formatTime(event.startTime)}</Text>
                      </View>
                    </View>

                    <View className='info-content'>
                      <View className='event-time-location'>
                        <View className='time-location-item'>
                          <Text className='icon'>🕒</Text>
                          <Text className='text'>{formatTime(event.startTime)}</Text>
                        </View>
                        <View className='time-location-item'>
                          <Text className='icon'>📍</Text>
                          <Text className='text'>{event.location || '线上活动'}</Text>
                        </View>
                      </View>
                      <Text className='enhanced-event-description'>{event.description || '暂无描述'}</Text>
                    </View>

                    <View className='info-footer'>
                      <View className='event-tags'>
                        {event.capacity && (
                          <View className='event-tag capacity-tag'>
                            <Text className='tag-text'>{event.capacity}人</Text>
                          </View>
                        )}
                        {event.pricingDetails && (
                          <View className='event-tag pricing-tag'>
                            <Text className='tag-text'>{event.pricingDetails}</Text>
                          </View>
                        )}
                      </View>
                      <View className='registration-section'>
                        <EventRegistrationStatus
                          event={event}
                          onRegistrationChange={() => fetchUpcomingEvents(false)}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className='enhanced-empty-container'>
              <View className='empty-animation'>
                <Text className='empty-icon'>🎉</Text>
                <Text className='empty-title'>{selectedDate === dates[0].dateString ? '今日暂无活动安排' : `${selectedDate.slice(5).replace('-', '月')}日暂无活动安排`}</Text>
                <Text className='empty-subtitle'>敬请期待更多精彩活动</Text>
              </View>
            </View>
          )}

          {/* 增强的分页 */}
          {!loading && events.length > 0 && pagination.totalPages > 1 && (
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

          {/* 增强的底部提示 */}
          {!loading && filteredEvents.length > 0 && (
            <View className='enhanced-footer-tip'>
              <View className='tip-content'>
                <Text className='tip-icon'>✨</Text>
                <Text className='tip-text'>已显示全部活动</Text>
                <Text className='tip-subtext'>发现了 {filteredEvents.length} 个精彩活动</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast
        content={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />
    </View>
  )
}

export default RecentActivities
