import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Toast } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import { peripheralsApi, PeripheralItem, PeripheralFilters } from '../../services/peripherals';
import PeripheralFiltersComponent from '../../components/PeripheralFilters';
import Pagination from '../../components/Pagination';
import './index.less';

const Gift: React.FC = () => {
  // State management
  const [items, setItems] = useState<PeripheralItem[]>([]);
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
  const [currentFilters, setCurrentFilters] = useState<PeripheralFilters>({
    page: 1,
    limit: 10,
    sortBy: 'dateCreated',
    sortOrder: 'desc',
  });

  // Load peripheral items
  const loadItems = async (showLoading = true, filters: PeripheralFilters = currentFilters) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await peripheralsApi.getAllItems(filters);
      setItems(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Failed to load peripheral items:', error);
      showToastMessage('加载商品失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (filters: PeripheralFilters) => {
    const newFilters = {
      ...filters,
      page: 1, // 重置到第一页
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

  // Handle product click
  const handleItemClick = (item: PeripheralItem) => {
    Taro.navigateTo({
      url: `/pages/gift/detail/index?id=${item.id}`,
    });
  };

  // Format time display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 1) return '刚刚';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  // 获取库存状态样式
  const getStockStatus = (stock: number) => {
    if (stock > 10) return 'sufficient';
    if (stock > 0) return 'low';
    return 'out';
  };

  const getStockLabel = (stock: number) => {
    if (stock > 10) return '充足';
    if (stock > 0) return `剩${stock}`;
    return '缺货';
  };

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  return (
    <ScrollView className="enhanced-peripheral-container" scrollY style={{ height: '100vh' }}>
      {/* Immersive Header */}
      <View className="enhanced-header">
        <View className="header-content">
          <View className="title-section">
            <Text className="enhanced-title">布玩好物铺</Text>
            <Text className="enhanced-subtitle">精选周边伴手礼</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View className="filter-wrapper">
        <PeripheralFiltersComponent
          onFiltersChange={handleFiltersChange}
          initialFilters={currentFilters}
        />
      </View>

      {/* Product List */}
      <View className="enhanced-content">
        {loading ? (
          <View className="enhanced-loading-container">
            <View className="loading-dots">
              <View className="dot dot-1"></View>
              <View className="dot dot-2"></View>
              <View className="dot dot-3"></View>
            </View>
            <Text className="loading-text">正在寻找好物...</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="enhanced-empty-container">
            <Text className="empty-icon">🛍️</Text>
            <Text className="empty-title">暂无精选好物</Text>
            <Text className="empty-subtitle">敬请期待更多布玩伴手礼</Text>
          </View>
        ) : (
          <View className="enhanced-items-grid">
            {items.map((item) => (
              <View
                key={item.id}
                className="enhanced-item-card"
                onClick={() => handleItemClick(item)}
                onTap={() => handleItemClick(item)}
              >
                {/* Image */}
                <View className="enhanced-item-image-container">
                  <View className="image-wrapper">
                    <Image
                      className="enhanced-item-image"
                      src={
                        item.imageUrls && item.imageUrls.length > 0
                          ? item.imageUrls[0]
                          : item.image ||
                            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'
                      }
                      mode="aspectFill"
                      lazyLoad
                    />
                    <View className="image-overlay"></View>
                  </View>
                  <View className={`stock-status-badge ${getStockStatus(item.stock)}`}>
                    {getStockLabel(item.stock)}
                  </View>
                </View>

                {/* Info */}
                <View className="enhanced-item-info">
                  <View className="info-header">
                    <Text className="enhanced-item-name">{item.name}</Text>
                  </View>

                  <View className="item-meta">
                    <Text className="meta-time">
                      {formatTime(item.dateCreated || item.createdAt || new Date().toISOString())}
                    </Text>
                    {item.categoryName && (
                      <Text className="meta-category">{item.categoryName}</Text>
                    )}
                  </View>

                  <View className="info-footer">
                    <Text className="enhanced-item-price">
                      ${typeof item.price === 'number' ? item.price : item.price}
                    </Text>
                    <View className="action-button">
                      <Text className="action-text">查看</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && pagination.totalPages > 1 && (
          <View className="enhanced-pagination-wrapper">
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

        <View style={{ height: '40rpx' }}></View>
      </View>

      {/* Toast */}
      <Toast
        content={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />
    </ScrollView>
  );
};

export default Gift;
