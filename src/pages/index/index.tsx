import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

// 重点功能 - 大卡片展示
const featuredEntries = [
  { 
    id: 1, 
    title: '美食推荐', 
    subtitle: '发现周边美味餐厅',
    iconName: 'utensils', 
    path: '/pages/restaurant/index',
    color: '#ff6b6b'
  },
  { 
    id: 2, 
    title: '二手买卖', 
    subtitle: '闲置物品交易平台',
    iconName: 'shopping-bag', 
    path: '/pages/second-hand/index',
    color: '#4ecdc4'
  },
  { 
    id: 3, 
    title: '课程评价', 
    subtitle: 'UQ课程评分与评价',
    iconName: 'graduation-cap', 
    path: '/pages/course/index',
    color: '#45b7d1'
  },
  { 
    id: 4, 
    title: '往期活动', 
    subtitle: '精彩活动回顾',
    iconName: 'calendar-check', 
    path: '/pages/past-activities/index',
    color: '#96ceb4'
  }
]

// 其他功能 - 小图标展示，可滑动
const otherEntries = [
  { id: 5, title: '最近活动', iconName: 'flag', path: '/pages/recent-activities/index' },
  { id: 6, title: '布好玩周边', iconName: 'gift', path: '/pages/gift/index' },
  // { id: 7, title: '租赁服务', iconName: 'key', path: '/pages/rental/index' },
  { id: 8, title: '租房信息', iconName: 'home', path: '/pages/rental-house/index' },
  { id: 9, title: '我们的车', iconName: 'truck', path: '/pages/car-rental/index' },
  { id: 10, title: '定制游', iconName: 'map-marked', path: '/pages/custom-tour/index' },
  { id: 11, title: '联系我们', iconName: 'phone-alt', path: '/pages/contact-us/index' }
]

// 推荐内容图片
const recommendedImages = [
  'https://images.unsplash.com/photo-1745874864678-f464940bb513',
  'https://images.unsplash.com/photo-1749731630653-d9b3f00573ed',
  'https://images.unsplash.com/photo-1749215763709-c057dbb60cf3',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'
]

const getRandomImages = (images, count) => {
  const shuffled = [...images].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const Index: React.FC = () => {
  const randomImages = getRandomImages(recommendedImages, 4)

  // 处理功能点击
  const handleEntryClick = (entry) => {
    if (entry.path) {
      Taro.navigateTo({
        url: entry.path
      })
    } else {
      Taro.showToast({
        title: `${entry.title}功能正在开发中`,
        icon: 'none',
        duration: 2000
      })
    }
  }


  return (
    <ScrollView className='index-container' scrollY>
      {/* 页面头部 */}
      <View className='header-section'>
        <View className='header-content'>
          <Text className='app-title'>Nothing But Fun</Text>
          <Text className='app-subtitle'>布里斯班华人生活服务平台</Text>
        </View>
      </View>

      {/* 重点功能区域 */}
      <View className='featured-section'>
        <Text className='section-title'>热门功能</Text>
        <View className='featured-grid'>
          {featuredEntries.map(entry => (
            <View 
              key={entry.id}
              className='featured-card'
              onClick={() => handleEntryClick(entry)}
            >
              <View className='card-content'>
                <View 
                  className={`featured-icon ${entry.iconName}`}
                  style={{ backgroundColor: entry.color }}
                />
                <View className='card-text'>
                  <Text className='card-title'>{entry.title}</Text>
                  <Text className='card-subtitle'>{entry.subtitle}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 其他功能区域 - 可滑动 */}
      <View className='other-section'>
        <Text className='section-title'>更多服务</Text>
        <ScrollView className='other-scroll' scrollX showScrollbar={false}>
          <View className='other-items'>
            {otherEntries.map(entry => (
              <View 
                key={entry.id}
                className='other-item'
                onClick={() => handleEntryClick(entry)}
              >
                <View className={`other-icon ${entry.iconName}`} />
                <Text className='other-text'>{entry.title}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 推荐内容区域 */}
      <View className='recommended-section'>
        <Text className='section-title'>猜你喜欢</Text>
        <View className='recommended-items'>
          {randomImages.map((imgSrc, index) => (
            <View key={index} className='recommended-item'>
              <Image
                src={imgSrc}
                mode='aspectFill'
                className='recommended-image'
              />
              <View className='recommended-overlay'>
                <Text className='recommended-title'>精彩内容 {index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default Index
