import React, { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
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

// Mock data for upcoming activities
const mockActivities = [
  {
    id: 1,
    title: '布好玩户外攀岩体验',
    description: '户外攀岩入门体验，专业教练指导，适合初学者。提供全套安全装备，快来挑战自我吧！',
    image: 'https://picsum.photos/400/300?random=20',
    date: '2023-08-15',
    time: '09:00-12:00',
    location: '城市攀岩中心',
    category: '运动',
    capacity: 20,
    enrolled: 12,
    price: '128'
  },
  {
    id: 2,
    title: '夏日城市定向越野赛',
    description: '在城市中寻找隐藏的线索，完成各种有趣的任务。组队参加，考验默契与智慧，赢取丰厚奖品！',
    image: 'https://picsum.photos/400/300?random=21',
    date: '2023-08-20',
    time: '14:00-18:00',
    location: '市中心广场',
    category: '竞技',
    capacity: 50,
    enrolled: 35,
    price: '99'
  },
  {
    id: 3,
    title: '自然摄影工作坊',
    description: '跟随专业摄影师学习如何捕捉自然之美。无论你使用何种装备，都能学到实用技巧。',
    image: 'https://picsum.photos/400/300?random=22',
    date: '2023-08-16',
    time: '15:30-17:30',
    location: '植物园',
    category: '艺术',
    capacity: 15,
    enrolled: 15,
    price: '168'
  },
  {
    id: 4,
    title: '城市夜跑俱乐部',
    description: '每周固定夜跑活动，不同路线、不同风景，遇见志同道合的朋友，一起享受跑步的乐趣。',
    image: 'https://picsum.photos/400/300?random=23',
    date: '2023-08-17',
    time: '19:30-21:00',
    location: '滨江公园',
    category: '运动',
    capacity: 30,
    enrolled: 22,
    price: '免费'
  },
  {
    id: 5,
    title: '周末手工陶艺课',
    description: '零基础陶艺创作体验，专业老师指导，制作属于自己的生活陶艺品。所有作品均可带回家。',
    image: 'https://picsum.photos/400/300?random=24',
    date: '2023-08-19',
    time: '10:00-12:30',
    location: '艺术中心',
    category: '手工',
    capacity: 12,
    enrolled: 8,
    price: '199'
  }
]

const RecentActivities: React.FC = () => {
  // Generate dates for navigation
  const dates = generateDates()
  
  // State for selected date
  const [selectedDate, setSelectedDate] = useState(dates[0].dateString)
  
  // Filter activities based on selected date
  const filteredActivities = mockActivities.filter(activity => 
    activity.date === selectedDate
  )
  
  // Handle activity join
  const handleJoin = (activityId) => {
    Taro.showModal({
      title: '活动报名',
      content: '确认报名参加该活动吗？',
      success: function (res) {
        if (res.confirm) {
          Taro.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  }

  return (
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

      {/* Activity section */}
      <View className='activity-section'>
        <View className='section-title'>
          {selectedDate === dates[0].dateString ? '今日活动' : `${selectedDate.slice(5).replace('-', '月')}日活动`}
        </View>
        
        {filteredActivities.length > 0 ? (
          filteredActivities.map(activity => (
            <View key={activity.id} className='activity-card'>
              <Image 
                className='activity-image'
                src={activity.image}
                mode='aspectFill'
              />
              <View className='activity-content'>
                <View className='activity-title'>{activity.title}</View>
                
                <View className='activity-time-location'>
                  <View className='activity-time'>
                    <Text className='icon'>🕒</Text>
                    <Text>{activity.time}</Text>
                  </View>
                  <View className='activity-location'>
                    <Text className='icon'>📍</Text>
                    <Text>{activity.location}</Text>
                  </View>
                </View>
                
                <View className='activity-desc'>{activity.description}</View>
                
                <View className='activity-footer'>
                  <View className='activity-tags'>
                    <View className='activity-tag'>{activity.category}</View>
                    <View className='activity-tag limit-tag'>
                      {activity.enrolled}/{activity.capacity}人
                    </View>
                    <View className='activity-tag'>
                      {activity.price}
                    </View>
                  </View>
                  
                  <View className='activity-action'>
                    {activity.enrolled < activity.capacity ? (
                      <View 
                        className='join-button'
                        onClick={() => handleJoin(activity.id)}
                      >
                        立即报名
                      </View>
                    ) : (
                      <View className='join-button full-button'>
                        已满员
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className='empty-state'>
            当天暂无活动安排，请选择其他日期或稍后再来~
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default RecentActivities 