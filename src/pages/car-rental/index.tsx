import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import './index.less';

// 车辆数据
const carData = [
  {
    id: 1,
    model: 'BMW X1',
    price: 150,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop',
    features: ['紧凑型SUV', '自动挡', '5座', '省油经济'],
    description: '时尚紧凑的城市SUV，完美适合日常通勤和短途旅行',
    specs: {
      engine: '2.0T',
      transmission: '自动挡',
      fuel: '汽油',
      seats: '5座',
    },
  },
  {
    id: 2,
    model: 'BMW X3',
    price: 180,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop',
    features: ['中型SUV', '全轮驱动', '5座', '动力强劲'],
    description: '豪华中型SUV，提供卓越的驾驶体验和舒适性',
    specs: {
      engine: '2.0T',
      transmission: '自动挡',
      fuel: '汽油',
      seats: '5座',
    },
  },
  {
    id: 3,
    model: 'BMW iX',
    price: 260,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop',
    features: ['电动SUV', '零排放', '5座', '科技感十足'],
    description: '未来感十足的纯电动SUV，环保出行的最佳选择',
    specs: {
      engine: '纯电动',
      transmission: '电动',
      fuel: '电力',
      seats: '5座',
    },
  },
  {
    id: 4,
    model: 'BMW M2',
    price: 280,
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop',
    features: ['运动轿跑', '高性能', '4座', '驾驶乐趣'],
    description: '纯粹的驾驶机器，为追求极致驾驶体验而生',
    specs: {
      engine: '3.0T',
      transmission: '手自一体',
      fuel: '汽油',
      seats: '4座',
    },
  },
];

const CarRental: React.FC = () => {
  // 联系租车
  const handleContactRental = (car) => {
    Taro.showModal({
      title: `租赁 ${car.model}`,
      content: `租金：$${car.price} AUD/天\n不限公里数\n\n请联系我们预订：\n电话：+61 400 123 456\n微信：nbf-carrental`,
      showCancel: false,
      confirmText: '知道了',
    });
  };

  // 查看详情
  const handleViewDetails = (car) => {
    Taro.showModal({
      title: `${car.model} 详细信息`,
      content: `发动机：${car.specs.engine}\n变速箱：${car.specs.transmission}\n燃料类型：${car.specs.fuel}\n座位数：${car.specs.seats}\n\n${car.description}`,
      showCancel: false,
      confirmText: '知道了',
    });
  };

  return (
    <View className="car-rental-container">
      {/* 页面头部 */}
      <View className="header">
        <View className="header-content">
          <Text className="title">我们的车</Text>
          <Text className="subtitle">学生特价租赁 • 不限公里数</Text>
        </View>
        <View className="header-decoration">
          <Text className="car-emoji">🚗</Text>
        </View>
      </View>

      {/* 特色说明 */}
      <View className="features-banner">
        <View className="feature-item">
          <Text className="feature-icon">💰</Text>
          <Text className="feature-text">学生特价</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">🛣️</Text>
          <Text className="feature-text">不限公里</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">🔧</Text>
          <Text className="feature-text">保养完善</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">📞</Text>
          <Text className="feature-text">24h支持</Text>
        </View>
      </View>

      {/* 车辆列表 */}
      <ScrollView className="content" scrollY>
        <View className="cars-list">
          {carData.map((car) => (
            <View key={car.id} className="car-card">
              {/* 车辆图片 */}
              <View className="car-image-container">
                <Image className="car-image" src={car.image} mode="aspectFill" lazyLoad />
                {/* 价格标签 */}
                <View className="price-badge">
                  <Text className="price-currency">$</Text>
                  <Text className="price-amount">{car.price}</Text>
                  <Text className="price-unit">AUD/天</Text>
                </View>
              </View>

              {/* 车辆信息 */}
              <View className="car-info">
                <View className="car-header">
                  <Text className="car-model">{car.model}</Text>
                  <View className="bmw-logo">
                    <Text className="logo-text">BMW</Text>
                  </View>
                </View>

                <Text className="car-description">{car.description}</Text>

                {/* 车辆特色 */}
                <View className="car-features">
                  {car.features.map((feature, index) => (
                    <View key={index} className="feature-tag">
                      <Text className="feature-tag-text">{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* 重要提示 */}
                <View className="highlight-info">
                  <Text className="highlight-icon">✨</Text>
                  <Text className="highlight-text">不限公里数 • 学生专享价格</Text>
                </View>

                {/* 操作按钮 */}
                <View className="car-actions">
                  <Button className="details-btn" onClick={() => handleViewDetails(car)}>
                    查看详情
                  </Button>
                  <Button
                    className="contact-btn"
                    type="primary"
                    onClick={() => handleContactRental(car)}
                  >
                    立即租赁
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 租赁须知 */}
        <View className="rental-notice">
          <Text className="notice-title">租赁须知</Text>
          <View className="notice-list">
            <Text className="notice-item">• 仅限租赁公寓学生享受特价</Text>
            <Text className="notice-item">• 需提供有效驾照和学生证</Text>
            <Text className="notice-item">• 不限公里数，自由出行</Text>
            <Text className="notice-item">• 包含基础保险，安心驾驶</Text>
            <Text className="notice-item">• 24小时客服支持</Text>
            <Text className="notice-item">• 提前预订享受更多优惠</Text>
          </View>
        </View>

        {/* 联系方式 */}
        <View className="contact-section">
          <Text className="contact-title">联系我们</Text>
          <View className="contact-info">
            <View className="contact-item">
              <Text className="contact-icon">📞</Text>
              <Text className="contact-text">+61 400 123 456</Text>
            </View>
            <View className="contact-item">
              <Text className="contact-icon">💬</Text>
              <Text className="contact-text">微信：nbf-carrental</Text>
            </View>
            <View className="contact-item">
              <Text className="contact-icon">📧</Text>
              <Text className="contact-text">carrental@nbf.com</Text>
            </View>
          </View>
        </View>

        {/* 底部占位 */}
        <View className="bottom-placeholder" />
      </ScrollView>
    </View>
  );
};

export default CarRental;
