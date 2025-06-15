import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { 
  Cell, 
  CellGroup,
  Divider,
  Toast
} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.less'

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  })
  const [showToast, setShowToast] = useState(false)

  // 拨打电话
  const handlePhoneCall = (phoneNumber: string) => {
    Taro.makePhoneCall({
      phoneNumber: phoneNumber
    })
  }

  // 复制到剪贴板
  const handleCopy = (text: string, type: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: `${type}已复制到剪贴板`,
          icon: 'success',
          duration: 1500
        })
      }
    })
  }

  return (
    <ScrollView className='contact-container' scrollY>
      {/* 页面头部 */}
      <View className='contact-header'>
        <Text className='header-title'>联系我们</Text>
        <Text className='header-subtitle'>
          我们很乐意听到您的声音。请给我们留言，我们会尽快回复您。
        </Text>
      </View>

      {/* 联系信息 */}
      <View className='contact-info-section'>
        <Text className='section-title'>联系方式</Text>
        <CellGroup>
          <Cell
            title='电话'
            onClick={() => handlePhoneCall('+61400123456')}
          >
            <Text>+61 400 123 456</Text>
          </Cell>
          <Cell
            title='邮箱'
            onClick={() => handleCopy('hello@nothingbutfun.com', '邮箱地址')}
          >
            <Text>hello@nothingbutfun.com</Text>
          </Cell>
          <Cell
            title='地址'
            onClick={() => handleCopy('布里斯班市中心，昆士兰州，澳大利亚', '地址')}
          >
            <Text>布里斯班市中心，昆士兰州，澳大利亚</Text>
          </Cell>
          <Cell title='营业时间'>
            <Text>周一至周五 9:00-18:00</Text>
          </Cell>
        </CellGroup>
      </View>

      <Divider />

      {/* 社交媒体链接 */}
      <View className='social-section'>
        <Text className='section-title'>关注我们</Text>
        <View className='social-links'>
          <View className='social-item' onClick={() => handleCopy('@nothingbutfun', '微信号')}>
            <View className='social-icon wechat-icon' />
            <Text className='social-text'>微信</Text>
          </View>
          <View className='social-item' onClick={() => handleCopy('@nothingbutfun', '微博')}>
            <View className='social-icon weibo-icon' />
            <Text className='social-text'>微博</Text>
          </View>
          <View className='social-item' onClick={() => handleCopy('Nothing But Fun', 'Facebook')}>
            <View className='social-icon facebook-icon' />
            <Text className='social-text'>Facebook</Text>
          </View>
        </View>
      </View>

      <Divider />

      {/* 服务特色 */}
      <View className='features-section'>
        <Text className='section-title'>我们的服务</Text>
        <View className='features-grid'>
          <View className='feature-item'>
            <View className='feature-icon'>🎯</View>
            <Text className='feature-title'>专业服务</Text>
            <Text className='feature-desc'>提供专业的活动策划和组织服务</Text>
          </View>
          <View className='feature-item'>
            <View className='feature-icon'>🌟</View>
            <Text className='feature-title'>品质保证</Text>
            <Text className='feature-desc'>确保每一次活动都是难忘的体验</Text>
          </View>
          <View className='feature-item'>
            <View className='feature-icon'>💬</View>
            <Text className='feature-title'>24小时支持</Text>
            <Text className='feature-desc'>随时为您提供帮助和支持</Text>
          </View>
          <View className='feature-item'>
            <View className='feature-icon'>🎉</View>
            <Text className='feature-title'>丰富活动</Text>
            <Text className='feature-desc'>多样化的活动选择，满足不同需求</Text>
          </View>
        </View>
      </View>

      <Toast
        msg='操作成功！'
        visible={showToast}
        type='success'
        onClose={() => setShowToast(false)}
      />
    </ScrollView>
  )
}

export default ContactUs 