import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Button, Dialog } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/auth'
import { secondhandApi, type SecondhandItem } from '../../services/secondhand'
import './index.less'

const statusMap = {
  available: { text: '在售', color: '#52c41a' },
  sold: { text: '已售出', color: '#ff4d4f' },
  reserved: { text: '已预订', color: '#faad14' }
} as const

const reviewStatusMap = {
  pending: { text: '审核中', color: '#faad14', icon: '⏳' },
  approved: { text: '已通过', color: '#52c41a', icon: '✅' },
  rejected: { text: '已拒绝', color: '#ff4d4f', icon: '❌' }
} as const

type ItemStatusKey = keyof typeof statusMap
type ReviewStatusKey = keyof typeof reviewStatusMap

const resolveStatusMeta = (status: string | undefined | null) => {
  if (!status) return statusMap.available
  return statusMap[status as ItemStatusKey] ?? statusMap.available
}

const resolveReviewStatusMeta = (status: string | undefined | null) => {
  if (!status) return undefined
  return reviewStatusMap[status as ReviewStatusKey] ?? reviewStatusMap.pending
}

const UserPosts: React.FC = () => {
  const { state } = useAuth()
  const { userInfo } = state

  const [items, setItems] = useState<SecondhandItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SecondhandItem | null>(null)

  const loadUserItems = async (showLoading = true) => {
    if (!userInfo?.openid) {
      return
    }

    try {
      if (showLoading) {
        setLoading(true)
      }

      const response = await secondhandApi.getUserItems(userInfo.openid)
      setItems(response || [])
    } catch (error) {
      console.error('加载用户商品失败:', error)
      Taro.showToast({ title: '加载失败，请稍后重试', icon: 'error', duration: 2000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserItems()
  }, [userInfo?.openid])

  const handleRefresh = async () => {
    await loadUserItems(false)
  }

  const handleItemClick = (item: SecondhandItem) => {
    if (item.reviewStatus === 'approved') {
      Taro.navigateTo({ url: `/pages/second-hand/detail/index?id=${item.id}` })
      return
    }

    if (item.reviewStatus === 'rejected') {
      Taro.showModal({
        title: '审核未通过',
        content: item.reviewReason || '该商品未通过审核',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    Taro.showToast({ title: '审核中，暂不可查看', icon: 'none' })
  }

  const handleEditItem = (item: SecondhandItem, e: any) => {
    e.stopPropagation()
    Taro.navigateTo({ url: `/pages/second-hand/publish/index?id=${item.id}&mode=edit` })
  }

  const handleDeleteConfirm = (item: SecondhandItem, e: any) => {
    e.stopPropagation()
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  const handleDeleteItem = async () => {
    if (!selectedItem || !userInfo?.openid) {
      setShowDeleteDialog(false)
      return
    }

    try {
      await secondhandApi.deleteUserItem(userInfo.openid, selectedItem.id)
      Taro.showToast({ title: '删除成功', icon: 'success' })
      await loadUserItems()
    } catch (error) {
      console.error('删除商品失败:', error)
      Taro.showToast({ title: '删除失败，请稍后重试', icon: 'error' })
    } finally {
      setShowDeleteDialog(false)
      setSelectedItem(null)
    }
  }

  const handlePublishNew = () => {
    Taro.navigateTo({ url: '/pages/second-hand/publish/index' })
  }

  const handleViewRejectionReason = (item: SecondhandItem, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '审核被拒绝',
      content: item.reviewReason || '暂无拒绝原因说明',
      showCancel: false,
      confirmText: '知道了'
    })
  }

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '刚刚'

    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    return date.toLocaleDateString()
  }

  const renderContent = () => {
    if (loading) {
      return (
        <View className='loading-container'>
          <Loading type='spinner' />
          <Text className='loading-text'>加载中...</Text>
        </View>
      )
    }

    if (items.length === 0) {
      return (
        <View className='empty-container'>
          <Empty description='您还没有发布任何商品' imageSize={120} />
          <Button className='empty-publish-button' type='primary' onClick={handlePublishNew}>
            🚀 立即发布
          </Button>
        </View>
      )
    }

    return (
      <View className='items-list'>
        {items.map(item => (
          <View key={item.id} className='item-card' onClick={() => handleItemClick(item)}>
            <View className='item-image-container'>
              <Image
                className='item-image'
                src={item.imageUrls && item.imageUrls.length > 0
                  ? item.imageUrls[0]
                  : (item.image && /^(https?:)?\/\//.test(item.image) ? item.image : '')}
                mode='aspectFill'
                lazyLoad
              />
              {(() => {
                const statusMeta = resolveStatusMeta(item.status)
                return (
                  <View
                    className={`status-badge ${item.status}`}
                    style={{ backgroundColor: statusMeta.color }}
                  >
                    {statusMeta.text}
                  </View>
                )
              })()}
              {item.reviewStatus && (
                (() => {
                  const reviewMeta = resolveReviewStatusMeta(item.reviewStatus)
                  if (!reviewMeta) return null
                  return (
                    <View
                      className={`review-status-badge ${item.reviewStatus}`}
                      style={{ backgroundColor: reviewMeta.color }}
                    >
                      {reviewMeta.icon} {reviewMeta.text}
                    </View>
                  )
                })()
              )}
              {item.imageUrls && item.imageUrls.length > 1 && (
                <View className='image-count-badge'>📷 {item.imageUrls.length}</View>
              )}
            </View>

            <View className='item-info'>
              <Text className='item-name'>{item.title}</Text>
              <Text className='item-description'>{item.description}</Text>
              {item.reviewStatus && (
                <View className='review-status-info'>
                  {(() => {
                    const reviewMeta = resolveReviewStatusMeta(item.reviewStatus)
                    if (!reviewMeta) return null
                    return (
                      <Text className='review-status-text'>
                        审核状态: {reviewMeta.icon} {reviewMeta.text}
                      </Text>
                    )
                  })()}
                  {item.reviewStatus === 'rejected' && item.reviewReason && (
                    <Text className='rejection-reason'>拒绝原因: {item.reviewReason}</Text>
                  )}
                </View>
              )}
              <View className='item-footer'>
                <Text className='item-price'>${item.price}</Text>
                <Text className='item-time'>{formatTime(item.createdAt)}</Text>
              </View>
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
    )
  }

  return (
    <View className='user-posts-container'>
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>我的发布</Text>
          <Text className='subtitle'>管理您发布的二手商品信息</Text>
        </View>
      </View>

      <PullToRefresh
        onRefresh={handleRefresh}
        pullingText='下拉刷新'
        canReleaseText='释放刷新'
        refreshingText='刷新中...'
        completeText='刷新完成'
      >
        <ScrollView className='content' scrollY>
          {renderContent()}
        </ScrollView>
      </PullToRefresh>

      <Dialog
        visible={showDeleteDialog}
        title='确认删除'
        content={`确定要删除商品"${selectedItem?.title}"吗？此操作不可撤销。`}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteItem}
      />
    </View>
  )
}

export default UserPosts
