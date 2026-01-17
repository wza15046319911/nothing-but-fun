import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Toast } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import { secondhandApi, SecondhandItem, SecondhandFilters } from '../../services/secondhand';
import { useAuth } from '../../context/auth';
import SecondhandFiltersComponent from '../../components/SecondhandFilters';
import Pagination from '../../components/Pagination';
import './index.less';

const SecondHand: React.FC = () => {
  // Auth context
  const { state: authState } = useAuth();
  const { isLoggedIn } = authState;

  // State management
  const [items, setItems] = useState<SecondhandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // State for filters
  const [currentFilters, setCurrentFilters] = useState<SecondhandFilters>({
    page: 1,
    limit: 10,
    sortBy: 'dateCreated',
    sortOrder: 'desc',
  });

  // Load secondhand items
  const loadItems = async (showLoading = true, filters: SecondhandFilters = currentFilters) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await secondhandApi.getAllItems(filters);
      setItems(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Failed to load secondhand items:', error);
      showToastMessage('加载商品失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (filters: SecondhandFilters) => {
    const newFilters = {
      ...filters,
      page: 1,
      limit: 10,
    };

    if (!newFilters.sortBy) {
      newFilters.sortBy = 'dateCreated';
    }

    if (!newFilters.sortOrder) {
      newFilters.sortOrder = 'desc';
    }
    setCurrentFilters(newFilters);
    loadItems(true, newFilters);
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    const newFilters = {
      ...currentFilters,
      page,
    };
    setCurrentFilters(newFilters);
    loadItems(true, newFilters);
  };

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Handle post new item
  const handlePostNew = () => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再发布商品',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/user-login/index' });
          }
        },
      });
      return;
    }

    Taro.navigateTo({
      url: '/pages/second-hand/publish/index',
    });
  };

  // Handle product click
  const handleProductClick = (item: SecondhandItem) => {
    Taro.navigateTo({
      url: `/pages/second-hand/detail/index?id=${item.id}`,
    });
  };

  // Format time display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  return (
    <View className="premium-container">
      {/* Header */}
      <View className="premium-header">
        <View className="header-top">
          <Text className="main-title">布村换换乐</Text>
          <View className="sub-title">让闲置游起来</View>
        </View>

        <View className="info-card">
          <Text className="info-text">支持租房、拼车、闲置交易及车辆买卖信息发布</Text>
          <View
            className="wechat-copy-btn"
            onClick={() => {
              Taro.setClipboardData({
                data: 'Brisbane10000',
                success: () =>
                  Taro.showToast({
                    title: '已复制微信号',
                    icon: 'success',
                  }),
              });
            }}
          >
            <Text className="btn-text">找客服</Text>
          </View>
        </View>
      </View>

      <SecondhandFiltersComponent
        onFiltersChange={handleFiltersChange}
        initialFilters={currentFilters}
      />

      <ScrollView className="content-scroll" scrollY>
        {loading ? (
          <View style={{ padding: '40rpx', textAlign: 'center', color: '#666' }}>
            <Text>正在加载好物...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={{ padding: '100rpx', textAlign: 'center', color: '#999' }}>
            <Text style={{ fontSize: '60rpx', display: 'block', marginBottom: '20rpx' }}>🛍️</Text>
            <Text>暂无商品，快来发布吧</Text>
          </View>
        ) : (
          <View className="items-masonry">
            {items.map((item, index) => (
              <View
                key={item.id}
                className="glass-card"
                onClick={() => handleProductClick(item)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <View className="card-image-wrapper">
                  <Image
                    className="card-image"
                    src={
                      item.imageUrls && item.imageUrls.length > 0
                        ? item.imageUrls[0]
                        : item.image && /^(https?:)?\/\//.test(item.image)
                          ? item.image
                          : 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'
                    }
                    mode="aspectFill"
                    lazyLoad
                  />
                  {/* Status Badge */}
                  {item.status && item.status !== 'available' && (
                    <View className={`status-tag ${item.status === 'sold' ? 'status-sold' : ''}`}>
                      <Text>{item.status === 'sold' ? '已售出' : item.status}</Text>
                    </View>
                  )}

                  <View className="time-tag">
                    {formatTime(item.dateCreated || item.createdAt || '')}
                  </View>
                </View>

                <View className="card-content">
                  <Text className="item-title">{item.title}</Text>
                  <View className="item-footer">
                    <View className="price-wrapper">
                      <Text className="currency">$</Text>
                      <Text className="amount">
                        {typeof item.price === 'number' ? item.price : item.price}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pagination Logic Reuse */}
        {!loading && items.length > 0 && pagination.totalPages > 1 && (
          <View style={{ padding: '20rpx 0' }}>
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

        {!loading && items.length > 0 && pagination.totalPages <= 1 && (
          <View style={{ textAlign: 'center', padding: '40rpx', color: '#999', fontSize: '24rpx' }}>
            - 都在这里了 -
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <View className="fab-publish" onClick={handlePostNew}>
        <Text className="fab-icon">+</Text>
      </View>

      <Toast
        content={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />
    </View>
  );
};

export default SecondHand;
