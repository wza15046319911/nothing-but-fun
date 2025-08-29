import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline, useLoad } from '@tarojs/taro'
import './index.less'
import { useAuth } from '../../context/auth'

// 主要功能 - 大卡片展示，突出显示
const mainFeatures = [
  {
    id: 1,
    title: '美食推荐',
    subtitle: '发现周边美味餐厅',
    description: '精选本地餐厅，美食评价',
    icon: '🍽️',
    path: '/pages/restaurant/index',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
    bgColor: '#fff5f5'
  },
  {
    id: 2,
    title: '二手买卖',
    subtitle: '闲置物品交易平台',
    description: '买卖二手好物，环保又实惠',
    icon: '🛍️',
    path: '/pages/second-hand/index',
    gradient: 'linear-gradient(135deg, #4ecdc4 0%, #6ee7dd 100%)',
    bgColor: '#f0fffe'
  },
  {
    id: 3,
    title: '周边商品',
    subtitle: '便捷购买周边商品',
    description: '更多周边商品，更多乐趣',
    icon: '🎁',
    path: '/pages/gift/index',
    gradient: 'linear-gradient(135deg, #45b7d1 0%, #6cc5e0 100%)',
    bgColor: '#f0f9ff'
  },
  {
    id: 4,
    title: '往期活动',
    subtitle: '精彩活动回顾',
    description: '查看往期精彩活动内容',
    icon: '📅',
    path: '/pages/past-activities/index',
    gradient: 'linear-gradient(135deg, #96ceb4 0%, #b3d9c7 100%)',
    bgColor: '#f0fdf4'
  }
]

// 次要功能 - 紧凑图标展示
const secondaryFeatures = [
  { id: 5, title: '布好玩周边', icon: '🎁', path: '/pages/gift/index' },
  { id: 6, title: '租房信息', icon: '🏠', path: '/pages/rental-house/index' },
  { id: 7, title: '我们的车', icon: '🚛', path: '/pages/car-rental/index' },
  { id: 8, title: '定制游', icon: '🗺️', path: '/pages/custom-tour/index' },
  { id: 9, title: '联系我们', icon: '📞', path: '/pages/contact-us/index' }
]

// 推荐内容图片
const recommendedImages = [
  'https://images.unsplash.com/photo-1745874864678-f464940bb513',
  'https://images.unsplash.com/photo-1749731630653-d9b3f00573ed',
  'https://images.unsplash.com/photo-1749215763709-c057dbb60cf3',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'
]

// 类型定义
interface FeatureEntry {
  id: number
  title: string
  subtitle?: string
  description?: string
  icon: string
  path: string
  gradient?: string
  bgColor?: string
}

const getRandomImages = (images: string[], count: number): string[] => {
  const shuffled = [...images].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const Index: React.FC = () => {
  const { state } = useAuth()
  const { isLoggedIn } = state
  const randomImages = getRandomImages(recommendedImages, 4)

  // 分享给好友：落地到 loading 页面
  useShareAppMessage(() => ({
    title: 'Nothing But Fun | 布好玩',
    path: '/pages/loading/index'
  }))

  // 朋友圈分享：附带标记参数，进入首页后跳转 loading
  useShareTimeline(() => ({
    title: 'Nothing But Fun | 布好玩',
    query: 'fromShare=1'
  }))

  // 处理从分享进入首页的场景，先跳转到 loading
  useLoad((options) => {
    if (options && options.fromShare === '1') {
      Taro.reLaunch({ url: '/pages/loading/index' })
    }
  })

  // 处理功能点击
  const handleEntryClick = (entry: FeatureEntry) => {
    const restrictedPaths = ['/pages/second-hand/index']
    if (restrictedPaths.includes(entry.path) && !isLoggedIn) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再使用该功能',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/user-login/index' })
          }
        }
      })
      return
    }
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

      {/* 主要功能区域 - 重新设计 */}
      <View className='main-features-section'>
        <Text className='section-title'>主要功能</Text>
        <View className='main-features-grid'>
          {(isLoggedIn
            ? mainFeatures
            : mainFeatures.filter(f => !['/pages/second-hand/index', '/pages/carpool/index'].includes(f.path))
          ).map(feature => (
            <View
              key={feature.id}
              className='main-feature-card'
              onClick={() => handleEntryClick(feature)}
              style={{ backgroundColor: feature.bgColor }}
            >
              <View className='feature-header'>
                <View
                  className='feature-icon-container'
                  style={{ background: feature.gradient }}
                >
                  <Text className='feature-icon'>{feature.icon}</Text>
                </View>
                <View className='feature-badge'>
                  <Text className='badge-text'>热门</Text>
                </View>
              </View>
              <View className='feature-content'>
                <Text className='feature-title'>{feature.title}</Text>
                <Text className='feature-subtitle'>{feature.subtitle}</Text>
                <Text className='feature-description'>{feature.description}</Text>
              </View>
              <View className='feature-arrow'>
                <Text className='arrow-icon'>→</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 次要功能区域 - 紧凑布局 */}
      <View className='secondary-features-section'>
        <Text className='section-title'>更多服务</Text>
        <View className='secondary-features-grid'>
          {secondaryFeatures.map(feature => (
            <View
              key={feature.id}
              className='secondary-feature-item'
              onClick={() => handleEntryClick(feature)}
            >
              <View className='secondary-icon-container'>
                <Text className='secondary-icon'>{feature.icon}</Text>
              </View>
              <Text className='secondary-title'>{feature.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 推荐内容区域 */}
      {/* <View className='recommended-section'>
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
      </View> */}
    </ScrollView>
  )
}

export default Index
