import React, { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

// Tab options
const tabs = [
  { id: 'passenger', name: '我要搭车' },
  { id: 'driver', name: '我要载人' }
]

// Filter options
const dateFilters = [
  { id: 'today', name: '今天' },
  { id: 'tomorrow', name: '明天' },
  { id: 'this_week', name: '本周' },
  { id: 'all', name: '全部' }
]

// Mock carpooling data
const mockCarpools = {
  passenger: [
    {
      id: 1,
      startPoint: '朝阳CBD',
      endPoint: '海淀西二旗',
      departureTime: '今天 18:30',
      departureDate: '2023-08-15',
      user: {
        name: '李先生',
        avatar: 'https://picsum.photos/100/100?random=50'
      },
      price: 30,
      seats: 2,
      remainingSeats: 1,
      distance: '15km',
      tags: ['准时出发', '不抽烟'],
      isFull: false
    },
    {
      id: 2,
      startPoint: '望京SOHO',
      endPoint: '天通苑',
      departureTime: '明天 08:30',
      departureDate: '2023-08-16',
      user: {
        name: '王女士',
        avatar: 'https://picsum.photos/100/100?random=51'
      },
      price: 25,
      seats: 3,
      remainingSeats: 0,
      distance: '12km',
      tags: ['舒适轿车', '可带小件'],
      isFull: true
    },
    {
      id: 3,
      startPoint: '国贸',
      endPoint: '回龙观',
      departureTime: '明天 19:00',
      departureDate: '2023-08-16',
      user: {
        name: '张先生',
        avatar: 'https://picsum.photos/100/100?random=52'
      },
      price: 35,
      seats: 4,
      remainingSeats: 2,
      distance: '20km',
      tags: ['高速优先', '有暖气/空调'],
      isFull: false
    }
  ],
  driver: [
    {
      id: 4,
      startPoint: '西直门',
      endPoint: '燕郊',
      departureTime: '今天 17:45',
      departureDate: '2023-08-15',
      user: {
        name: '刘女士',
        avatar: 'https://picsum.photos/100/100?random=53'
      },
      price: 40,
      seats: 1,
      remainingSeats: 1,
      distance: '25km',
      tags: ['准时', '走高速'],
      isFull: false
    },
    {
      id: 5,
      startPoint: '大兴机场',
      endPoint: '亦庄',
      departureTime: '明天 10:30',
      departureDate: '2023-08-16',
      user: {
        name: '赵先生',
        avatar: 'https://picsum.photos/100/100?random=54'
      },
      price: 60,
      seats: 1,
      remainingSeats: 1,
      distance: '35km',
      tags: ['机场接送', '行李空间大'],
      isFull: false
    }
  ]
}

const Carpool: React.FC = () => {
  // State for active tab and filters
  const [activeTab, setActiveTab] = useState('passenger')
  const [activeDateFilter, setActiveDateFilter] = useState('all')
  
  // Filter carpools by date
  const filterCarpoolsByDate = (carpools, dateFilter) => {
    if (dateFilter === 'all') return carpools
    
    const today = '2023-08-15' // Hardcoded for demo
    const tomorrow = '2023-08-16' // Hardcoded for demo
    
    return carpools.filter(carpool => {
      switch(dateFilter) {
        case 'today':
          return carpool.departureDate === today
        case 'tomorrow':
          return carpool.departureDate === tomorrow
        case 'this_week':
          // In a real app, would check if within current week
          return true
        default:
          return true
      }
    })
  }
  
  // Get filtered carpools
  const carpools = filterCarpoolsByDate(mockCarpools[activeTab], activeDateFilter)
  
  // Handle post new carpool
  const handlePostCarpool = () => {
    Taro.showToast({
      title: '发布功能开发中',
      icon: 'none',
      duration: 2000
    })
  }
  
  // Handle join carpool
  const handleJoinCarpool = (carpoolId) => {
    Taro.showToast({
      title: '拼车功能开发中',
      icon: 'none',
      duration: 2000
    })
  }

  return (
    <View className='carpool-container'>
      {/* Tab Navigation */}
      <View className='tabs-section'>
        {tabs.map(tab => (
          <View
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </View>
        ))}
      </View>
      
      {/* Carpool Listings */}
      <View className='cards-section'>
        {/* Filters */}
        <View className='filter-section'>
          <View className='filter-left'>
            {dateFilters.map(filter => (
              <View
                key={filter.id}
                className={`filter-item ${activeDateFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveDateFilter(filter.id)}
              >
                {filter.name}
                {activeDateFilter === filter.id && (
                  <Text className='filter-icon'>✓</Text>
                )}
              </View>
            ))}
          </View>
          <View className='filter-right'>
            <View className='sort-button'>
              时间排序 ▼
            </View>
          </View>
        </View>
        
        {/* Carpool Cards */}
        {carpools.length > 0 ? (
          carpools.map(carpool => (
            <View key={carpool.id} className='carpool-card'>
              {/* Card Header */}
              <View className='card-header'>
                <View className='route-info'>
                  <View className='route-title'>
                    <Text className='start-point'>{carpool.startPoint}</Text>
                    <Text className='route-arrow'>→</Text>
                    <Text className='end-point'>{carpool.endPoint}</Text>
                  </View>
                  <View className='route-time'>{carpool.departureTime}</View>
                </View>
                <View className='card-user'>
                  <Image 
                    className='user-avatar'
                    src={carpool.user.avatar}
                    mode='aspectFill'
                  />
                  <Text className='user-name'>{carpool.user.name}</Text>
                </View>
              </View>
              
              {/* Card Details */}
              <View className='card-details'>
                <View className='detail-item'>
                  <Text className='detail-label'>单人价格</Text>
                  <Text className='detail-value highlight'>¥{carpool.price}</Text>
                </View>
                <View className='detail-item'>
                  <Text className='detail-label'>剩余座位</Text>
                  <Text className='detail-value'>{carpool.remainingSeats}/{carpool.seats}</Text>
                </View>
                <View className='detail-item'>
                  <Text className='detail-label'>预计路程</Text>
                  <Text className='detail-value'>{carpool.distance}</Text>
                </View>
              </View>
              
              {/* Card Footer */}
              <View className='card-footer'>
                <View className='card-tags'>
                  {carpool.tags.map((tag, index) => (
                    <Text key={index} className='card-tag'>{tag}</Text>
                  ))}
                </View>
                <View className='card-action'>
                  <View 
                    className={`action-button ${carpool.isFull ? 'disabled' : ''}`}
                    onClick={() => !carpool.isFull && handleJoinCarpool(carpool.id)}
                  >
                    {carpool.isFull ? '已满员' : activeTab === 'passenger' ? '申请搭车' : '申请搭载'}
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className='empty-state'>
            <View className='empty-icon'>🚗</View>
            <View className='empty-text'>暂无{activeTab === 'passenger' ? '可搭乘' : '乘客需求'}信息</View>
            <View className='empty-action' onClick={handlePostCarpool}>
              {activeTab === 'passenger' ? '我要找车' : '我要载人'}
            </View>
          </View>
        )}
      </View>
      
      {/* Post Button */}
      <View className='post-button' onClick={handlePostCarpool}>
        <Text className='post-icon'>+</Text>
        <Text>{activeTab === 'passenger' ? '发布找车' : '发布载人'}</Text>
      </View>
    </View>
  )
}

export default Carpool 