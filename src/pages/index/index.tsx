import React from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline, useLoad } from '@tarojs/taro';
import { Swiper } from '@taroify/core';
import { useState } from 'react';
import '@taroify/core/swiper/style';
import homepageApi from '../../services/homepage';
import './index.less';

// SVG Icons
import BagIcon from '../../assets/icons/bag-svgrepo-com.svg';
import BalloonIcon from '../../assets/icons/hot-air-balloon-svgrepo-com.svg';
import TentIcon from '../../assets/icons/tent-svgrepo-com.svg';
import BbqIcon from '../../assets/icons/bbq-svgrepo-com.svg';
import GlassesIcon from '../../assets/icons/glasses-svgrepo-com.svg';
import DivingIcon from '../../assets/icons/diving-goggles-svgrepo-com.svg';
import MapIcon from '../../assets/icons/map-svgrepo-com.svg';

// Types
interface FeatureEntry {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  iconType?: 'svg' | 'emoji';
  path: string;
  gradient?: string;
  bgColor?: string;
  badge?: string;
}

// Data Definition
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1765873360315-b253774254eb?q=80&w=2350&fit=crop', // Abstract Colorful
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=600&fit=crop', // Food
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop', // Event
];

const mainFeatures: FeatureEntry[] = [
  {
    id: 1,
    title: '布村换换乐',
    subtitle: '闲置好物',
    description: '精选二手 环保实惠',
    icon: BagIcon,
    iconType: 'svg',
    path: '/pages/second-hand/index',
    badge: '热门',
  },
  {
    id: 8,
    title: '布好玩租赁',
    subtitle: '房产车辆',
    description: '布好玩户外用品租赁',
    icon: GlassesIcon,
    iconType: 'svg',
    path: '/pages/rental/index',
  },
  {
    id: 2,
    title: '布玩新鲜事',
    subtitle: '活动日历',
    description: '本周去哪玩',
    icon: BalloonIcon,
    iconType: 'svg',
    path: '/pages/recent-activities/index',
    badge: 'NEW',
  },
  {
    id: 4,
    title: '布村好吃榜',
    subtitle: '探店指南',
    description: '必吃美食',
    icon: BbqIcon,
    iconType: 'svg',
    path: '/pages/restaurant/index',
  },
  {
    id: 3,
    title: '精彩回放',
    subtitle: '高光时刻',
    description: '往期回顾',
    icon: TentIcon,
    iconType: 'svg',
    path: '/pages/past-activities/index',
  },
  {
    id: 5,
    title: '布玩好物',
    subtitle: '周边文创',
    description: '精选伴手礼',
    icon: MapIcon,
    iconType: 'svg',
    path: '/pages/gift/index',
  },
  {
    id: 7,
    title: '布玩小秘书',
    subtitle: '贴心客服',
    description: '活动报名 问题反馈',
    icon: DivingIcon,
    iconType: 'svg',
    path: '/pages/contact-us/index',
  },
];

