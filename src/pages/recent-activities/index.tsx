import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Toast } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { eventsApi, Event, EventFilters } from '../../services/events'
import EventRegistrationStatus from '../../components/EventRegistrationStatus'
import EventFiltersComponent from '../../components/EventFilters'
import Pagination from '../../components/Pagination'
import { useEventTypes } from '../../hooks/useTypes'
import './index.less'

// Helper function to generate dates for the next 7 days
const generateDates = () => {
  const dates: any = []
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
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
  const { getEventTypeName } = useEventTypes()
  const dates = generateDates()

  // State
  const [selectedDate, setSelectedDate] = useState(dates[0].dateString)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Filters
  const [currentFilters, setCurrentFilters] = useState<EventFilters>({
    isHistorical: false,
    page: 1,
    limit: 10
  })

  const fetchUpcomingEvents = async (showLoading = true, filters: EventFilters = currentFilters) => {
    try {
      if (showLoading) setLoading(true)

      const response = await eventsApi.getAllEvents(filters)
      setEvents(response.data)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      })
    } catch (error) {
      console.error('获取活动失败:', error)
      showToastMessage('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (filters: EventFilters) => {
    const newFilters = {
      ...filters,
      isHistorical: false,
      page: 1,
      limit: 10
    }
    setCurrentFilters(newFilters)
    fetchUpcomingEvents(true, newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = {
      ...currentFilters,
      page
    }
    setCurrentFilters(newFilters)
    fetchUpcomingEvents(true, newFilters)
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startTime)
    const eventDateString = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
    return eventDateString === selectedDate
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const handleEventClick = (event: Event) => {
    Taro.navigateTo({
      url: `/pages/events/detail/index?id=${event.id}`
    })
  }

  const selectedDateInfo = dates.find(date => date.dateString === selectedDate) || dates[0]

  return (
    <View className='enhanced-events-container'>
      {/* Immersive Header */}
      <View className='enhanced-header'>
        <View className='header-content'>
          <View className='title-section'>
            <Text className='enhanced-title'>布玩新鲜事</Text>
            <Text className='enhanced-subtitle'>精选活动日历，发现玩乐灵感</Text>
          </View>
        </View>
      </View>

      {/* Date Navigation (Sticky) */}
      <View className='enhanced-date-nav'>
          <Text className='month-text'>{selectedDateInfo.month}月</Text>
          <ScrollView className='date-scroll' scrollX showScrollbar={false}>
            {dates.map((date, index) => (
              <View
                key={index}
                className={`date-item ${date.dateString === selectedDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(date.dateString)}
              >
                <Text className='day-number'>{date.day}</Text>
                <Text className='day-name'>{date.isToday ? '今天' : `周${date.weekday}`}</Text>
              </View>
            ))}
          </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView className='enhanced-content' scrollY>
        {/*
        <View style={{padding: '0 32rpx', marginBottom: '20rpx'}}>
            <EventFiltersComponent
                onFiltersChange={handleFiltersChange}
                initialFilters={currentFilters}
            />
        </View>
        */}

        <View className='activity-section'>
          <View className='section-title'>
            {selectedDate === dates[0].dateString ? '今日活动' : `${selectedDateInfo.month}月${selectedDateInfo.day}日 · 周${selectedDateInfo.weekday}`}
          </View>

          {loading ? (
            <View className='enhanced-loading-container'>
               <View className='loading-dots'>
                  <View className='dot dot-1'></View>
                  <View className='dot dot-2'></View>
                  <View className='dot dot-3'></View>
               </View>
               <Text>正在加载活动...</Text>
            </View>
          ) : filteredEvents.length > 0 ? (
            <View className='events-list'>
              {filteredEvents.map((event, index) => (
                <View
                  key={event.id}
                  className='enhanced-event-card'
                  onClick={() => handleEventClick(event)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <View className='enhanced-event-image-container'>
                      <Image
                        className='enhanced-event-image'
                        src={event.imageUrls?.[0] || event.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'}
                        mode='aspectFill'
                        lazyLoad
                      />
                      <View className='image-overlay'></View>
                      
                      <View className={`price-badge-floating ${event.free ? 'free' : ''}`}>
                          <Text>{event.free ? '免费' : (event.priceFrom ? `¥${event.priceFrom}+` : `¥${event.price}`)}</Text>
                      </View>
                      
                      {event.eventTypeRid && (
                          <View className='event-type-badge'>
                              <Text>{getEventTypeName(event.eventTypeRid)}</Text>
                          </View>
                      )}
                  </View>
                  
                  <View className='enhanced-event-info'>
                      <View className='info-header'>
                          <Text className='enhanced-event-title'>{event.title}</Text>
                          <Text className='meta-time'>{formatTime(event.startTime)}</Text>
                      </View>
                      
                      <View className='info-content'>
                          <View className='event-time-location'>
                              <View className='time-location-item'>
                                  <Text>📍</Text>
                                  <Text>{event.location || '线上活动'}</Text>
                              </View>
                              <View className='time-location-item'>
                                  <Text>👥</Text>
                                  <Text>{event.capacity ? `${event.capacity}人` : '不限'}</Text>
                              </View>
                          </View>
                          <Text className='enhanced-event-description'>{event.description || '暂无描述'}</Text>
                      </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
             <View className='enhanced-empty-container'>
                <Text className='empty-icon'>🍃</Text>
                <Text className='empty-title'>今日暂无活动</Text>
                <Text className='empty-subtitle'>去看看其他日期的精彩吧</Text>
             </View>
          )}

          {!loading && events.length > 0 && pagination.totalPages > 1 && (
            <View style={{marginTop: '40rpx'}}>
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
        </View>
        
        <View style={{height: '60rpx'}}></View>
      </ScrollView>

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
