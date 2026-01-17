import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Loading, Empty, Button, Dialog, Rate } from '@nutui/nutui-react-taro';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import { secondhandApi, type SecondhandItem } from '../../services/secondhand';
import { restaurantApi, type UserRestaurantRating } from '../../services/restaurant';
import './index.less';

const statusMap = {
  available: { text: '在售', color: '#52c41a' },
  sold: { text: '已售出', color: '#ff4d4f' },
  reserved: { text: '已预订', color: '#faad14' },
} as const;

const reviewStatusMap = {
  pending: { text: '审核中', color: '#faad14', icon: '⏳' },
  approved: { text: '已通过', color: '#52c41a', icon: '✅' },
  rejected: { text: '已拒绝', color: '#ff4d4f', icon: '❌' },
} as const;

type ItemStatusKey = keyof typeof statusMap;
type ReviewStatusKey = keyof typeof reviewStatusMap;

const resolveStatusMeta = (status: string | undefined | null) => {
  if (!status) return statusMap.available;
  return statusMap[status as ItemStatusKey] ?? statusMap.available;
};

const resolveReviewStatusMeta = (status: string | undefined | null) => {
  if (!status) return undefined;
  return reviewStatusMap[status as ReviewStatusKey] ?? reviewStatusMap.pending;
};

