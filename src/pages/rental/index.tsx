import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { rentalsApi, RentalItem, getRentalCategories, RentalCategory } from '../../services/rentals'
import './index.less'

const Rental: React.FC = () => {
  // 状态管理
  const [items, setItems] = useState<RentalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  // 分类数据
  const categories = getRentalCategories()

  // 加载租赁商品
  const loadItems = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      let response: RentalItem[] = []
      
      if (showAvailableOnly) {
        response = await rentalsApi.getAvailableItems()
      } else if (selectedCategory) {
        response = await rentalsApi.getItemsByCategory(selectedCategory)
      } else {
        response = await rentalsApi.getAllItems()
      }
      
      setItems(response || [])
    } catch (error) {
      console.error('加载租赁商品失败:', error)
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

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadItems(false)
  }

  // 分类筛选
  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setShowAvailableOnly(false)
  }

  // 可用商品筛选
  const handleAvailableFilter = () => {
    setShowAvailableOnly(!showAvailableOnly)
    setSelectedCategory(null)
  }

  // 商品点击事件
  const handleItemClick = (item: RentalItem) => {
    Taro.navigateTo({
      url: `/pages/rental/detail/index?id=${item.id}`
    })
  }

  // 格式化租金显示
  const formatRentalRate = (rate: string, period: string) => {
    const periodMap = {
      'hourly': '小时',
      'daily': '天',
      'weekly': '周',
      'monthly': '月'
    }
    return `¥${rate}/${periodMap[period] || '天'}`
  }

  // 格式化押金显示
  const formatDeposit = (deposit: string) => {
    return `押金¥${deposit}`
  }

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      'available': { text: '可租赁', color: '#52c41a' },
      'rented_out': { text: '已租出', color: '#ff4d4f' },
      'in_maintenance': { text: '维护中', color: '#faad14' }
    }
    return statusMap[status] || { text: '未知', color: '#999' }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadItems()
  }, [selectedCategory, showAvailableOnly])

  return (
    <View className='rental-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>设备租赁</Text>
          <Text className='subtitle'>专业设备，按需租赁</Text>
        </View>
      </View>

      {/* 筛选栏 */}
      <View className='filter-section'>
        {/* 分类筛选 */}
        <ScrollView className='category-filter' scrollX>
          <View className='category-list'>
            <View 
              className={`category-item ${selectedCategory === null && !showAvailableOnly ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(null)}
            >
              <Text className='category-icon'>🏠</Text>
              <Text className='category-name'>全部</Text>
            </View>
            {categories.map(category => (
              <View 
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(category.id)}
              >
                <Text className='category-icon'>{category.icon}</Text>
                <Text className='category-name'>{category.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 状态筛选 */}
        <View className='status-filter'>
          <View 
            className={`filter-button ${showAvailableOnly ? 'active' : ''}`}
            onClick={handleAvailableFilter}
          >
            <Text className='filter-text'>仅显示可租赁</Text>
          </View>
        </View>
      </View>

      {/* 商品列表 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : items.length === 0 ? (
            <Empty 
              description="暂无租赁商品"
              imageSize={120}
            />
          ) : (
            <View className='items-list'>
              {items.map(item => (
                <View 
                  key={item.id} 
                  className='item-card'
                  onClick={() => handleItemClick(item)}
                >
                  {/* 商品图片 */}
                  <View className='item-image-container'>
                    <Image 
                      className='item-image'
                      src={item.imageUrl}
                      mode='aspectFill'
                      lazyLoad
                    />
                    {/* 状态标签 */}
                    <View 
                      className='status-badge'
                      style={{ backgroundColor: getStatusDisplay(item.status).color }}
                    >
                      {getStatusDisplay(item.status).text}
                    </View>
                  </View>

                  {/* 商品信息 */}
                  <View className='item-info'>
                    <View className='item-header'>
                      <Text className='item-name'>{item.name}</Text>
                      <Text className='item-category'>{item.categoryName}</Text>
                    </View>
                    
                    <Text className='item-description'>{item.description}</Text>
                    
                    {/* 价格信息 */}
                    <View className='item-pricing'>
                      <Text className='rental-rate'>{formatRentalRate(item.rentalRate, item.rentalPeriod)}</Text>
                      <Text className='deposit'>{formatDeposit(item.deposit)}</Text>
                    </View>

                    {/* 操作按钮 */}
                    <View className='item-actions'>
                      <Text className='view-detail'>查看详情</Text>
                      {item.status === 'available' && (
                        <Text className='rent-now'>立即租赁</Text>
                      )}
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
    </View>
  )
}

export default Rental 