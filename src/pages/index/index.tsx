import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline, useLoad } from '@tarojs/taro'
import './index.less'
import { useAuth } from '../../context/auth'

// 主要功能 - 6个功能入口
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
  },
  {
    id: 5,
    title: '课程评价',
    subtitle: '分享学习体验',
    description: '查看和分享课程评价',
    icon: '📚',
    path: '/pages/course/index',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
    bgColor: '#faf5ff'
  },
  {
    id: 6,
    title: '联系我们',
    subtitle: '获取帮助与支持',
    description: '联系客服，获取帮助',
    icon: '📞',
    path: '/pages/contact-us/index',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
    bgColor: '#fffbeb'
  }
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



const Index: React.FC = () => {
  const { state } = useAuth()
  const { isLoggedIn } = state

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
    const upcomingPaths = ['/pages/course/index']
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
    if (upcomingPaths.includes(entry.path)) {
      Taro.showToast({
        title: `${entry.title}功能正在开发中`,
        icon: 'none',
        duration: 2000
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

      {/* 主要功能区域 - 6个功能入口 */}
      <View className='main-features-section'>
        <Text className='section-title'>服务功能</Text>
        <View className='main-features-grid'>
          {(isLoggedIn
            ? mainFeatures
            : mainFeatures.filter(f => f.path !== '/pages/second-hand/index')
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
