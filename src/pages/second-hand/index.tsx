import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Toast } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { secondhandApi, SecondhandItem } from '../../services/secondhand'
import { useAuth } from '../../context/auth'
import './index.less'

// Categories for filtering (can be extended based on business needs)
const categories = [
  { id: 'all', name: '全部', icon: '🏠' },
  { id: 'digital', name: '数码产品', icon: '📱' },
  { id: 'furniture', name: '家居家具', icon: '🛋️' },
  { id: 'clothes', name: '服饰装备', icon: '👕' },
  { id: 'books', name: '图书音像', icon: '📚' },
  { id: 'sports', name: '运动户外', icon: '🏀' },
  { id: 'beauty', name: '美妆日化', icon: '💄' },
  { id: 'toys', name: '玩具乐器', icon: '🎸' }
]

// Filter options
const filters = [
  { id: 'default', name: '默认排序' },
  { id: 'newest', name: '最新发布' },
  { id: 'price_asc', name: '价格升序' },
  { id: 'price_desc', name: '价格降序' }
]

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
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('default')
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

  // Filter items by category (based on title/description keywords)
  const getFilteredItems = () => {
    let filtered = items

    // Filter by category (simple keyword matching)
    if (selectedCategory !== 'all') {
      const categoryKeywords = {
        'digital': ['手机', '电脑', '平板', '耳机', '相机', 'iPhone', 'iPad', 'MacBook', '数码'],
        'furniture': ['桌子', '椅子', '沙发', '床', '柜子', '家具', '宜家'],
        'clothes': ['衣服', '鞋子', '包包', '帽子', '裤子', '裙子', '外套'],
        'books': ['书', '小说', '教材', '漫画', '杂志'],
        'sports': ['运动', '健身', '球', '户外', '登山'],
        'beauty': ['化妆品', '护肤', '香水', '面膜'],
        'toys': ['玩具', '乐器', '游戏', '模型']
      }

      const keywords = categoryKeywords[selectedCategory] || []
      filtered = items.filter(item => 
        keywords.some(keyword => 
          item.title.includes(keyword) || item.description.includes(keyword)
        )
      )
    }

    // Sort by selected filter
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedFilter) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'price_asc':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price_desc':
          return parseFloat(b.price) - parseFloat(a.price)
        default:
          return 0
      }
    })

    return sorted
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

  const filteredItems = getFilteredItems()

  return (
    <View className='second-hand-container'>
      {/* Search bar */}
      <View className='search-section'>
        <View className='search-bar' onClick={handleSearchClick}>
          <Text className='search-icon'>🔍</Text>
          <Text className='search-placeholder'>搜索二手闲置物品</Text>
        </View>
      </View>
      
      {/* Categories */}
      <ScrollView className='categories-section' scrollX>
        <View className='category-list'>
          {categories.map(category => (
            <View
              key={category.id}
              className={`category-item ${category.id === selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <View className='category-icon'>{category.icon}</View>
              <Text className='category-name'>{category.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Filters */}
      <View className='filter-section'>
        {filters.map(filter => (
          <View
            key={filter.id}
            className={`filter-item ${filter.id === selectedFilter ? 'active' : ''}`}
            onClick={() => setSelectedFilter(filter.id)}
          >
            {filter.name}
            {filter.id === selectedFilter && (
              <Text className='filter-icon'>✓</Text>
            )}
          </View>
        ))}
      </View>
      
      {/* Content Area with Pull to Refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        pullingText="下拉刷新"
        canReleaseText="释放刷新"
        refreshingText="刷新中..."
        completeText="刷新完成"
      >
        {loading ? (
          <View className='loading-container'>
            <Loading type="spinner" />
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : filteredItems.length > 0 ? (
          <View className='product-grid'>
            {filteredItems.map(item => (
              <View 
                key={item.id} 
                className='product-card'
                onClick={() => handleProductClick(item)}
              >
                <View className='product-inner'>
                  <View className='product-image'>
                    <Image 
                      className='product-img'
                      src={item.image}
                      mode='aspectFill'
                      onError={() => {
                        // Handle image load error
                        console.log('Image load failed for item:', item.id)
                      }}
                    />
                    <View 
                      className='product-status'
                      style={{ backgroundColor: statusMap[item.status].color }}
                    >
                      {statusMap[item.status].text}
                    </View>
                  </View>
                  <View className='product-content'>
                    <View className='product-title'>{item.title}</View>
                    <View className='product-price'>¥{item.price}</View>
                    <View className='product-description'>{item.description}</View>
                    <View className='product-meta'>
                      <Text className='product-seller'>卖家ID: {item.sellerId}</Text>
                      <Text className='product-time'>{formatTime(item.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Empty 
            description="暂无相关商品"
            imageSize={80}
          >
            <View className='empty-action' onClick={handlePostNew}>
              发布闲置
            </View>
          </Empty>
        )}
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