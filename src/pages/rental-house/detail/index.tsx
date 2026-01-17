import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import { Loading, Empty, Button } from '@nutui/nutui-react-taro';
import Taro, { useRouter } from '@tarojs/taro';
import { rentalHouseApi, RentalHouse } from '../../../services/rental_house';
import './index.less';

const RentalHouseDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  // 状态管理
  const [house, setHouse] = useState<RentalHouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 加载房源详情
  const loadHouseDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const houseData = await rentalHouseApi.getRentalHouseById(Number(id));
      setHouse(houseData);
    } catch (error) {
      console.error('加载房源详情失败:', error);
      Taro.showToast({
        title: '加载失败，请稍后重试',
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 格式化价格显示
  const formatPrice = (price: string) => {
    return `$${price}`;
  };

  // 格式化房屋配置
  const formatPropertyConfig = (house: RentalHouse) => {
    let config = `${house.bedrooms}卧${house.bathrooms}卫`;
    if (house.carSpaces > 0) {
      config += `${house.carSpaces}车位`;
    }
    if (house.studyRooms > 0) {
      config += `${house.studyRooms}书房`;
    }
    return config;
  };

  // 获取房屋特色标签
  const getFeatureDisplay = (features: string[]) => {
    const featureMap = {
      pool: '🏊‍♀️ 游泳池',
      gym: '💪 健身房',
      balcony: '🌅 阳台',
      air_conditioning: '❄️ 空调',
      garden: '🌿 花园',
      parking: '🚗 停车位',
      furnished: '🛋️ 已装修',
      pet_friendly: '🐕 允许宠物',
      heritage_features: '🏛️ 历史建筑',
      polished_floors: '✨ 抛光地板',
      close_to_transport: '🚌 交通便利',
      ocean_views: '🌊 海景',
      river_views: '🏞️ 河景',
      private_jetty: '⛵ 私人码头',
      entertainment_area: '🎉 娱乐区域',
      study_area: '📚 学习区域',
      close_to_university: '🎓 近大学',
      common_room: '👥 公共休息室',
      sauna: '🧖‍♀️ 桑拿浴室',
      beachfront: '🏖️ 海滨',
      high_ceilings: '📏 高天花板',
      industrial_style: '🏭 工业风',
      large_windows: '🪟 大窗户',
      artistic_area: '🎨 艺术区域',
      large_backyard: '🌳 大后院',
      double_garage: '🚗🚗 双车库',
      family_friendly: '👨‍👩‍👧‍👦 适合家庭',
      quiet_area: '🤫 安静区域',
    };

    return features.map((feature) => featureMap[feature] || `✨ ${feature}`);
  };

  // 获取公用设施显示
  const getUtilitiesDisplay = (utilities: string[]) => {
    const utilityMap = {
      water: '💧 水费',
      electricity: '⚡ 电费',
      gas: '🔥 燃气费',
      internet: '📶 网络',
      cable: '📺 有线电视',
    };

    return utilities.map((utility) => utilityMap[utility] || utility);
  };

  // 联系房东
  const handleContact = () => {
    if (!house) return;

    Taro.showActionSheet({
      itemList: ['拨打电话', '发送邮件'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 拨打电话
          Taro.makePhoneCall({
            phoneNumber: house.contactPhone,
          });
        } else if (res.tapIndex === 1) {
          // 发送邮件
          Taro.setClipboardData({
            data: house.contactEmail,
            success: () => {
              Taro.showToast({
                title: '邮箱已复制到剪贴板',
                icon: 'success',
              });
            },
          });
        }
      },
    });
  };

  // 分享房源
  const handleShare = () => {
    if (!house) return;

    Taro.showShareMenu({
      withShareTicket: true,
    });
  };

  // 图片轮播变化
  const handleSwiperChange = (e) => {
    setCurrentImageIndex(e.detail.current);
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadHouseDetail();
  }, [id]);

  if (loading) {
    return (
      <View className="rental-house-detail-container">
        <View className="loading-container">
          <Loading type="spinner" />
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  if (!house) {
    return (
      <View className="rental-house-detail-container">
        <Empty description="房源不存在" imageSize={120} />
      </View>
    );
  }

  return (
    <View className="rental-house-detail-container">
      <ScrollView className="content" scrollY>
        {/* 房源图片轮播 */}
        <View className="image-section">
          <Swiper
            className="image-swiper"
            indicatorDots
            indicatorColor="rgba(255, 255, 255, 0.5)"
            indicatorActiveColor="#fff"
            autoplay={false}
            onChange={handleSwiperChange}
          >
            {house.images.map((image, index) => (
              <SwiperItem key={index}>
                <Image className="house-image" src={image} mode="aspectFill" />
              </SwiperItem>
            ))}
          </Swiper>

          {/* 图片计数器 */}
          <View className="image-counter">
            {currentImageIndex + 1} / {house.images.length}
          </View>

          {/* 房屋类型标签 */}
          <View className="property-type-badge">
            {house.propertyType === 'apartment'
              ? '公寓'
              : house.propertyType === 'house'
                ? '别墅'
                : house.propertyType === 'townhouse'
                  ? '联排'
                  : '其他'}
          </View>

          {/* 是否配家具 */}
          {house.furnished && <View className="furnished-badge">已配家具</View>}
        </View>

        {/* 基本信息 */}
        <View className="basic-info-section">
          <View className="title-price">
            <Text className="house-title">{house.title}</Text>
            <View className="price-info">
              <Text className="weekly-price">{formatPrice(house.weeklyPrice)}/周</Text>
              <Text className="deposit-info">押金: {formatPrice(house.depositPrice)}</Text>
            </View>
          </View>

          <View className="location-info">
            <Text className="location-text">📍 {house.streetAddress}</Text>
            <Text className="suburb-text">
              {house.suburb}, {house.state} {house.postcode}
            </Text>
          </View>

          <View className="config-info">
            <Text className="config-text">{formatPropertyConfig(house)}</Text>
            <Text className="area-text">• 室内面积: {house.floorArea}㎡</Text>
            {house.landArea && <Text className="area-text">• 土地面积: {house.landArea}㎡</Text>}
            <Text className="build-year">• 建造年份: {house.buildYear}</Text>
          </View>
        </View>

        {/* 房源描述 */}
        <View className="description-section">
          <Text className="section-title">房源描述</Text>
          <Text className="description-text">{house.description}</Text>
        </View>

        {/* 房屋特色 */}
        {house.features.length > 0 && (
          <View className="features-section">
            <Text className="section-title">房屋特色</Text>
            <View className="features-grid">
              {getFeatureDisplay(house.features).map((feature, index) => (
                <View key={index} className="feature-item">
                  <Text className="feature-text">{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 租赁信息 */}
        <View className="rental-info-section">
          <Text className="section-title">租赁信息</Text>
          <View className="rental-details">
            <View className="detail-item">
              <Text className="detail-label">可入住时间:</Text>
              <Text className="detail-value">
                {new Date(house.availableFrom).toLocaleDateString('zh-CN')}
              </Text>
            </View>
            <View className="detail-item">
              <Text className="detail-label">最短租期:</Text>
              <Text className="detail-value">{house.minimumLeaseTerm}个月</Text>
            </View>
            {house.maximumLeaseTerm && (
              <View className="detail-item">
                <Text className="detail-label">最长租期:</Text>
                <Text className="detail-value">{house.maximumLeaseTerm}个月</Text>
              </View>
            )}
            <View className="detail-item">
              <Text className="detail-label">押金:</Text>
              <Text className="detail-value">{formatPrice(house.depositPrice)}</Text>
            </View>
            <View className="detail-item">
              <Text className="detail-label">保证金:</Text>
              <Text className="detail-value">{formatPrice(house.bondAmount)}</Text>
            </View>
            <View className="detail-item">
              <Text className="detail-label">允许宠物:</Text>
              <Text className="detail-value">{house.petsAllowed ? '是' : '否'}</Text>
            </View>
            <View className="detail-item">
              <Text className="detail-label">允许吸烟:</Text>
              <Text className="detail-value">{house.smokingAllowed ? '是' : '否'}</Text>
            </View>
          </View>
        </View>

        {/* 包含费用 */}
        {house.utilitiesIncluded.length > 0 && (
          <View className="utilities-section">
            <Text className="section-title">包含费用</Text>
            <View className="utilities-list">
              {getUtilitiesDisplay(house.utilitiesIncluded).map((utility, index) => (
                <View key={index} className="utility-item">
                  <Text className="utility-text">{utility}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 额外费用 */}
        {house.additionalCosts.length > 0 && (
          <View className="additional-costs-section">
            <Text className="section-title">额外费用</Text>
            <View className="costs-list">
              {house.additionalCosts.map((cost, index) => (
                <View key={index} className="cost-item">
                  <Text className="cost-name">{cost.name}</Text>
                  <Text className="cost-amount">
                    ${cost.amount}/
                    {cost.frequency === 'weekly'
                      ? '周'
                      : cost.frequency === 'monthly'
                        ? '月'
                        : cost.frequency}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 联系信息 */}
        <View className="contact-section">
          <Text className="section-title">联系信息</Text>
          <View className="contact-details">
            <View className="contact-item">
              <Text className="contact-label">联系人:</Text>
              <Text className="contact-value">{house.contactName}</Text>
            </View>
            <View className="contact-item">
              <Text className="contact-label">中介公司:</Text>
              <Text className="contact-value">{house.agencyName}</Text>
            </View>
            <View className="contact-item">
              <Text className="contact-label">浏览次数:</Text>
              <Text className="contact-value">{house.viewCount} 次</Text>
            </View>
          </View>
        </View>

        {/* 底部占位 */}
        <View className="bottom-placeholder" />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bottom-actions">
        <Button className="share-button" size="large" fill="outline" onClick={handleShare}>
          分享房源
        </Button>
        <Button className="contact-button" size="large" type="primary" onClick={handleContact}>
          联系房东
        </Button>
      </View>
    </View>
  );
};

export default RentalHouseDetail;
