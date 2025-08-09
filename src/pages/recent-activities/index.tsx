import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty } from '@nutui/nutui-react-taro'
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

  // Pull to refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUpcomingEvents(false)
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



  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <ScrollView className='recent-activities-container' scrollY>
        {/* Header section */}
        <View className='header-section'>
          <View className='header-title'>最近活动</View>
          <View className='header-desc'>探索丰富多彩的活动，加入我们一起玩乐！</View>
        </View>

        {/* Date navigation */}
        <View className='date-nav'>
          <View className='month-text'>{dates[0].month}月</View>
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
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <View key={event.id} className='activity-card'>
              <Image
                className='activity-image'
                src={event.imageUrls?.[0] || event.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'}
                mode='aspectFill'
              />
              <View className='activity-content'>
                <View className='activity-title'>{event.title}</View>

                <View className='activity-time-location'>
                  <View className='activity-time'>
                    <Text className='icon'>🕒</Text>
                    <Text>{formatTime(event.startTime)}</Text>
                  </View>
                  <View className='activity-location'>
                    <Text className='icon'>📍</Text>
                    <Text>{event.location || '线上活动'}</Text>
                  </View>
                </View>

                <View className='activity-desc'>{event.description || '暂无描述'}</View>

                <View className='activity-footer'>
                  <View className='activity-tags'>
                    {event.capacity && (
                      <View className='activity-tag limit-tag'>
                        {event.capacity}人
                      </View>
                    )}
                    {event.price && (
                      <View className='activity-tag'>
                        ${event.price}
                      </View>
                    )}
                  </View>

                  <EventRegistrationStatus
                    event={event}
                    onRegistrationChange={() => fetchUpcomingEvents(false)}
                  />
                </View>
              </View>
            </View>
          ))
        ) : (
          <Empty
            description={selectedDate === dates[0].dateString ? '今日暂无活动安排' : `${selectedDate.slice(5).replace('-', '月')}日暂无活动安排`}
            imageSize={120}
          />
        )}

        {/* Pagination */}
        {!loading && events.length > 0 && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </View>
    </ScrollView>
    </PullToRefresh>
  )
}

export default RecentActivities 