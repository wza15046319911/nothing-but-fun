import React, { useState } from 'react'
import { View, Text, Image, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/auth'
import './index.less'
import { API_BASE_URL } from 'src/services/api'

// 默认头像URL
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const UserLogin: React.FC = () => {
  // 使用Auth Context
  const { state, createUser, logout, clearError } = useAuth()
  const { isLoggedIn, isLoading, userInfo } = state
  
  // 新增状态用于头像和昵称
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl)
  const [nickname, setNickname] = useState('')
  const [wechatCode, setWechatCode] = useState('')
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [hasUploadedAvatar, setHasUploadedAvatar] = useState(false)

  // 处理头像选择
  const onChooseAvatar = async (e) => {
    const { avatarUrl } = e.detail
    
    // 设置上传状态
    setIsUploadingAvatar(true)
    
    // 显示加载状态
    Taro.showLoading({
      title: '上传头像中...'
    })

    try {
      // 上传头像到服务器
      const url = `${API_BASE_URL}/file`
      const uploadResult = await new Promise<string>((resolve, reject) => {
        Taro.uploadFile({
          url: url,
          filePath: avatarUrl,
          name: 'image',
          formData: {
            'user': 'test'
          },
          success: (res) => {
            console.log('头像上传结果:', res)
            try {
              const data = JSON.parse(res.data)
              resolve(`https://res.cloudinary.com/ds9attzj6/image/upload/v1751287215/${data.data.filename_disk}`)
            } catch (error) {
              reject(error)
            }
          },
          fail: (error) => {
            reject(error)
          }
        })
      })

      // 上传成功，更新头像URL
      setAvatarUrl(uploadResult)
      setHasUploadedAvatar(true)
      
      Taro.hideLoading()
      Taro.showToast({
        title: '头像上传成功',
        icon: 'success',
        duration: 1500
      })
      
    } catch (error) {
      console.error('头像上传失败:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: '头像上传失败，请重试',
        icon: 'none',
        duration: 2000
      })
      setAvatarUrl(defaultAvatarUrl)
      setHasUploadedAvatar(false)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // 处理昵称输入
  const onNicknameInput = (e) => {
    setNickname(e.detail.value)
  }


  // 微信授权登录（当用户不存在时显示完善资料表单）
  const handleWechatLogin = async () => {
    try {
      clearError()
      
      // 获取微信登录code
      const loginRes = await Taro.login()
      
      if (!loginRes.code) {
        throw new Error('获取微信登录code失败')
      }

      // 保存code用于后续创建用户
      setWechatCode(loginRes.code)
      setShowProfileForm(true)
      
    } catch (error) {
      console.error('登录失败:', error)
      Taro.showToast({
        title: error.message || '获取微信授权失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  // 完成头像昵称设置并创建用户
  const handleCompleteProfile = async () => {
    if (!wechatCode) {
      Taro.showToast({ title: '请先进行微信登录', icon: 'none' })
      return
    }

    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    // if (!hasUploadedAvatar || avatarUrl === defaultAvatarUrl) {
    //   Taro.showToast({ title: '请先上传头像', icon: 'none' })
    //   return
    // }

    try {
      const success = await createUser(wechatCode, {
        nickname: nickname,
        avatarUrl: avatarUrl
      })

      if (success) {
        setShowProfileForm(false)
        setWechatCode('')
        setAvatarUrl(defaultAvatarUrl)
        setNickname('')
        setHasUploadedAvatar(false)
        
        Taro.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('创建用户失败:', error)
    }
  }

  // 取消头像昵称设置
  const handleCancelProfile = () => {
    setShowProfileForm(false)
    setWechatCode('')
    setAvatarUrl(defaultAvatarUrl)
    setNickname('')
    setHasUploadedAvatar(false)
    setIsUploadingAvatar(false)
  }

  // 处理菜单项点击
  const handleMenuClick = (menuType: string) => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后再使用此功能',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    switch (menuType) {
      case 'orders':
        Taro.navigateTo({ url: '/pages/user-posts/index' })
        break
      case 'favorites':
        Taro.showToast({ title: '我的收藏功能开发中', icon: 'none' })
        break
      case 'phone':
        Taro.navigateTo({ url: '/pages/update-phone/index' })
        break
      case 'contact':
        Taro.navigateTo({ url: '/pages/contact-info/index' })
        break
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' })
        break
    }
  }

  return (
    <View className='user-container'>
      {/* Header section */}
      <View className='user-header'>
        <View className='login-section'>
          {isLoggedIn && userInfo ? (
            <>
              <Image 
                className='avatar-placeholder'
                src={userInfo.avatarUrl || defaultAvatarUrl}
                mode='aspectFill'
              />
              <View className='login-text'>
                {userInfo.nickname || `用户`}
              </View>
              <View className='login-desc'>欢迎回来，{userInfo.nickname || ''}</View>
              {/* Optional: Add logout button here if needed */}
            </>
          ) : (
            <>
              <View className='avatar-placeholder'>
                <Text className='avatar-icon'>👤</Text>
              </View>
              <View className='login-text'>您尚未登录</View>
              <View className='login-desc'>登录后体验更多功能</View>
              <View 
                className={`wechat-login-button ${isLoading ? 'loading' : ''}`}
                onClick={isLoading ? undefined : handleWechatLogin}
              >
                {isLoading ? '登录中...' : '微信一键登录'}
              </View>
            </>
          )}
        </View>
      </View>
      
      {/* Content section */}
      <View className='content-section'>
        {/* Menu Options */}
        <View className='card menu-list'>
          <View className='menu-item' onClick={() => handleMenuClick('orders')}>
            <Text className='menu-icon'>📋</Text>
            <Text className='menu-text'>我的发布</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
          <View className='menu-item' onClick={() => handleMenuClick('favorites')}>
            <Text className='menu-icon'>❤️</Text>
            <Text className='menu-text'>我的收藏</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
        </View>

        <View className='card menu-list'>
            <View className='menu-item' onClick={() => handleMenuClick('phone')}>
                <Text className='menu-icon'>📱</Text>
                <Text className='menu-text'>绑定手机</Text>
                <Text className='menu-arrow'>›</Text>
            </View>
             <View className='menu-item' onClick={() => handleMenuClick('contact')}>
                <Text className='menu-icon'>📧</Text>
                <Text className='menu-text'>联系我</Text>
                <Text className='menu-arrow'>›</Text>
            </View>
        </View>
      </View>

      {/* Profile Form Modal Component */}
      {showProfileForm && wechatCode && (
        <View className='profile-form-container'>
          <View className='profile-form'>
            <View className='form-title'>完善个人资料</View>
            <View className='form-desc'>为了更好的体验，请完善您的信息</View>
            
            <View className='avatar-section'>
              <View className='form-label'>点击设置头像</View>
              <Button 
                className='avatar-button'
                openType='chooseAvatar' 
                onChooseAvatar={onChooseAvatar}
                disabled={isUploadingAvatar}
              >
                <Image
                  className='avatar-preview'
                  src={avatarUrl}
                  mode='aspectFill'
                />
              </Button>
              <Text className='avatar-tip'>
                {isUploadingAvatar ? '上传中...' : hasUploadedAvatar ? '✅ 已选择' : '点击上方图标'}
              </Text>
            </View>
            
            <View className='nickname-section'>
              <Text className='form-label'>设置昵称</Text>
              <Input
                className='nickname-input'
                type='nickname'
                placeholder='请输入昵称'
                value={nickname}
                onInput={onNicknameInput}
                maxlength={20}
              />
            </View>

            <View className='form-actions'>
              <View className='cancel-button' onClick={handleCancelProfile}>取消</View>
              <View className={`complete-button ${isLoading ? 'loading' : ''}`} onClick={handleCompleteProfile}>
                 {isLoading ? '处理中...' : '完成注册'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default UserLogin
