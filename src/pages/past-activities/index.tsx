import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { eventsApi, Event } from '../../services/events'
import './index.less'

// Available categories for filtering
const categories = ['全部', '运动', '文化', '聚会', '手工', '美食']

const PastActivities: React.FC = () => {
  // State for category filter
  const [activeCategory, setActiveCategory] = useState('全部')
  
  // State for events data
  const [events, setEvents] = useState<Event[]>([])
  
  // State for loading
  const [loading, setLoading] = useState(false)
  
  // State for refreshing
  const [refreshing, setRefreshing] = useState(false)
  
  // Fetch past events from API
  const fetchPastEvents = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const response = await eventsApi.getAllEvents(true)
      // Sort events by start time in descending order (most recent first)
      const sortedEvents = response.sort((a: Event, b: Event) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      setEvents(sortedEvents)
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
  
  // Pull to refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPastEvents(false)
  }
  
  // Fetch events on component mount
  useEffect(() => {
    fetchPastEvents()
  }, [])
  
  // Determine event category based on title or description
  const getEventCategory = (event: Event) => {
    const title = event.title.toLowerCase()
    const description = event.description?.toLowerCase() || ''
    
    if (title.includes('运动') || description.includes('运动') || 
        title.includes('体育') || description.includes('体育') ||
        title.includes('冲浪') || description.includes('冲浪') ||
        title.includes('徒步') || description.includes('徒步')) {
      return '运动'
    }
    
    if (title.includes('文化') || description.includes('文化') || 
        title.includes('艺术') || description.includes('艺术') ||
        title.includes('音乐') || description.includes('音乐') ||
        title.includes('歌剧') || description.includes('歌剧')) {
      return '文化'
    }
    
    if (title.includes('聚会') || description.includes('聚会') || 
        title.includes('派对') || description.includes('派对') ||
        title.includes('bbq') || description.includes('bbq') ||
        title.includes('庆祝') || description.includes('庆祝')) {
      return '聚会'
    }
    
    if (title.includes('手工') || description.includes('手工') || 
        title.includes('制作') || description.includes('制作') ||
        title.includes('diy') || description.includes('diy')) {
      return '手工'
    }
    
    if (title.includes('美食') || description.includes('美食') || 
        title.includes('餐饮') || description.includes('餐饮') ||
        title.includes('bbq') || description.includes('bbq')) {
      return '美食'
    }
    
    // Default category
    return '文化'
  }
  
  // Filter events based on selected category
  const filteredEvents = activeCategory === '全部'
    ? events
    : events.filter(event => getEventCategory(event) === activeCategory)

  
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
    Taro.showModal({
      title: event.title,
      content: `${event.description}\n\n地点：${event.location}\n时间：${formatDate(event.startTime)} ${formatTime(event.startTime)}\n容量：${event.capacity}人`,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // Get category count
  const getCategoryCount = (category: string) => {
    if (category === '全部') return events.length
    return events.filter(event => getEventCategory(event) === category).length
  }

  return (
    <View className='past-activities-container'>
      {/* Header section with banner */}
      <View className='header-section'>
        <Image 
          className='header-image'
          src='https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop'
          mode='aspectFill'
        />
        <View className='header-overlay'>
          <View className='header-title'>以往活动</View>
          <View className='header-desc'>回顾我们的精彩时刻，期待您的参与！</View>
        </View>
      </View>

      {/* Category filter */}
      <View className='filter-section'>
        <ScrollView className='filter-scroll' scrollX>
          <View className='filter-list'>
            {categories.map(category => (
              <View
                key={category}
                className={`filter-item ${category === activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                <Text className='filter-text'>{category}</Text>
                <Text className='filter-count'>({getCategoryCount(category)})</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Activities list */}
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : filteredEvents.length > 0 ? (
            <View className='activity-list'>
              {filteredEvents.map(event => (
                <View 
                  key={event.id} 
                  className='activity-card'
                  onClick={() => handleEventClick(event)}
                >
                  <Image
                    className='activity-image'
                    src={event.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'}
                    mode='aspectFill'
                    lazyLoad
                  />
                  <View className='activity-info'>
                    <View className='activity-content'>
                      <View className='activity-title'>{event.title}</View>
                      <View className='activity-desc'>
                        {event.description || '暂无描述'}
                      </View>
                      <View className='activity-meta'>
                        <View className='meta-item'>
                          <Text className='meta-icon'>🕒</Text>
                          <Text className='meta-text'>
                            {formatDate(event.startTime)} {formatTime(event.startTime)}
                          </Text>
                        </View>
                        <View className='meta-item'>
                          <Text className='meta-icon'>📍</Text>
                          <Text className='meta-text'>{event.location || '线上活动'}</Text>
                        </View>
                        {event.capacity && (
                          <View className='meta-item'>
                            <Text className='meta-icon'>👥</Text>
                            <Text className='meta-text'>{event.capacity}人</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className='activity-category'>
                      <Text className='category-tag'>{getEventCategory(event)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Empty 
              description={activeCategory === '全部' ? '暂无过去活动' : `暂无${activeCategory}类活动`}
              imageSize={120}
            />
          )}

          {/* Bottom tip */}
          {!loading && filteredEvents.length > 0 && (
            <View className='bottom-tip'>
              <Text className='tip-text'>— 已显示全部活动 —</Text>
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
    </View>
  )
}

export default PastActivities 