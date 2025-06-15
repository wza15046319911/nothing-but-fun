import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Loading } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { peripheralsApi, PeripheralItem } from '../../../services/peripherals'
import './index.less'

const GiftDetail: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  
  // 状态管理
  const [item, setItem] = useState<PeripheralItem | null>(null)
  const [loading, setLoading] = useState(false)

  // 加载商品详情
  const loadItemDetail = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const response = await peripheralsApi.getItemById(parseInt(id))
      setItem(response)
    } catch (error) {
      console.error('加载商品详情失败:', error)
      Taro.showToast({
        title: '加载失败，请稍后重试',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
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

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 分享商品
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadItemDetail()
  }, [id])

  if (loading) {
    return (
      <View className='detail-container'>
        <View className='loading-container'>
          <Loading type="spinner" />
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!item) {
    return (
      <View className='detail-container'>
        <View className='error-container'>
          <Text className='error-text'>商品不存在</Text>
          <Text className='back-link' onClick={handleBack}>返回商品列表</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='detail-container'>
      <ScrollView className='content' scrollY>
        {/* 商品图片 */}
        <View className='image-section'>
          <Image 
            className='main-image'
            src={item.image}
            mode='aspectFill'
          />
          <View className={`stock-badge ${getStockStatus(item.stock)}`}>
            {formatStock(item.stock)}
          </View>
        </View>

        {/* 商品基本信息 */}
        <View className='info-section'>
          <View className='basic-info'>
            <Text className='item-name'>{item.name}</Text>
            <Text className='item-price'>{formatPrice(item.price)}</Text>
          </View>
          
          <View className='item-description'>
            <Text className='description-text'>{item.description}</Text>
          </View>
        </View>

        {/* 商品详细信息 */}
        <View className='details-section'>
          <View className='section-title'>
            <Text className='title-text'>商品详情</Text>
          </View>
          
          <View className='detail-item'>
            <Text className='detail-label'>商品编号:</Text>
            <Text className='detail-value'>NBF-{item.id.toString().padStart(4, '0')}</Text>
          </View>
          
          <View className='detail-item'>
            <Text className='detail-label'>库存数量:</Text>
            <Text className='detail-value'>{item.stock}件</Text>
          </View>
          
          <View className='detail-item'>
            <Text className='detail-label'>上架时间:</Text>
            <Text className='detail-value'>{formatTime(item.createdAt)}</Text>
          </View>
        </View>

        {/* 商品特色 */}
        <View className='features-section'>
          <View className='section-title'>
            <Text className='title-text'>商品特色</Text>
          </View>
          
          <View className='features-list'>
            <View className='feature-item'>
              <Text className='feature-icon'>✨</Text>
              <Text className='feature-text'>官方正品保证</Text>
            </View>
            <View className='feature-item'>
              <Text className='feature-icon'>🚚</Text>
              <Text className='feature-text'>全国包邮配送</Text>
            </View>
            <View className='feature-item'>
              <Text className='feature-icon'>🔄</Text>
              <Text className='feature-text'>7天无理由退换</Text>
            </View>
            <View className='feature-item'>
              <Text className='feature-icon'>💎</Text>
              <Text className='feature-text'>精选优质材料</Text>
            </View>
          </View>
        </View>

        {/* 购买须知 */}
        <View className='notice-section'>
          <View className='section-title'>
            <Text className='title-text'>购买须知</Text>
          </View>
          
          <View className='notice-content'>
            <Text className='notice-text'>• 本商品为NBF官方周边产品</Text>
            <Text className='notice-text'>• 商品图片仅供参考，以实物为准</Text>
            <Text className='notice-text'>• 如有质量问题，支持7天无理由退换</Text>
            <Text className='notice-text'>• 配送时间为3-7个工作日</Text>
            <Text className='notice-text'>• 如有疑问，请联系客服咨询</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='bottom-actions'>
        <View className='action-button share-button' onClick={handleShare}>
          <Text className='action-text'>分享</Text>
        </View>
        <View className='action-button contact-button'>
          <Text className='action-text'>联系客服</Text>
        </View>
      </View>
    </View>
  )
}

export default GiftDetail 