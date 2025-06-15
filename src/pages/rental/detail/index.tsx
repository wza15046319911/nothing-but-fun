import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Loading, Button } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { rentalsApi, RentalItem } from '../../../services/rentals'
import './index.less'

const RentalDetail: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  
  // 状态管理
  const [item, setItem] = useState<RentalItem | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载商品详情
  const loadItemDetail = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const response = await rentalsApi.getItemById(parseInt(id))
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

  // 联系客服
  const handleContactService = () => {
    Taro.showModal({
      title: '联系客服',
      content: '请拨打客服电话：400-123-4567\n或添加微信：nbf-service',
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // 立即租赁
  const handleRentNow = () => {
    if (!item) return
    
    if (item.status !== 'available') {
      Taro.showToast({
        title: '该商品暂不可租赁',
        icon: 'error',
        duration: 2000
      })
      return
    }

    Taro.showModal({
      title: '租赁确认',
      content: `确定要租赁"${item.name}"吗？\n租金：¥${item.rentalRate}/${getPeriodText(item.rentalPeriod)}\n押金：¥${item.deposit}`,
      confirmText: '确认租赁',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 这里应该跳转到租赁确认页面或调用租赁API
          Taro.showToast({
            title: '租赁申请已提交',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  }

  // 分享商品
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }

  // 格式化租赁周期
  const getPeriodText = (period: string) => {
    const periodMap = {
      'hourly': '小时',
      'daily': '天',
      'weekly': '周',
      'monthly': '月'
    }
    return periodMap[period] || '天'
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

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadItemDetail()
  }, [id])

  if (loading) {
    return (
      <View className='loading-container'>
        <Loading type="spinner" />
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (!item) {
    return (
      <View className='error-container'>
        <Text className='error-text'>商品不存在或已下架</Text>
        <Button 
          type="primary" 
          onClick={() => Taro.navigateBack()}
          style={{ marginTop: '20px' }}
        >
          返回
        </Button>
      </View>
    )
  }

  return (
    <View className='rental-detail-container'>
      <ScrollView className='content' scrollY>
        {/* 商品图片 */}
        <View className='image-section'>
          <Image 
            className='main-image'
            src={item.imageUrl}
            mode='aspectFill'
          />
          {/* 状态标签 */}
          <View 
            className='status-badge'
            style={{ backgroundColor: getStatusDisplay(item.status).color }}
          >
            {getStatusDisplay(item.status).text}
          </View>
        </View>

        {/* 商品基本信息 */}
        <View className='info-section'>
          <View className='basic-info'>
            <Text className='item-name'>{item.name}</Text>
            <Text className='item-category'>{item.categoryName}</Text>
          </View>
          
          <Text className='item-description'>{item.description}</Text>
          
          {/* 价格信息 */}
          <View className='pricing-info'>
            <View className='price-item'>
              <Text className='price-label'>租金</Text>
              <Text className='price-value'>¥{item.rentalRate}/{getPeriodText(item.rentalPeriod)}</Text>
            </View>
            <View className='price-item'>
              <Text className='price-label'>押金</Text>
              <Text className='price-value'>¥{item.deposit}</Text>
            </View>
          </View>
        </View>

        {/* 商品特色 */}
        <View className='features-section'>
          <Text className='section-title'>商品特色</Text>
          <View className='features-list'>
            <View className='feature-item'>
              <Text className='feature-icon'>✅</Text>
              <Text className='feature-text'>专业品质，性能可靠</Text>
            </View>
            <View className='feature-item'>
              <Text className='feature-icon'>🚚</Text>
              <Text className='feature-text'>免费配送，上门服务</Text>
            </View>
            <View className='feature-item'>
              <Text className='feature-icon'>🛡️</Text>
              <Text className='feature-text'>保险保障，安心使用</Text>
            </View>
            <View className='feature-item'>
              <Text className='feature-icon'>📞</Text>
              <Text className='feature-text'>24小时客服支持</Text>
            </View>
          </View>
        </View>

        {/* 租赁须知 */}
        <View className='notice-section'>
          <Text className='section-title'>租赁须知</Text>
          <View className='notice-list'>
            <Text className='notice-item'>• 租赁前需支付押金，归还时退还</Text>
            <Text className='notice-item'>• 请妥善保管设备，如有损坏需承担维修费用</Text>
            <Text className='notice-item'>• 超时归还将按日收取额外费用</Text>
            <Text className='notice-item'>• 如需延期请提前联系客服</Text>
            <Text className='notice-item'>• 设备仅限本人使用，不得转租</Text>
          </View>
        </View>

        {/* 商品信息 */}
        <View className='details-section'>
          <Text className='section-title'>商品信息</Text>
          <View className='detail-item'>
            <Text className='detail-label'>商品编号</Text>
            <Text className='detail-value'>#{item.id.toString().padStart(6, '0')}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>上架时间</Text>
            <Text className='detail-value'>{formatDate(item.createdAt)}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>更新时间</Text>
            <Text className='detail-value'>{formatDate(item.updatedAt)}</Text>
          </View>
        </View>

        {/* 底部占位 */}
        <View className='bottom-placeholder' />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='bottom-actions'>
        <View className='action-buttons'>
          <Button 
            className='contact-btn'
            onClick={handleContactService}
          >
            联系客服
          </Button>
          <Button 
            className='share-btn'
            onClick={handleShare}
          >
            分享
          </Button>
          <Button 
            className='rent-btn'
            type="primary"
            disabled={item.status !== 'available'}
            onClick={handleRentNow}
          >
            {item.status === 'available' ? '立即租赁' : '暂不可租'}
          </Button>
        </View>
      </View>
    </View>
  )
}

export default RentalDetail 