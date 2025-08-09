import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Button, Dialog } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/auth'
import { secondhandApi, SecondhandItem } from '../../services/secondhand'
import './index.less'

// 状态映射
const statusMap = {
  'available': { text: '在售', color: '#52c41a' },
  'sold': { text: '已售出', color: '#ff4d4f' },
  'reserved': { text: '已预订', color: '#faad14' }
}

// 审核状态映射
const reviewStatusMap = {
  'pending': { text: '审核中', color: '#faad14', icon: '⏳' },
  'approved': { text: '已通过', color: '#52c41a', icon: '✅' },
  'rejected': { text: '已拒绝', color: '#ff4d4f', icon: '❌' }
}

const UserPosts: React.FC = () => {
  const { state } = useAuth()
  const { userInfo } = state
  
  // 状态管理
  const [items, setItems] = useState<SecondhandItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SecondhandItem | null>(null)

  // 加载用户发布的商品
  const loadUserItems = async (showLoading = true) => {
    if (!userInfo?.openid) {
      console.log('用户未登录')
      return
    }

    try {
      if (showLoading) {
        setLoading(true)
      }
      
      // 使用 openid 作为 userId
      const response = await secondhandApi.getUserItems(userInfo.openid)
      setItems(response || [])
    } catch (error) {
      console.error('加载用户商品失败:', error)
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
    await loadUserItems(false)
  }

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days < 30) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString()
    }
  }

  // 商品点击事件
  const handleItemClick = (item: SecondhandItem) => {
    Taro.navigateTo({
      url: `/pages/second-hand/detail/index?id=${item.id}`
    })
  }

  // 编辑商品
  const handleEditItem = (item: SecondhandItem, e: any) => {
    e.stopPropagation()
    Taro.navigateTo({
      url: `/pages/second-hand/publish/index?id=${item.id}&mode=edit`
    })
  }

  // 删除商品确认
  const handleDeleteConfirm = (item: SecondhandItem, e: any) => {
    e.stopPropagation()
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  // 删除商品
  const handleDeleteItem = async () => {
    if (!selectedItem) return

    try {
      await secondhandApi.deleteItem(selectedItem.id)
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      })
      // 重新加载列表
      await loadUserItems()
    } catch (error) {
      console.error('删除商品失败:', error)
      Taro.showToast({
        title: '删除失败，请稍后重试',
        icon: 'error'
      })
    } finally {
      setShowDeleteDialog(false)
      setSelectedItem(null)
    }
  }

  // 发布新商品
  const handlePublishNew = () => {
    Taro.navigateTo({
      url: '/pages/second-hand/publish/index'
    })
  }

  // 查看被拒绝原因
  const handleViewRejectionReason = (item: SecondhandItem, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '审核被拒绝',
      content: item.rejectionReason || '暂无拒绝原因说明',
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadUserItems()
  }, [userInfo])

  return (
    <View className='user-posts-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>我的发布</Text>
          <Text className='subtitle'>管理您发布的二手商品</Text>
        </View>
      </View>

      {/* 发布按钮 */}
      <View className='publish-section'>
        <Button
          className='publish-button'
          type='primary'
          onClick={handlePublishNew}
        >
          📝 发布新商品
        </Button>
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
            <View className='empty-container'>
              <Empty 
                description="您还没有发布任何商品"
                imageSize={120}
              />
              <Button
                className='empty-publish-button'
                type='primary'
                onClick={handlePublishNew}
              >
                🚀 立即发布
              </Button>
            </View>
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
                      src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : (item.image && /^(https?:)?\/\//.test(item.image) ? item.image : '')}
                      mode='aspectFill'
                      lazyLoad
                    />
                    {/* 商品状态标签 */}
                    <View
                      className={`status-badge ${item.status}`}
                      style={{ backgroundColor: statusMap[item.status].color }}
                    >
                      {statusMap[item.status].text}
                    </View>
                    {/* 审核状态标签 */}
                    {item.reviewStatus && (
                      <View
                        className={`review-status-badge ${item.reviewStatus}`}
                        style={{ backgroundColor: reviewStatusMap[item.reviewStatus].color }}
                      >
                        {reviewStatusMap[item.reviewStatus].icon} {reviewStatusMap[item.reviewStatus].text}
                      </View>
                    )}
                    {/* 多图片指示器 */}
                    {item.imageUrls && item.imageUrls.length > 1 && (
                      <View className='image-count-badge'>
                        📷 {item.imageUrls.length}
                      </View>
                    )}
                  </View>

                  {/* 商品信息 */}
                  <View className='item-info'>
                    <Text className='item-name'>{item.title}</Text>
                    <Text className='item-description'>{item.description}</Text>

                    {/* 审核状态信息 */}
                    {item.reviewStatus && (
                      <View className='review-status-info'>
                        <Text className='review-status-text'>
                          审核状态: {reviewStatusMap[item.reviewStatus].icon} {reviewStatusMap[item.reviewStatus].text}
                        </Text>
                        {item.reviewStatus === 'rejected' && item.rejectionReason && (
                          <Text className='rejection-reason'>
                            拒绝原因: {item.rejectionReason}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* 价格和时间 */}
                    <View className='item-footer'>
                      <Text className='item-price'>${item.price}</Text>
                      <Text className='item-time'>{formatTime(item.createdAt)}</Text>
                    </View>

                    {/* 操作按钮 */}
                    <View className='item-actions'>
                      {item.reviewStatus === 'rejected' && (
                        <Button
                          className='action-button reason-button'
                          size='small'
                          onClick={(e) => handleViewRejectionReason(item, e)}
                        >
                          📋 查看原因
                        </Button>
                      )}
                      <Button
                        className='action-button edit-button'
                        size='small'
                        onClick={(e) => handleEditItem(item, e)}
                      >
                        ✏️ 编辑
                      </Button>
                      <Button
                        className='action-button delete-button'
                        size='small'
                        onClick={(e) => handleDeleteConfirm(item, e)}
                      >
                        🗑️ 删除
                      </Button>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </PullToRefresh>

      {/* 删除确认对话框 */}
      <Dialog
        visible={showDeleteDialog}
        title="确认删除"
        content={`确定要删除商品"${selectedItem?.title}"吗？此操作不可撤销。`}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteItem}
      />
    </View>
  )
}

export default UserPosts