const UserPosts: React.FC = () => {
  const { state } = useAuth();
  const { userInfo } = state;

  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<SecondhandItem[]>([]);
  const [restaurantRatings, setRestaurantRatings] = useState<UserRestaurantRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SecondhandItem | null>(null);

  const loadUserItems = async (showLoading = true) => {
    if (!userInfo?.openid) {
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await secondhandApi.getUserItems(userInfo.openid);
      setItems(response || []);
    } catch (error) {
      console.error('加载用户商品失败:', error);
      Taro.showToast({ title: '加载失败，请稍后重试', icon: 'error', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const loadUserRatings = async (showLoading = true) => {
    if (!userInfo?.openid) {
      return;
    }

    try {
      if (showLoading) {
        setRestaurantLoading(true);
      }

      const response = await restaurantApi.getUserRatings(userInfo.openid);
      setRestaurantRatings(response || []);
    } catch (error) {
      console.error('加载用户餐厅评分失败:', error);
      Taro.showToast({ title: '加载失败，请稍后重试', icon: 'error', duration: 2000 });
    } finally {
      setRestaurantLoading(false);
    }
  };

  useEffect(() => {
    loadUserItems();
    loadUserRatings();
  }, [userInfo?.openid]);

  const handleRefresh = async () => {
    if (activeTab === 0) {
      await loadUserItems();
    } else {
      await loadUserRatings();
    }
    Taro.stopPullDownRefresh();
  };

  usePullDownRefresh(() => {
    handleRefresh();
  });

  const handleTabChange = async (tabIndex: number) => {
    setActiveTab(tabIndex);
    // 切换 tab 时重新加载数据以确保数据是最新的
    if (tabIndex === 0) {
      await loadUserItems();
    } else {
      await loadUserRatings();
    }
  };

  const handleItemClick = (item: SecondhandItem) => {
    if (item.reviewStatus === 'approved') {
      Taro.navigateTo({ url: `/pages/second-hand/detail/index?id=${item.id}` });
      return;
    }

    if (item.reviewStatus === 'rejected') {
      Taro.showModal({
        title: '审核未通过',
        content: item.reviewReason || '该商品未通过审核',
        showCancel: false,
        confirmText: '知道了',
      });
      return;
    }

    Taro.showToast({ title: '审核中，暂不可查看', icon: 'none' });
  };

  const handleEditItem = (item: SecondhandItem, e: any) => {
    e.stopPropagation();
    Taro.navigateTo({ url: `/pages/second-hand/publish/index?id=${item.id}&mode=edit` });
  };

  const handleDeleteConfirm = (item: SecondhandItem, e: any) => {
    e.stopPropagation();
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem || !userInfo?.openid) {
      setShowDeleteDialog(false);
      return;
    }

    try {
      await secondhandApi.deleteUserItem(userInfo.openid, selectedItem.id);
      Taro.showToast({ title: '删除成功', icon: 'success' });
      await loadUserItems();
    } catch (error) {
      console.error('删除商品失败:', error);
      Taro.showToast({ title: '删除失败，请稍后重试', icon: 'error' });
    } finally {
      setShowDeleteDialog(false);
      setSelectedItem(null);
    }
  };

  const handlePublishNew = () => {
    Taro.navigateTo({ url: '/pages/second-hand/publish/index' });
  };

  const handleRestaurantRatingClick = (rating: UserRestaurantRating) => {
    Taro.navigateTo({ url: `/pages/restaurant/detail/index?id=${rating.restaurantId}` });
  };

  const handleViewRejectionReason = (item: SecondhandItem, e: any) => {
    e.stopPropagation();
    Taro.showModal({
      title: '审核被拒绝',
      content: item.reviewReason || '暂无拒绝原因说明',
      showCancel: false,
      confirmText: '知道了',
    });
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '刚刚';

    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString();
  };

  const renderLoading = () => {
    return (
      <View className="custom-loading-container">
        <Text className="loading-text">Rummaging...</Text>
        <View className="loading-bar-wrapper">
          <View className="loading-bar"></View>
        </View>
      </View>
    );
  };

  const renderEmptyState = (type: 'item' | 'rating') => {
    const isItem = type === 'item';
    const title = isItem ? '这里空空如也' : '暂无评分记录';
    const subtitle = isItem
      ? '您还没有发布任何闲置物品，快来分享吧！'
      : '您还没有对任何餐厅进行评价，去尝尝鲜？';
    const buttonText = isItem ? '🚀 立即发布' : '🍽️ 去探索美食';
    const icon = isItem ? '📦' : '🥗';

    return (
      <View className="custom-empty-state">
        <View className="empty-icon-wrapper">
          <Text className="empty-icon">{icon}</Text>
        </View>
        <Text className="empty-title">{title}</Text>
        <Text className="empty-subtitle">{subtitle}</Text>
        <Button
          className="empty-action-btn"
          onClick={
            isItem ? handlePublishNew : () => Taro.navigateTo({ url: '/pages/restaurant/index' })
          }
        >
          {buttonText}
        </Button>
      </View>
    );
  };

  const renderRestaurantRatings = () => {
    if (restaurantLoading) {
      return renderLoading();
    }

    if (restaurantRatings.length === 0) {
      return renderEmptyState('rating');
    }

    return (
      <View className="ratings-list">
        {restaurantRatings.map((rating) => {
          const hasImage = rating.restaurantImageUrls && rating.restaurantImageUrls.length > 0;
          const displayImage = hasImage
            ? rating.restaurantImageUrls[0]
            : rating.restaurantImage || '';

          return (
            <View
              key={rating.id}
              className="rating-card-v2"
              onClick={() => handleRestaurantRatingClick(rating)}
            >
              <View className="card-image-section">
                {displayImage ? (
                  <Image className="rating-image" src={displayImage} mode="aspectFill" lazyLoad />
                ) : (
                  <View className="rating-image-placeholder">
                    <Text className="placeholder-icon">🍽️</Text>
                  </View>
                )}
                <View className="overall-badge">
                  <Text className="badge-star">⭐</Text>
                  <Text className="badge-score">{rating.overallRating}</Text>
                </View>
              </View>

              <View className="card-content-section">
                <View className="id-row">
                  <Text className="restaurant-name">{rating.restaurantName}</Text>
                  <Text className="submit-date">{formatTime(rating.createdAt)}</Text>
                </View>

                <View className="ratings-grid">
                  <View className="mini-rating-item">
                    <Text className="label">口味</Text>
                    <Text className="value">{rating.tasteRating}</Text>
                  </View>
                  <View className="mini-rating-item">
                    <Text className="label">环境</Text>
                    <Text className="value">{rating.environmentRating}</Text>
                  </View>
                  <View className="mini-rating-item">
                    <Text className="label">服务</Text>
                    <Text className="value">{rating.serviceRating}</Text>
                  </View>
                  <View className="mini-rating-item">
                    <Text className="label">价格</Text>
                    <Text className="value">{rating.priceRating}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSecondhandContent = () => {
    if (loading) {
      return renderLoading();
    }

    if (items.length === 0) {
      return renderEmptyState('item');
    }

    return (
      <View className="items-list">
        {items.map((item) => (
          <View key={item.id} className="item-card" onClick={() => handleItemClick(item)}>
            <View className="item-image-container">
              {(() => {
                const imageSrc =
                  item.imageUrls && item.imageUrls.length > 0
                    ? item.imageUrls[0]
                    : item.image && /^(https?:)?\/\//.test(item.image)
                      ? item.image
                      : '';

                if (!imageSrc) {
                  return (
                    <View className="item-image-placeholder">
                      <Text className="placeholder-icon">📦</Text>
                    </View>
                  );
                }

                return <Image className="item-image" src={imageSrc} mode="aspectFill" lazyLoad />;
              })()}

              {/* Status Badge on Image - Cleaner Look */}
              {(() => {
                const statusMeta = resolveStatusMeta(item.status);
                return (
                  <View className={`status-badge-overlay ${item.status || 'available'}`}>
                    {statusMeta.text}
                  </View>
                );
              })()}

              {/* Review Status Badge on Image (only if not approved) */}
              {item.reviewStatus &&
                item.reviewStatus !== 'approved' &&
                (() => {
                  const reviewMeta = resolveReviewStatusMeta(item.reviewStatus);
                  if (!reviewMeta) return null;
                  return (
                    <View className={`review-badge-overlay ${item.reviewStatus}`}>
                      {reviewMeta.icon} {reviewMeta.text}
                    </View>
                  );
                })()}

              {item.imageUrls && item.imageUrls.length > 1 && (
                <View className="image-count-badge">📷 {item.imageUrls.length}</View>
              )}
            </View>

            <View className="item-info">
              <View className="item-header">
                <Text className="item-name">{item.title}</Text>
                <Text className="item-price">${item.price}</Text>
              </View>

              <Text className="item-description">{item.description}</Text>

              <View className="item-meta-row">
                <Text className="meta-text">发布于 {formatTime(item.createdAt)}</Text>
                <Text className="meta-divider">·</Text>
              </View>

              {item.reviewStatus === 'rejected' && item.reviewReason && (
                <View className="review-alert">
                  <Text className="review-alert-title">⚠️ 审核未通过</Text>
                  <Text className="review-alert-text">{item.reviewReason}</Text>
                </View>
              )}

              <View className="item-actions">
                {item.reviewStatus === 'rejected' && (
                  <Button
                    className="action-button reason-button"
                    size="small"
                    onClick={(e) => handleViewRejectionReason(item, e)}
                  >
                    查看原因
                  </Button>
                )}
                <Button
                  className="action-button edit-button"
                  size="small"
                  onClick={(e) => handleEditItem(item, e)}
                >
                  编辑
                </Button>
                <Button
                  className="action-button delete-button"
                  size="small"
                  onClick={(e) => handleDeleteConfirm(item, e)}
                >
                  删除
                </Button>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="user-posts-container">
      <View className="enhanced-header">
        <View className="header-content">
          <Text className="header-title">我的发布</Text>
          <Text className="header-subtitle">管理您发布的闲置好物和餐厅点评</Text>
        </View>
      </View>

      <View className="tabs">
        <View
          className={`tab ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => handleTabChange(0)}
        >
          <Text className="tab-text">布村换换乐</Text>
        </View>
        <View
          className={`tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => handleTabChange(1)}
        >
          <Text className="tab-text">布村好吃榜</Text>
        </View>
      </View>

      <ScrollView className="content" scrollY>
        {activeTab === 0 ? renderSecondhandContent() : renderRestaurantRatings()}
      </ScrollView>

      <Dialog
        visible={showDeleteDialog}
        title="确认删除"
        content={`确定要删除商品"${selectedItem?.title}"吗？此操作不可撤销。`}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteItem}
      />
    </View>
  );
};

export default UserPosts;
