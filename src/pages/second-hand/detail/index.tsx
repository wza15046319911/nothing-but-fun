import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Button, Toast, ActionSheet, Dialog } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { secondhandApi, SecondhandItem } from '../../../services/secondhand'
import './index.less'

// Status display mapping
const statusMap = {
  'available': { text: '可购买', color: '#52c41a' },
  'sold': { text: '已售出', color: '#ff4d4f' },
  'reserved': { text: '已预订', color: '#faad14' }
}

const SecondHandDetail: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  
  // State management
  const [item, setItem] = useState<SecondhandItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Load item details
  const loadItemDetail = async () => {
    if (!id) {
      Taro.showToast({
        title: '商品ID不存在',
        icon: 'none'
      })
      Taro.navigateBack()
      return
    }

    try {
      setLoading(true)
      const response = await secondhandApi.getItemById(parseInt(id))
      setItem(response)
    } catch (error) {
      console.error('Failed to load item detail:', error)
      showToastMessage('加载商品详情失败')
    } finally {
      setLoading(false)
    }
  }

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // Handle contact seller
  const handleContactSeller = () => {
    if (!item) return
    
    Taro.showModal({
      title: '联系卖家',
      content: `卖家ID: ${item.sellerId}\n\n请通过平台内消息或其他方式联系卖家`,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // Handle buy now
  const handleBuyNow = () => {
    if (!item) return
    
    if (item.status !== 'available') {
      showToastMessage('商品当前不可购买')
      return
    }

    Taro.showModal({
      title: '确认购买',
      content: `确认购买 "${item.title}" 吗？\n价格: ¥${item.price}`,
      success: async (res) => {
        if (res.confirm) {
          try {
            // Update item status to reserved
            await secondhandApi.updateItem(item.id, { status: 'reserved' })
            showToastMessage('购买成功！请联系卖家确认交易详情')
            // Reload item details
            loadItemDetail()
          } catch (error) {
            console.error('Purchase failed:', error)
            showToastMessage('购买失败，请稍后重试')
          }
        }
      }
    })
  }

  // Handle more actions
  const handleMoreActions = () => {
    setShowActionSheet(true)
  }

  // Handle report
  const handleReport = () => {
    setShowActionSheet(false)
    Taro.showToast({
      title: '举报功能开发中',
      icon: 'none'
    })
  }

  // Handle delete (only for item owner)
  const handleDelete = () => {
    setShowActionSheet(false)
    setShowDeleteDialog(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!item) return
    
    try {
      await secondhandApi.deleteItem(item.id)
      showToastMessage('删除成功')
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Delete failed:', error)
      showToastMessage('删除失败，请稍后重试')
    }
    setShowDeleteDialog(false)
  }

  // Format time display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if current user is the seller
  const isOwner = () => {
    const userInfo = Taro.getStorageSync('userInfo')
    return userInfo && item && userInfo.id === item.sellerId
  }

  useEffect(() => {
    loadItemDetail()
  }, [id])

  if (loading) {
    return (
      <View className='detail-container'>
        <View className='loading-container'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!item) {
    return (
      <View className='detail-container'>
        <View className='error-container'>
          <Text>商品不存在</Text>
          <Button size='small' onClick={() => Taro.navigateBack()}>
            返回
          </Button>
        </View>
      </View>
    )
  }

  const actionSheetOptions = isOwner() 
    ? [
        { name: '删除商品', value: 'delete' },
        { name: '取消', value: 'cancel' }
      ]
    : [
        { name: '举报商品', value: 'report' },
        { name: '取消', value: 'cancel' }
      ]

  return (
    <ScrollView className='detail-container' scrollY>
      {/* Product Image */}
      <View className='image-section'>
        <Image
          className='product-image'
          src={item.image}
          mode='aspectFill'
          onError={() => console.log('Image load failed')}
        />
        <View 
          className='status-badge'
          style={{ backgroundColor: statusMap[item.status].color }}
        >
          {statusMap[item.status].text}
        </View>
      </View>

      {/* Product Info */}
      <View className='info-section'>
        <View className='title-row'>
          <Text className='product-title'>{item.title}</Text>
          <View className='more-button' onClick={handleMoreActions}>
            ⋯
          </View>
        </View>
        
        <View className='price-row'>
          <Text className='product-price'>¥{item.price}</Text>
        </View>

        <View className='description-section'>
          <Text className='section-title'>商品描述</Text>
          <Text className='product-description'>{item.description}</Text>
        </View>

        <View className='meta-section'>
          <View className='meta-item'>
            <Text className='meta-label'>发布时间:</Text>
            <Text className='meta-value'>{formatTime(item.createdAt)}</Text>
          </View>
          <View className='meta-item'>
            <Text className='meta-label'>更新时间:</Text>
            <Text className='meta-value'>{formatTime(item.updatedAt)}</Text>
          </View>
          <View className='meta-item'>
            <Text className='meta-label'>卖家ID:</Text>
            <Text className='meta-value'>{item.sellerId}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {!isOwner() && (
        <View className='action-section'>
          <Button
            className='contact-button'
            onClick={handleContactSeller}
          >
            联系卖家
          </Button>
          <Button
            type='primary'
            className='buy-button'
            onClick={handleBuyNow}
            disabled={item.status !== 'available'}
          >
            {item.status === 'available' ? '立即购买' : '不可购买'}
          </Button>
        </View>
      )}

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        options={actionSheetOptions}
        onSelect={(item) => {
          if (item.value === 'delete') {
            handleDelete()
          } else if (item.value === 'report') {
            handleReport()
          } else {
            setShowActionSheet(false)
          }
        }}
        onCancel={() => setShowActionSheet(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={showDeleteDialog}
        title="确认删除"
        content="确定要删除这个商品吗？删除后无法恢复。"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Toast */}
      <Toast
        msg={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />
    </ScrollView>
  )
}

export default SecondHandDetail 