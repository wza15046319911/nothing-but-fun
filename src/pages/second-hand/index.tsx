import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Toast } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { secondhandApi, SecondhandItem } from '../../services/secondhand'
import { useAuth } from '../../context/auth'
import './index.less'

// Status display mapping
const statusMap = {
  'available': { text: '可购买', color: '#52c41a' },
  'sold': { text: '已售出', color: '#ff4d4f' },
  'reserved': { text: '已预订', color: '#faad14' }
}

const SecondHand: React.FC = () => {
  // Auth context
  const { state: authState } = useAuth()
  const { isLoggedIn } = authState
  
  // State management
  const [items, setItems] = useState<SecondhandItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Load secondhand items
  const loadItems = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      const response = await secondhandApi.getAllItems()
      setItems(response || [])
    } catch (error) {
      console.error('Failed to load secondhand items:', error)
      showToastMessage('加载商品失败，请稍后重试')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadItems(false)
  }



  // Handle search click
  const handleSearchClick = () => {
    Taro.showToast({
      title: '搜索功能开发中',
      icon: 'none',
      duration: 2000
    })
  }

  // Handle post new item
  const handlePostNew = () => {
    // Check if user is logged in using context
    if (!isLoggedIn) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再发布商品',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/user-login/index'
            })
          }
        }
      })
      return
    }

    Taro.navigateTo({
      url: '/pages/second-hand/publish/index'
    })
  }

  // Handle product click
  const handleProductClick = (item: SecondhandItem) => {
    // Navigate to product detail page
    Taro.navigateTo({
      url: `/pages/second-hand/detail/index?id=${item.id}`
    })
  }

  // Format time display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Load items on component mount
  useEffect(() => {
    loadItems()
  }, [])

  return (
    <View className='second-hand-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>二手闲置</Text>
          <Text className='subtitle'>发现好物，交换价值</Text>
        </View>
      </View>
      
      {/* 商品列表 */}
      <PullToRefresh 
        onRefresh={handleRefresh}
        pullingText="下拉刷新"
        canReleaseText="释放刷新"
        refreshingText="刷新中..."
        completeText="刷新完成"
      >
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : items.length === 0 ? (
            <Empty 
              description="暂无商品"
              imageSize={120}
            />
          ) : (
            <View className='items-grid'>
              {items.map(item => (
                <View 
                  key={item.id} 
                  className='item-card'
                  onClick={() => handleProductClick(item)}
                >
                  {/* 商品图片 */}
                  <View className='item-image-container'>
                    <Image 
                      className='item-image'
                      src={item.images && item.images.length > 0 ? item.images[0] : item.image}
                      mode='aspectFill'
                      lazyLoad
                    />
                    {/* 多图片指示器 */}
                    {item.images && item.images.length > 1 && (
                      <View className='image-count-badge'>
                        📷 {item.images.length}
                      </View>
                    )}
                    {/* 状态标签 */}
                    <View 
                      className={`stock-badge ${item.status}`}
                      style={{ backgroundColor: statusMap[item.status].color }}
                    >
                      {statusMap[item.status].text}
                    </View>
                  </View>

                  {/* 商品信息 */}
                  <View className='item-info'>
                    <Text className='item-name'>{item.title}</Text>
                    <Text className='item-description'>{item.description}</Text>
                    
                    {/* 价格和时间 */}
                    <View className='item-footer'>
                      <Text className='item-price'>${item.price}</Text>
                      <View className='item-actions'>
                        <Text className='view-detail'>{formatTime(item.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 底部提示 */}
          {!loading && items.length > 0 && (
            <View className='footer-tip'>
              <Text className='tip-text'>— 已显示全部商品 —</Text>
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
      
      {/* Floating action button */}
      <View className='floating-button' onClick={handlePostNew}>
        +
      </View>

      {/* Toast */}
      <Toast
        msg={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />
    </View>
  )
}

export default SecondHand 