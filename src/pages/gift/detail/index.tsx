import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Image } from '@tarojs/components';
import { Swiper, SwiperItem } from '@tarojs/components'; // Using standard component for consistency
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { peripheralsApi, PeripheralItem } from '../../../services/peripherals';
import './index.less';

const merchantWechatLabel = 'Brisbane10000';
const fallbackImage =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80';

const formatStock = (stock: number) => {
  if (stock > 100) return '库存充足';
  if (stock > 10) return `剩余${stock}件`;
  if (stock > 0) return `仅剩${stock}件`;
  return '暂时缺货';
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPrice = (price: number | string) => {
  const priceStr = typeof price === 'number' ? price.toString() : price;
  return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
};

const GiftDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  const [item, setItem] = useState<PeripheralItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const loadItemDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await peripheralsApi.getItemById(parseInt(id));
        setItem(response);
      } catch (error) {
        console.error('加载商品详情失败:', error);
        Taro.showToast({ title: '加载失败，请稍后重试', icon: 'none', duration: 1800 });
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    loadItemDetail();
  }, [id]);

  const images = useMemo(() => {
    if (!item) return [];
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls;
    }
    if (item.image) {
      return [item.image];
    }
    return [];
  }, [item]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [images]);

  const imageList = images.length > 0 ? images : [fallbackImage];

  const resolveShareId = (): string | undefined => {
    if (item?.id) return item.id.toString();
    if (id) {
      const parsed = Number(id);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed.toString();
      }
      return id;
    }
    return undefined;
  };

  useShareAppMessage(() => {
    const shareId = resolveShareId();
    const redirect = encodeURIComponent('/pages/gift/detail/index');
    const basePath = `/pages/loading/index?redirect=${redirect}`;
    const title = item?.name ? `${item.name} · 布玩好物铺` : '布玩好物精选';
    const imageUrl = imageList[0];

    return {
      title,
      path: `${basePath}${shareId ? `&id=${shareId}` : ''}`,
      imageUrl,
    };
  });

  useShareTimeline(() => {
    const shareId = resolveShareId();
    const redirect = encodeURIComponent('/pages/gift/detail/index');
    const title = item?.name ? `${item.name} · 布玩好物铺` : '布玩好物精选';
    const queryParts = [`redirect=${redirect}`];
    if (shareId) {
      queryParts.push(`id=${shareId}`);
    }

    return {
      title,
      query: queryParts.join('&'),
    };
  });

  const handleImagePreview = (index: number) => {
    Taro.previewImage({
      current: imageList[Math.max(0, Math.min(index, imageList.length - 1))],
      urls: imageList,
    });
  };

  const handleSwiperChange = (e: any) => {
    setActiveImageIndex(e.detail.current);
  };

  const handleContactMerchant = () => {
    Taro.setClipboardData({ data: merchantWechatLabel })
      .then(() => {
        Taro.showToast({ title: '微信号已复制', icon: 'success', duration: 1500 });
      })
      .catch(() => {
        Taro.showToast({ title: '复制失败，请稍后重试', icon: 'none', duration: 1500 });
      });
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true });
    Taro.showToast({ title: '分享面板已打开', icon: 'none', duration: 1500 });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (loading) {
    // Keep consistent container for loading
    return <View className="peripheral-detail-page"></View>;
  }

  if (!item) {
    // Basic Empty State
    return (
      <View className="peripheral-detail-page">
        <View className="detail-wrapper" style={{ paddingTop: '100rpx', textAlign: 'center' }}>
          <Text>未找到商品</Text>
        </View>
      </View>
    );
  }

  const stockSummary = formatStock(item.stock);
  const statusText = item.stock > 0 ? '现货发售' : '暂时缺货';
  const statusType = item.stock > 0 ? 'available' : 'soldout';
  const priceDisplay = formatPrice(item.price);

  const tags = (() => {
    const list = ['布玩好物'];
    if (item.categoryName) list.push(item.categoryName);
    list.push(stockSummary);
    return list;
  })();

  const specs = [
    { label: '商品编号', value: `NBF-${item.id.toString().padStart(4, '0')}` },
    { label: '商品分类', value: item.categoryName ?? '布玩好物' },
    {
      label: '上架时间',
      value: formatTime(item.dateCreated || item.createdAt || new Date().toISOString()),
    },
    { label: '当前库存', value: item.stock > 0 ? `${item.stock} 件` : '暂时缺货' },
  ];

  return (
    <ScrollView className="peripheral-detail-page" scrollY>
      {/* Immersive Image Carousel */}
      <View className="media-section">
        <Swiper
          className="media-section__swiper"
          circular
          autoplay={imageList.length > 1}
          onChange={handleSwiperChange}
        >
          {imageList.map((imageUrl, index) => (
            <SwiperItem key={`${imageUrl}-${index}`}>
              <Image
                className="media-section__image"
                src={imageUrl}
                mode="aspectFill"
                lazyLoad
                onClick={() => handleImagePreview(index)}
              />
            </SwiperItem>
          ))}
        </Swiper>
        <View className="media-section__counter">
          <Text>
            {activeImageIndex + 1} / {imageList.length}
          </Text>
        </View>
      </View>

      {/* Content Wrapper */}
      <View className="detail-wrapper">
        {/* Main Info Card */}
        <View className="info-card">
          <View className="info-card__header">
            <View className={`info-card__status info-card__status--${statusType}`}>
              <Text>{statusText}</Text>
            </View>
            <Text className="info-card__price">{priceDisplay}</Text>
          </View>

          <Text className="info-card__title">{item.name}</Text>

          <View className="info-card__chips">
            {tags.map((tag) => (
              <View className="info-card__chip" key={tag}>
                <Text>{tag}</Text>
              </View>
            ))}
          </View>

          <View className="info-card__meta">
            <Text>
              发布于 {formatTime(item.dateCreated || item.createdAt || new Date().toISOString())}
            </Text>
          </View>
        </View>

        {/* Specs */}
        <View className="spec-card">
          <Text className="section-title">商品信息</Text>
          <View className="spec-grid">
            {specs.map((spec) => (
              <View className="spec-item" key={spec.label}>
                <Text className="spec-item__label">{spec.label}</Text>
                <Text className="spec-item__value">{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        {item.description && (
          <View className="description-card">
            <Text className="section-title">商品描述</Text>
            <Text className="description-card__text">{item.description}</Text>
          </View>
        )}

        {/* Spacer for dock */}
        <View style={{ height: '40rpx' }}></View>
      </View>

      {/* Floating Action Dock */}
      <View className="floating-dock">
        <View className="dock-btn secondary" onClick={handleShare}>
          📤
        </View>
        <View className="dock-btn primary" onClick={handleContactMerchant}>
          联系商家 / 复制微信
        </View>
      </View>
    </ScrollView>
  );
};

export default GiftDetail;
