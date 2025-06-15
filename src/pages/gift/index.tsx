import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { peripheralsApi, PeripheralItem } from '../../services/peripherals'
import './index.less'

const Gift: React.FC = () => {
  // 状态管理
  const [items, setItems] = useState<PeripheralItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 加载周边商品
  const loadItems = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      const response = await peripheralsApi.getAllItems()
      setItems(response || [])
    } catch (error) {
      console.error('加载周边商品失败:', error)
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

  // 商品点击事件
  const handleItemClick = (item: PeripheralItem) => {
    Taro.navigateTo({
      url: `/pages/gift/detail/index?id=${item.id}`
    })
  }

  // 格式化价格显示
  const formatPrice = (price: string) => {
    return `¥${price}`
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

  // 组件挂载时加载数据
  useEffect(() => {
    loadItems()
  }, [])

  return (
    <View className='gift-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>NBF 周边商城</Text>
          <Text className='subtitle'>精选周边商品，品质保证</Text>
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
              description="暂无商品"
              imageSize={120}
            />
          ) : (
            <View className='items-grid'>
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
                      src={item.image}
                      mode='aspectFill'
                      lazyLoad
                    />
                    {/* 库存标签 */}
                    <View className={`stock-badge ${getStockStatus(item.stock)}`}>
                      {formatStock(item.stock)}
                    </View>
                  </View>

                  {/* 商品信息 */}
                  <View className='item-info'>
                    <Text className='item-name'>{item.name}</Text>
                    <Text className='item-description'>{item.description}</Text>
                    
                    {/* 价格和库存 */}
                    <View className='item-footer'>
                      <Text className='item-price'>{formatPrice(item.price)}</Text>
                      <View className='item-actions'>
                        <Text className='view-detail'>查看详情</Text>
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
    </View>
  )
}

export default Gift
