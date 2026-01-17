import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.less';

const wechatContact = 'Brisbane10000';

const ContactUs: React.FC = () => {
  const handleCopyWechat = () => {
    Taro.setClipboardData({ data: wechatContact })
      .then(() => {
        Taro.showToast({ title: '微信号已复制', icon: 'success', duration: 1500 });
      })
      .catch(() => {
        Taro.showToast({ title: '复制失败', icon: 'none' });
      });
  };

  return (
    <ScrollView className="contact-page" scrollY>
      {/* Immersive Header */}
      <View className="enhanced-header">
        <View className="header-content">
          <Text className="header-title">布玩小秘书</Text>
        </View>
      </View>

      {/* Quick Contact Cards */}
      <View className="quick-contact-section">
        <View className="section-header">
          <Text className="section-title">快速联系</Text>
          <Text className="section-subtitle">点击下方卡片即可复制微信号</Text>
        </View>

        <View className="contact-cards">
          <View className="contact-card" onClick={handleCopyWechat}>
            <Text className="card-icon">💬</Text>
            <View className="card-content">
              <Text className="card-title">布玩小秘书</Text>
              <Text className="card-subtitle">{wechatContact}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Service Features */}
      <View className="features-section">
        <View className="section-header">
          <Text className="section-title">为什么选择我们</Text>
          <Text className="section-subtitle">用心打造最优质的布里斯班生活服务</Text>
        </View>

        <View className="features-grid">
          <View className="feature-card">
            <Text className="feature-icon">🎯</Text>
            <Text className="feature-title">专业靠谱</Text>
            <Text className="feature-desc">深耕布村多年，经验丰富</Text>
          </View>

          <View className="feature-card">
            <Text className="feature-icon">⚡</Text>
            <Text className="feature-title">极速响应</Text>
            <Text className="feature-desc">全天候为您排忧解难</Text>
          </View>

          <View className="feature-card">
            <Text className="feature-icon">🌟</Text>
            <Text className="feature-title">品质优选</Text>
            <Text className="feature-desc">严选活动与服务商家</Text>
          </View>

          <View className="feature-card">
            <Text className="feature-icon">🎉</Text>
            <Text className="feature-title">缤纷活动</Text>
            <Text className="feature-desc">每周更新，精彩不断</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ContactUs;
