import React, { useState, useEffect } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { rentalApi, RentalItem } from '../../../services/rental';
import './index.less';

const RentalDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  const [item, setItem] = useState<RentalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchItemDetail(parseInt(id));
    }
  }, [id]);

  const fetchItemDetail = async (itemId: number) => {
    try {
      setLoading(true);
      const data = await rentalApi.getItemById(itemId);
      setItem(data);
    } catch (error) {
      console.error('Failed to fetch detail:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContact = () => {
    if (item?.contact_info) {
      Taro.setClipboardData({
        data: item.contact_info,
        success: () => Taro.showToast({ title: '已复制联系方式', icon: 'success' }),
      });
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleImagePreview = (index: number) => {
    if (!images.length) return;
    const safeIndex = Math.max(0, Math.min(index, images.length - 1));
    Taro.previewImage({
      current: images[safeIndex],
      urls: images,
    });
  };

  if (loading)
    return (
      <View className="rental-detail-container loading-state">
        {/* Simple loader placeholder */}
      </View>
    );

  if (!item)
    return (
      <View className="rental-detail-container empty-state">
        <Text>未找到物品</Text>
      </View>
    );

  const images =
    item.imageUrls?.length > 0
      ? item.imageUrls
      : item.images?.length && item.images.length > 0
        ? item.images
        : [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
          ];

  return (
    <View className="rental-detail-container">
      {/* Immersive Image Carousel */}
      <View className="image-carousel">
        <Swiper
          className="swiper-container"
          circular
          autoplay
          onChange={(e) => setCurrentImage(e.detail.current)}
        >
          {images.map((img, idx) => (
            <SwiperItem key={idx}>
              <Image
                src={img}
                className="swiper-item-img"
                mode="aspectFit"
                onClick={() => handleImagePreview(idx)}
              />
            </SwiperItem>
          ))}
        </Swiper>
        <View className="carousel-indicator">
          {currentImage + 1} / {images.length}
        </View>
      </View>

      {/* Content Body with Glass Cards */}
      <View className="content-body">
        {/* Main Head Card */}
        <View className="head-card">
          <Text className="title">{item.title}</Text>
          <View className="price-row">
            <View className="price-block">
              <Text className="currency">$</Text>
              <Text className="amount">{item.price}</Text>
              <Text className="unit">
                / {item.period === 'day' ? '天' : item.period === 'week' ? '周' : '月'}
              </Text>
            </View>
            <View className={`status-badge ${item.status}`}>
              {item.status === 'available' ? '待租' : '已租'}
            </View>
          </View>
        </View>

        {/* Features Tag Cloud */}
        {item.features && item.features.length > 0 && (
          <View className="info-card">
            <Text className="section-title">特点</Text>
            <View className="features-grid">
              {item.features.map((feat, idx) => (
                <View key={idx} className="feature-tag">
                  {feat}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View className="info-card">
          <Text className="section-title">租赁详情</Text>
          <Text className="desc-text">{item.description || '暂无详细描述'}</Text>
        </View>

        {/* Contact Info */}
        <View className="info-card">
          <Text className="section-title">联系方式</Text>
          <View className="contact-block">
            <View className="contact-icon">💬</View>
            <View className="contact-details">
              <Text className="label">微信号 / 电话</Text>
              <Text className="value">{item.contact_info}</Text>
            </View>
            {/* Optional inline copy button if preferred, but dock handles primary action */}
          </View>
        </View>
      </View>

      {/* Floating Glass Dock */}
      <View className="floating-dock">
        <View className="dock-btn secondary" onClick={handleBack}>
          ↩
        </View>
        <View className="dock-btn primary" onClick={handleCopyContact}>
          立即联系 / 复制微信
        </View>
      </View>
    </View>
  );
};

export default RentalDetail;
