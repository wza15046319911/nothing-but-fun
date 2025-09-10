import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Toast } from '@nutui/nutui-react-taro'
import './index.less'



const ContactUs: React.FC = () => {
  const [showToast, setShowToast] = useState(false)

  const handlePhoneCall = (phoneNumber: string) => {
    Taro.makePhoneCall({
      phoneNumber: phoneNumber
    })
  }

  const handleCopy = (text: string, type: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
      }
    })
  }

  const handleOpenMap = () => {
    Taro.openLocation({
      latitude: -27.4698,
      longitude: 153.0251,
      name: 'Nothing But Fun',
      address: '布里斯班市中心，昆士兰州，澳大利亚',
      scale: 18
    })
  }


  return (
    <ScrollView className='contact-page' scrollY>
      {/* Hero Section */}
      <View className='hero-section'>
        <View className='hero-content'>
          <Text className='hero-title'>联系我们</Text>
          <Text className='hero-subtitle'>Nothing But Fun - 让生活更精彩</Text>
          <Text className='hero-description'>期待与您的每一次交流，共同创造美好体验</Text>
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
          <Text className='section-subtitle'>选择您喜欢的联系方式</Text>
        </View>
        <View className='contact-cards'>
          <View className='contact-card phone-card'>
            <View className='card-icon'>
              <Text className='icon-emoji'>📞</Text>
            </View>
            <View className='card-content'>
              <Text className='card-title'>电话咨询</Text>
              <Text className='card-subtitle'>+61-447-435-758</Text>
            </View>
          </View>
          
          <View className='contact-card email-card'>
            <View className='card-icon'>
              <Text className='icon-emoji'>✉️</Text>
            </View>
            <View className='card-content'>
              <Text className='card-title'>邮箱联系</Text>
              <Text className='card-subtitle'>zianwang9911@gmail.com</Text>
            </View>
          </View>
          
          <View className='contact-card location-card'>
            <View className='card-icon'>
              <Text className='icon-emoji'>📍</Text>
            </View>
            <View className='card-content'>
              <Text className='card-title'>地址位置</Text>
              <Text className='card-subtitle'>布里斯班市中心</Text>
            </View>
          </View>
          
          <View className='contact-card wechat-card'>
            <View className='card-icon'>
              <Text className='icon-emoji'>💬</Text>
            </View>
            <View className='card-content'>
              <Text className='card-title'>微信联系</Text>
              <Text className='card-subtitle'>nil_object_found</Text>
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

      {/* Business Hours */}
      <View className='hours-section'>
        <View className='section-header'>
          <Text className='section-title'>营业时间</Text>
        </View>
        
        <View className='hours-card'>
          <View className='hours-item'>
            <Text className='day'>周一 - 周五</Text>
            <Text className='time'>9:00 - 18:00</Text>
          </View>
          <View className='hours-item'>
            <Text className='day'>周六 - 周日</Text>
            <Text className='time'>10:00 - 17:00</Text>
          </View>
          <View className='hours-note'>
            <Text className='note-text'>节假日营业时间可能有所调整，请提前咨询</Text>
          </View>
        </View>
      </View>

      <Toast
        visible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </ScrollView>
  )
}

export default ContactUs 