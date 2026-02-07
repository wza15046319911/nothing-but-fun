import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Swiper } from '@taroify/core';
import { Popup, Rate, Button as NutButton } from '@nutui/nutui-react-taro';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import { restaurantApi, Restaurant } from '../../../services/restaurant';
import { useRestaurantTypes } from '../../../hooks/useTypes';
import { useAuth } from '../../../context/auth';
import '@taroify/core/swiper/style';
import './index.less';

const RestaurantDetail: React.FC = () => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { getPriceRangeName } = useRestaurantTypes();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [restaurantId, setRestaurantId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Review Sheet State
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    overall: 5,
    taste: 5,
    service: 5,
    environment: 5,
    price: 5,
    content: '',
  });

  // Load Detail
  const loadRestaurantDetail = async (id: number) => {
    try {
      setLoading(true);
      const data = await restaurantApi.getRestaurantById(id);
      setRestaurant(data);
    } catch (error) {
      console.error(error);
      // Taro.showToast({ title: 'Unable to load details', icon: 'none' })
      // Toast might be missed during page transition, UI feedback is better
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramsId = router.params.id || Taro.getCurrentInstance().router?.params.id;
    if (paramsId) {
      const id = parseInt(paramsId);
      setRestaurantId(id);
    } else {
      // Handle missing ID
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (restaurantId > 0) {
      loadRestaurantDetail(restaurantId);
    }
  }, [restaurantId]);

  const getAllImages = () => {
    if (!restaurant) return [];
    if (restaurant.imageUrls && restaurant.imageUrls.length > 0) return restaurant.imageUrls;
    return restaurant.image ? [restaurant.image] : [];
  };

  const getPriceDisplay = () => {
    if (!restaurant) return 'Price on request';
    if (restaurant.pricingDetails) return restaurant.pricingDetails;
    const hasFrom = restaurant.priceFrom !== undefined && restaurant.priceFrom !== null;
    const hasTo = restaurant.priceTo !== undefined && restaurant.priceTo !== null;
    if (hasFrom && hasTo) {
      if (restaurant.priceFrom === restaurant.priceTo) return `$${restaurant.priceFrom}`;
      return `$${restaurant.priceFrom} - $${restaurant.priceTo}`;
    }
    if (hasFrom) return `$${restaurant.priceFrom}+`;
    if (hasTo) return `Up to $${restaurant.priceTo}`;
    if (restaurant.priceRangeRid) return getPriceRangeName(restaurant.priceRangeRid);
    return 'Price on request';
  };

  const getSuburbDisplay = () => {
    if (!restaurant) return '';
    const suburb = (restaurant.suburb || '').trim();
    if (suburb) return suburb;
    return restaurant.state || restaurant.postcode || '';
  };

  const handlePreview = (index: number) => {
    const images = getAllImages();
    Taro.previewImage({
      current: images[index],
      urls: images,
    });
  };

  const handleReviewSubmit = async () => {
    // 检查用户是否登录
    if (!authState.userInfo?.id) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      Taro.showLoading({ title: '提交中...' });

      const result = await restaurantApi.rateRestaurant(restaurantId, {
        userId: parseInt(authState.userInfo.id),
        tasteRating: reviewForm.taste,
        environmentRating: reviewForm.environment,
        serviceRating: reviewForm.service,
        priceRating: reviewForm.price,
      });

      Taro.hideLoading();

      if (result) {
        Taro.showToast({ title: '评价成功', icon: 'success' });
        setShowReviewSheet(false);

        // 重置表单
        setReviewForm({
          overall: 5,
          taste: 5,
          service: 5,
          environment: 5,
          price: 5,
          content: '',
        });

        // 刷新餐厅数据以显示更新后的评分
        loadRestaurantDetail(restaurantId);
      } else {
        Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
      }
    } catch (error) {
      console.error('提交评价失败:', error);
      Taro.hideLoading();
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  // Share
  useShareAppMessage(() => ({
    title: restaurant?.name || 'Explore Fine Dining',
    path: `/pages/restaurant/detail/index?id=${restaurantId}`,
  }));

  if (loading)
    return (
      <View
        className="premium-loading"
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        <View className="loader">
          <View
            className="dot"
            style={{
              width: '20rpx',
              height: '20rpx',
              background: '#0f392b',
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: '10rpx',
            }}
          ></View>
          <View
            className="dot"
            style={{
              width: '20rpx',
              height: '20rpx',
              background: '#0f392b',
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: '10rpx',
            }}
          ></View>
          <View
            className="dot"
            style={{
              width: '20rpx',
              height: '20rpx',
              background: '#0f392b',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          ></View>
        </View>
        <Text style={{ marginLeft: '20rpx', color: '#888', fontSize: '28rpx' }}>Loading...</Text>
      </View>
    );

  if (!restaurant)
    return (
      <View
        className="premium-error"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        <Text style={{ fontSize: '64rpx', marginBottom: '32rpx' }}>🍽️</Text>
        <Text
          style={{ color: '#1a1a1a', fontSize: '32rpx', fontWeight: 'bold', marginBottom: '16rpx' }}
        >
          Restaurant not found
        </Text>
        <Text style={{ color: '#888', fontSize: '28rpx', marginBottom: '48rpx' }}>
          The restaurant you are looking for does not exist or has been removed.
        </Text>
        <View
          className="btn-back"
          onClick={() => Taro.navigateBack()}
          style={{
            padding: '24rpx 64rpx',
            background: '#0f392b',
            color: '#fff',
            borderRadius: '100rpx',
            fontSize: '28rpx',
            fontWeight: '600',
            boxShadow: '0 8rpx 24rpx rgba(15, 57, 43, 0.2)',
          }}
        >
          Go Back
        </View>
      </View>
    );

  const images = getAllImages();

  const copyToClipboard = (text: string, label: string) => {
    if (!text || text === 'Not Available') {
      Taro.showToast({ title: `${label} not available`, icon: 'none' });
      return;
    }
    Taro.setClipboardData({
      data: text,
      success: () => {
        // Taro.setClipboardData automatically shows a success toast on WeChat
        // but we can add one for other platforms or a custom message
      },
    });
  };

  return (
    <View className="premium-detail-page">
      <ScrollView className="scroller" scrollY>
        {/* Hero Section */}
        <View className="hero-section">
          <Swiper
            className="hero-swiper"
            lazyRender
            autoplay={5000}
            onChange={(value) => setCurrentImageIndex(value)}
          >
            <Swiper.Indicator />
            {images.map((url, idx) => (
              <Swiper.Item key={idx}>
                <Image
                  className="hero-image"
                  src={url}
                  // mode="aspectFill"
                  onClick={() => handlePreview(idx)}
                />
                <View className="hero-gradient"></View>
              </Swiper.Item>
            ))}
          </Swiper>
          {/* Hero Content (Overlaid) */}
          <View className="hero-content">
            <Text className="restaurant-name">{restaurant.name}</Text>

            <View className="hero-meta">
              <View className="meta-item">
                <Text className="icon">📍</Text>
                <Text>{getSuburbDisplay()}</Text>
              </View>
              <View className="divider"></View>
              <View className="meta-item">
                <Text className="icon">💲</Text>
                <Text>{getPriceDisplay()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Sheet */}
        <View className="content-sheet">
          {/* Rating Highlights */}
          <View className="rating-highlights">
            <View className="main-score">
              <Text className="score-val">{restaurant.overallRating}</Text>
              <View className="stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Text
                    key={i}
                    className={`star ${i <= Math.round(parseFloat(restaurant.overallRating)) ? 'filled' : ''}`}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text className="review-count">{restaurant.totalReviews} Reviews</Text>
            </View>

            {restaurant.aspectRatings && (
              <View className="aspect-scores">
                <View className="score-item">
                  <Text className="label">Taste</Text>
                  <View className="bar-bg">
                    <View
                      className="bar-fill"
                      style={{
                        width: `${(parseFloat(restaurant.aspectRatings.taste.average) / 5) * 100}%`,
                      }}
                    ></View>
                  </View>
                  <Text className="val">{restaurant.aspectRatings.taste.average}</Text>
                </View>
                <View className="score-item">
                  <Text className="label">Service</Text>
                  <View className="bar-bg">
                    <View
                      className="bar-fill"
                      style={{
                        width: `${(parseFloat(restaurant.aspectRatings.service.average) / 5) * 100}%`,
                      }}
                    ></View>
                  </View>
                  <Text className="val">{restaurant.aspectRatings.service.average}</Text>
                </View>
                <View className="score-item">
                  <Text className="label">Env</Text>
                  <View className="bar-bg">
                    <View
                      className="bar-fill"
                      style={{
                        width: `${(parseFloat(restaurant.aspectRatings.environment.average) / 5) * 100}%`,
                      }}
                    ></View>
                  </View>
                  <Text className="val">{restaurant.aspectRatings.environment.average}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="section description-section">
            <Text className="section-header">The Experience</Text>
            <Text className="body-text">
              {restaurant.description || 'No description available for this venue.'}
            </Text>
          </View>

          {/* Info Grid */}
          <View className="section info-section">
            <Text className="section-header">Information</Text>
            <View
              className="info-row"
              onClick={() =>
                copyToClipboard(
                  `${restaurant.streetAddress}, ${restaurant.suburb} ${restaurant.state} ${restaurant.postcode}`,
                  'Address'
                )
              }
            >
              <View className="icon-box">
                <Text>📍</Text>
              </View>
              <View className="info-content">
                <Text className="label">Address</Text>
                <Text className="value">
                  {restaurant.streetAddress}, {restaurant.suburb} {restaurant.state}{' '}
                  {restaurant.postcode}
                </Text>
              </View>
              <Text className="arrow">→</Text>
            </View>
          </View>

          <View className="safe-area-spacer"></View>
        </View>
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View className="premium-action-bar">
        <View className="action-btn primary" onClick={() => setShowReviewSheet(true)}>
          <Text>Write a Review</Text>
        </View>
      </View>

      {/* Review Popup Chart */}
      <Popup
        visible={showReviewSheet}
        position="bottom"
        round
        closeable
        onClose={() => setShowReviewSheet(false)}
        className="review-popup"
      >
        <View className="review-sheet-content">
          <Text className="sheet-title">Rate Your Experience</Text>

          <View className="overall-rating-input">
            <Rate
              value={reviewForm.overall}
              count={5}
              touchable
              onChange={(val) => setReviewForm({ ...reviewForm, overall: val })}
            />
            <Text className="rating-label-text">Overall</Text>
          </View>

          <View className="dimensions-input">
            <View className="dim-item">
              <Text className="dim-label">Taste</Text>
              <Rate
                value={reviewForm.taste}
                count={5}
                touchable
                onChange={(val) => setReviewForm({ ...reviewForm, taste: val })}
              />
            </View>
            <View className="dim-item">
              <Text className="dim-label">Service</Text>
              <Rate
                value={reviewForm.service}
                count={5}
                touchable
                onChange={(val) => setReviewForm({ ...reviewForm, service: val })}
              />
            </View>
            <View className="dim-item">
              <Text className="dim-label">Environment</Text>
              <Rate
                value={reviewForm.environment}
                count={5}
                touchable
                onChange={(val) => setReviewForm({ ...reviewForm, environment: val })}
              />
            </View>
            <View className="dim-item">
              <Text className="dim-label">Value</Text>
              <Rate
                value={reviewForm.price}
                count={5}
                touchable
                onChange={(val) => setReviewForm({ ...reviewForm, price: val })}
              />
            </View>
          </View>

          <NutButton block type="primary" className="submit-btn" onClick={handleReviewSubmit}>
            Submit Review
          </NutButton>
        </View>
      </Popup>
    </View>
  );
};

export default RestaurantDetail;
