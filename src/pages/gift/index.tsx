import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Toast } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { peripheralsApi, PeripheralItem, PeripheralFilters } from '../../services/peripherals'
import PeripheralFiltersComponent from '../../components/PeripheralFilters'
import Pagination from '../../components/Pagination'
import './index.less'

const Gift: React.FC = () => {
  // State management
  const [items, setItems] = useState<PeripheralItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // State for filters
  const [currentFilters, setCurrentFilters] = useState<PeripheralFilters>({
    page: 1,
    limit: 10
  })

  // Load peripheral items
  const loadItems = async (showLoading = true, filters: PeripheralFilters = currentFilters) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      // 使用新的分页API
      const response = await peripheralsApi.getAllItems(filters)
      setItems(response.data)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      })
    } catch (error) {
      console.error('Failed to load peripheral items:', error)
      showToastMessage('加载商品失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (filters: PeripheralFilters) => {
    const newFilters = {
      ...filters,
      page: 1, // 重置到第一页
      limit: 10
    }
    setCurrentFilters(newFilters)
    loadItems(true, newFilters)
  }

  // Handle pagination change
  const handlePageChange = (page: number) => {
    const newFilters = {
      ...currentFilters,
      page
    }
    setCurrentFilters(newFilters)
    loadItems(true, newFilters)
  }

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // Handle product click
  const handleItemClick = (item: PeripheralItem) => {
    Taro.navigateTo({
      url: `/pages/gift/detail/index?id=${item.id}`
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

  // 格式化库存显示
  const formatStock = (stock: number) => {
    if (stock > 100) {
      return '库存充足'
    } else if (stock > 10) {
      return `剩余${stock}件`
    } else if (stock > 0) {
      return `仅剩${stock}件`
    } else {
      return '暂时缺货'
    }
  }

  // 获取库存状态样式
  const getStockStatus = (stock: number) => {
    if (stock > 10) {
      return 'sufficient'
    } else if (stock > 0) {
      return 'low'
    } else {
      return 'out'
    }
  }

  // Load items on component mount
  useEffect(() => {
    loadItems()
  }, [])

  return (
    <View className='enhanced-peripheral-container'>
      {/* 增强的页面头部 */}
      <View className='enhanced-header'>
        <View className='header-background'>
          <View className='floating-shapes'>
            <View className='shape shape-1'></View>
            <View className='shape shape-2'></View>
            <View className='shape shape-3'></View>
            <View className='shape shape-4'></View>
          </View>
          <View className='header-overlay'></View>
        </View>
        <View className='header-content'>
          <View className='title-section'>
            <Text className='enhanced-title'>NBF 周边商城</Text>
            <Text className='enhanced-subtitle'>精选周边商品，品质保证</Text>
            <View className='stats-section'>
              <View className='stat-item'>
                <Text className='stat-number'>{items.length}</Text>
                <Text className='stat-label'>件商品</Text>
              </View>
              <View className='stat-divider'></View>
              <View className='stat-item'>
                <Text className='stat-number'>{items.filter(item => item.stock > 0).length}</Text>
                <Text className='stat-label'>有库存</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <PeripheralFiltersComponent
        onFiltersChange={handleFiltersChange}
        initialFilters={currentFilters}
      />

      {/* 增强的商品列表 */}
      <ScrollView className='enhanced-content' scrollY>
          {loading ? (
            <View className='enhanced-loading-container'>
              <View className='loading-animation'>
                <View className='loading-dots'>
                  <View className='dot dot-1'></View>
                  <View className='dot dot-2'></View>
                  <View className='dot dot-3'></View>
                </View>
                <Text className='loading-text'>正在寻找好物...</Text>
              </View>
            </View>
          ) : items.length === 0 ? (
            <View className='enhanced-empty-container'>
              <View className='empty-animation'>
                <Text className='empty-icon'>🛍️</Text>
                <Text className='empty-title'>暂无商品</Text>
                <Text className='empty-subtitle'>敬请期待更多精彩周边</Text>
              </View>
            </View>
          ) : (
            <View className='enhanced-items-grid'>
              {items.map((item, index) => (
                <View
                  key={item.id}
                  className={`enhanced-item-card card-${index % 2 === 0 ? 'left' : 'right'}`}
                  onClick={() => handleItemClick(item)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 增强的商品图片 */}
                  <View className='enhanced-item-image-container'>
                    <View className='image-wrapper'>
                      <Image
                        className='enhanced-item-image'
                        src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : (item.image || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop')}
                        mode='aspectFill'
                        lazyLoad
                      />
                      <View className='image-overlay'></View>
                    </View>

                    {/* 价格浮动标签 */}
                    <View className='price-badge-floating'>
                      <Text className='price-symbol'>¥</Text>
                      <Text className='price-amount'>{typeof item.price === 'number' ? item.price : item.price}</Text>
                    </View>

                    {/* 库存状态标签 */}
                    <View className={`stock-status-badge ${getStockStatus(item.stock)}`}>
                      <Text className='stock-text'>{formatStock(item.stock)}</Text>
                    </View>
                  </View>

                  {/* 增强的商品信息 */}
                  <View className='enhanced-item-info'>
                    <View className='info-header'>
                      <Text className='enhanced-item-name'>{item.name}</Text>
                      <View className='item-meta'>
                        <Text className='meta-time'>{formatTime(item.dateCreated || item.createdAt || new Date().toISOString())}</Text>
                        {item.categoryName && (
                          <Text className='meta-category'>{item.categoryName}</Text>
                        )}
                      </View>
                    </View>

                    <View className='info-content'>
                      <Text className='enhanced-item-description'>{item.description}</Text>
                    </View>

                    <View className='info-footer'>
                      <View className='price-section'>
                        <Text className='price-label'>价格</Text>
                        <Text className='enhanced-item-price'>¥{typeof item.price === 'number' ? item.price : item.price}</Text>
                      </View>
                      <View className='action-section'>
                        <View className='action-button'>
                          <Text className='action-text'>查看详情</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 增强的分页 */}
          {!loading && items.length > 0 && pagination.totalPages > 1 && (
            <View className='enhanced-pagination-wrapper'>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </View>
          )}

          {/* 增强的底部提示 */}
          {!loading && items.length > 0 && pagination.totalPages <= 1 && (
            <View className='enhanced-footer-tip'>
              <View className='tip-content'>
                <Text className='tip-icon'>✨</Text>
                <Text className='tip-text'>已显示全部商品</Text>
                <Text className='tip-subtext'>发现了 {items.length} 件精品</Text>
              </View>
            </View>
          )}
      </ScrollView>

      {/* Toast */}
      <Toast
        content={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />
    </View>
  )
}

export default Gift
