import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

const wechatContact = 'dorimifa_55'

const ContactUs: React.FC = () => {
  const handleCopyWechat = () => {
    Taro.setClipboardData({ data: `微信号：${wechatContact}` })
      .then(() => {
        Taro.showToast({ title: '微信号已复制', icon: 'success', duration: 1500 })
      })
      .catch(() => {
        Taro.showToast({ title: '复制失败，请稍后重试', icon: 'none', duration: 1500 })
      })
  }

  return (
    <ScrollView className='contact-page' scrollY>
      {/* Hero Section */}
      <View className='hero-section'>
        <View className='hero-content'>
          <Text className='hero-title'>布玩小秘书</Text>
          <Text className='hero-subtitle'>贴心客服随时待命</Text>
          <Text className='hero-description'>活动报名、问题反馈，一条消息搞定</Text>
        </View>
        <View className='hero-decoration'>
          <View className='decoration-circle circle-1'></View>
          <View className='decoration-circle circle-2'></View>
          <View className='decoration-circle circle-3'></View>
        </View>
      </View>

      {/* Quick Contact Cards */}
      <View className='quick-contact-section'>
        <View className='section-header'>
          <Text className='section-title'>快速联系</Text>
          <Text className='section-subtitle'>添加微信 dorimifa_55，连接布玩小秘书</Text>
        </View>
        <View className='contact-cards'>
          <View className='contact-card wechat-card' onClick={handleCopyWechat}>
            <View className='card-icon'>
              <Text className='icon-emoji'>💬</Text>
            </View>
            <View className='card-content'>
              <Text className='card-title'>微信联系</Text>
              <Text className='card-subtitle'>{wechatContact}</Text>
              <Text className='card-hint'>点击复制微信号</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Service Features */}
      <View className='features-section'>
        <View className='section-header'>
          <Text className='section-title'>我们的优势</Text>
          <Text className='section-subtitle'>专业的团队，贴心的服务</Text>
        </View>
        
        <View className='features-grid'>
          <View className='feature-card'>
            <View className='feature-icon'>🎯</View>
            <Text className='feature-title'>专业服务</Text>
            <Text className='feature-desc'>经验丰富的团队提供专业的活动策划与执行服务</Text>
          </View>
          
          <View className='feature-card'>
            <View className='feature-icon'>⚡</View>
            <Text className='feature-title'>快速响应</Text>
            <Text className='feature-desc'>24小时内回复您的咨询，及时解决您的问题</Text>
          </View>
          
          <View className='feature-card'>
            <View className='feature-icon'>🌟</View>
            <Text className='feature-title'>品质保证</Text>
            <Text className='feature-desc'>以客户满意为目标，提供高品质的服务体验</Text>
          </View>
          
          <View className='feature-card'>
            <View className='feature-icon'>🎉</View>
            <Text className='feature-title'>丰富活动</Text>
            <Text className='feature-desc'>涵盖各类活动场景，持续推出新颖有趣的项目</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ContactUs 