const Index: React.FC = () => {
  const [heroImages, setHeroImages] = useState<string[]>(HERO_IMAGES);

  useShareAppMessage(() => ({
    title: 'Nothing But Fun | 布好玩',
    path: '/pages/loading/index',
  }));

  useShareTimeline(() => ({
    title: 'Nothing But Fun | 布好玩',
    query: 'fromShare=1',
  }));

  useLoad(async (options) => {
    if (options && options.fromShare === '1') {
      Taro.reLaunch({ url: '/pages/loading/index' });
    }

    try {
      const response = await homepageApi.fetchHomepageImages();
      if (response.success && response.data && response.data.length > 0) {
        // Sort by sort order if available, otherwise keep API order
        // Filter visible images just in case, though API should handle it
        const apiImages = response.data.filter((img) => img.isVisible).map((img) => img.imageUrl);

        if (apiImages.length > 0) {
          setHeroImages(apiImages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch homepage images:', error);
      // Fallback to mock data (already set as initial state)
    }
  });

  const handleEntryClick = (entry: FeatureEntry) => {
    if (!entry.path) {
      Taro.showToast({
        title: `${entry.title} coming soon`,
        icon: 'none',
      });
      return;
    }
    Taro.navigateTo({ url: entry.path });
  };

  // Helper to get feature by ID
  const getFeature = (id: number) => mainFeatures.find((f) => f.id === id);

  return (
    <ScrollView className="index-container" scrollY>
      {/* Header */}
      <View className="header-section">
        <Text className="app-title">Nothing But Fun</Text>
        <Text className="app-subtitle">Discover Brisbane's Best</Text>
      </View>

      {/* Hero Swiper */}
      <View className="hero-section">
        <Swiper className="hero-swiper" autoplay={4000} indicatorColor="white">
          {heroImages.map((img, idx) => (
            <Swiper.Item key={idx}>
              <Image src={img} className="hero-image" mode="aspectFill" />
            </Swiper.Item>
          ))}
        </Swiper>
      </View>

      {/* Premium Grid Layout */}
      <View className="grid-section">
        {/* Row 1: Primary Service (Second Hand) - Full Width */}
        {getFeature(1) && (
          <View
            className="card primary-card full-width"
            onClick={() => handleEntryClick(getFeature(1)!)}
          >
            <View className="card-bg-decoration circle-1" />
            <View className="card-content">
              <View className="text-group">
                <Text className="card-title">{getFeature(1)!.title}</Text>
                <Text className="card-subtitle">{getFeature(1)!.description}</Text>
              </View>
              <View className="icon-wrapper">
                <Image src={getFeature(1)!.icon} className="icon-svg large" mode="aspectFit" />
              </View>
            </View>
            {getFeature(1)!.badge && <View className="badge">{getFeature(1)!.badge}</View>}
          </View>
        )}

        {/* Row 2: Secondary Service (Rental) - Full Width */}
        {getFeature(8) && (
          <View
            className="card secondary-card full-width"
            onClick={() => handleEntryClick(getFeature(8)!)}
          >
            <View className="card-bg-decoration circle-2" />
            <View className="card-content">
              <View className="text-group">
                <Text className="card-title">{getFeature(8)!.title}</Text>
                <Text className="card-subtitle">{getFeature(8)!.description}</Text>
              </View>
              <View className="icon-wrapper">
                <Image src={getFeature(8)!.icon} className="icon-svg" mode="aspectFit" />
              </View>
            </View>
          </View>
        )}

        {/* Row 3: Grid of 2 (Events & Food) */}
        <View className="grid-row">
          {[2, 4].map((id) => {
            const f = getFeature(id);
            if (!f) return null;
            return (
              <View key={id} className="card grid-card" onClick={() => handleEntryClick(f)}>
                <View className="card-content vertical">
                  <View className="icon-wrapper small">
                    <Image src={f.icon} className="icon-svg" mode="aspectFit" />
                  </View>
                  <Text className="card-title small">{f.title}</Text>
                  <Text className="card-subtitle">{f.subtitle}</Text>
                </View>
                {f.badge && <View className="badge small">{f.badge}</View>}
              </View>
            );
          })}
        </View>

        {/* Row 4: Grid of 2 (Replay & Gift) */}
        <View className="grid-row">
          {[3, 5].map((id) => {
            const f = getFeature(id);
            if (!f) return null;
            return (
              <View key={id} className="card grid-card" onClick={() => handleEntryClick(f)}>
                <View className="card-content vertical">
                  <View className="icon-wrapper small">
                    <Image src={f.icon} className="icon-svg" mode="aspectFit" />
                  </View>
                  <Text className="card-title small">{f.title}</Text>
                  <Text className="card-subtitle">{f.subtitle}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Row 5: Support/Contact - Full Width Minimal */}
        {getFeature(7) && (
          <View
            className="card minimal-card full-width"
            onClick={() => handleEntryClick(getFeature(7)!)}
          >
            <View className="card-content horizontal-center">
              <View className="icon-wrapper mini">
                <Image src={getFeature(7)!.icon} className="icon-svg mini" mode="aspectFit" />
              </View>
              <Text className="card-title ml-2">{getFeature(7)!.title}</Text>
              <Text className="arrow-icon ml-auto">→</Text>
            </View>
          </View>
        )}
      </View>

      <View className="footer-spacing" />
    </ScrollView>
  );
};

export default Index;
