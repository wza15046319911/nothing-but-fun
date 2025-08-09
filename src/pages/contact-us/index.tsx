import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

const ContactUs: React.FC = () => {

  const handlePhoneCall = (phoneNumber: string) => {
    Taro.makePhoneCall({
      phoneNumber: phoneNumber
    })
  }

  const handleCopy = (text: string, type: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: `${type}已复制`,
          icon: 'success',
          duration: 1500
        })
      }
    })
  }

  return (
    <ScrollView className='contact-page' scrollY>
      {/* Hero */}
      <View className='hero'>
        <Text className='hero-title'>联系我们</Text>
        <Text className='hero-subtitle'>期待与你的每一次交流</Text>
        <View className='hero-pills'>
          <View className='pill'>服务时间 周一-周五 9:00-18:00</View>
          <View className='pill'>平均响应 <Text style={{ fontWeight: '700' }}>24h</Text></View>
        </View>
      </View>

      {/* Quick actions */}
      <View className='card actions-card'>
        <Text className='card-title'>快捷联系</Text>
        <View className='action-grid'>
          <View className='action-item' onClick={() => handlePhoneCall('000-000-000')}>
            <Text className='action-icon'>📞</Text>
            <View className='action-texts'>
              <Text className='action-title'>电话</Text>
              <Text className='action-subtitle'>一键拨打</Text>
            </View>
          </View>
          <View className='action-item' onClick={() => handleCopy('zianwang9911@gmail.com', '邮箱地址')}>
            <Text className='action-icon'>✉️</Text>
            <View className='action-texts'>
              <Text className='action-title'>邮箱</Text>
              <Text className='action-subtitle'>复制邮箱地址</Text>
            </View>
          </View>
          <View className='action-item' onClick={() => handleCopy('布里斯班市中心，昆士兰州，澳大利亚', '地址')}>
            <Text className='action-icon'>📍</Text>
            <View className='action-texts'>
              <Text className='action-title'>地址</Text>
              <Text className='action-subtitle'>复制公司地址</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Social */}
      <View className='card social-card'>
        <Text className='card-title'>关注我们</Text>
        <View className='social-grid'>
          <View className='social-item' onClick={() => handleCopy('nil_object_found', '微信号')}>
            <View className='social-icon wechat' />
            <Text className='social-label'>微信</Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View className='card features-card'>
        <Text className='card-title'>我们的服务</Text>
        <View className='features-grid'>
          <View className='feature-item'>
            <Text className='feature-emoji'>🎯</Text>
            <Text className='feature-title'>专业服务</Text>
            <Text className='feature-desc'>活动策划与落地执行</Text>
          </View>
          <View className='feature-item'>
            <Text className='feature-emoji'>🌟</Text>
            <Text className='feature-title'>品质保证</Text>
            <Text className='feature-desc'>体验至上，口碑优先</Text>
          </View>
          <View className='feature-item'>
            <Text className='feature-emoji'>💬</Text>
            <Text className='feature-title'>快速响应</Text>
            <Text className='feature-desc'>工作日内 24 小时内回复</Text>
          </View>
          <View className='feature-item'>
            <Text className='feature-emoji'>🎉</Text>
            <Text className='feature-title'>丰富活动</Text>
            <Text className='feature-desc'>多场景覆盖，持续更新</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ContactUs 