import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Button, Dialog, Rate } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/auth'
import { secondhandApi, type SecondhandItem } from '../../services/secondhand'
import { restaurantApi, type UserRestaurantRating } from '../../services/restaurant'
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

  const [activeTab, setActiveTab] = useState(0)
  const [items, setItems] = useState<SecondhandItem[]>([])
  const [restaurantRatings, setRestaurantRatings] = useState<UserRestaurantRating[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurantLoading, setRestaurantLoading] = useState(true)
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

  const loadUserRatings = async (showLoading = true) => {
    if (!userInfo?.openid) {
      return
    }

    try {
      if (showLoading) {
        setRestaurantLoading(true)
      }

      const response = await restaurantApi.getUserRatings(userInfo.openid)
      setRestaurantRatings(response || [])
    } catch (error) {
      console.error('加载用户餐厅评分失败:', error)
      Taro.showToast({ title: '加载失败，请稍后重试', icon: 'error', duration: 2000 })
    } finally {
      setRestaurantLoading(false)
    }
  }

  useEffect(() => {
    loadUserItems()
    loadUserRatings()
  }, [userInfo?.openid])

  const handleRefresh = async () => {
    if (activeTab === 0) {
      await loadUserItems()
    } else {
      await loadUserRatings()
    }
  }

  const handleTabChange = async (tabIndex: number) => {
    setActiveTab(tabIndex)
    // 切换 tab 时重新加载数据以确保数据是最新的
    if (tabIndex === 0) {
      await loadUserItems()
    } else {
      await loadUserRatings()
    }
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

  const handleRestaurantRatingClick = (rating: UserRestaurantRating) => {
    Taro.navigateTo({ url: `/pages/restaurant/detail/index?id=${rating.restaurantId}` })
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

  const renderRestaurantRatings = () => {
    if (restaurantLoading) {
      return (
        <View className='loading-container'>
          <Loading type='spinner' />
          <Text className='loading-text'>加载中...</Text>
        </View>
      )
    }

    if (restaurantRatings.length === 0) {
      return (
        <View className='empty-container'>
          <Empty description='您还没有对任何餐厅进行评分' imageSize={120} />
          <Button className='empty-publish-button' type='primary' onClick={() => Taro.navigateTo({ url: '/pages/restaurant/index' })}>
            🍽️ 去餐厅页面
          </Button>
        </View>
      )
    }

    return (
      <View className='ratings-list'>
        {restaurantRatings.map(rating => (
          <View key={rating.id} className='rating-card' onClick={() => handleRestaurantRatingClick(rating)}>
            <View className='rating-image-container'>
              <Image
                className='rating-image'
                src={rating.restaurantImageUrls && rating.restaurantImageUrls.length > 0
                  ? rating.restaurantImageUrls[0]
                  : (rating.restaurantImage || '')}
                mode='aspectFill'
                lazyLoad
              />
              <View className='overall-rating-badge'>
                ⭐ {rating.overallRating}
              </View>
            </View>
            <View className='rating-info'>
              <Text className='restaurant-name'>{rating.restaurantName}</Text>
              <View className='rating-details'>
                <View className='rating-item'>
                  <Text className='rating-label'>口味:</Text>
                  <Rate value={rating.tasteRating} readOnly />
                  <Text className='rating-value'>{rating.tasteRating}</Text>
                </View>
                <View className='rating-item'>
                  <Text className='rating-label'>环境:</Text>
                  <Rate value={rating.environmentRating} readOnly />
                  <Text className='rating-value'>{rating.environmentRating}</Text>
                </View>
                <View className='rating-item'>
                  <Text className='rating-label'>服务:</Text>
                  <Rate value={rating.serviceRating} readOnly />
                  <Text className='rating-value'>{rating.serviceRating}</Text>
                </View>
                <View className='rating-item'>
                  <Text className='rating-label'>价格:</Text>
                  <Rate value={rating.priceRating} readOnly />
                  <Text className='rating-value'>{rating.priceRating}</Text>
                </View>
              </View>
              <Text className='rating-time'>{formatTime(rating.createdAt)}</Text>
            </View>
          </View>
        ))}
      </View>
    )
  }

  const renderSecondhandContent = () => {
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
          <Text className='subtitle'>管理您发布的闲置好物和餐厅点评</Text>
        </View>
      </View>

      <View className='tabs'>
        <View
          className={`tab ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => handleTabChange(0)}
        >
          布村换换乐
        </View>
        <View
          className={`tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => handleTabChange(1)}
        >
          布村好吃榜
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
          {activeTab === 0 ? renderSecondhandContent() : renderRestaurantRatings()}
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
