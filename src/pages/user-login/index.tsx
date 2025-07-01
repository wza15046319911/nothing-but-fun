import React, { useState } from 'react'
import { View, Text, Image, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/auth'
import './index.less'

// 默认头像URL
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const UserLogin: React.FC = () => {
  // 使用Auth Context
  const { state, createUser, logout, clearError } = useAuth()
  const { isLoggedIn, isLoading, userInfo, error } = state
  
  // 新增状态用于头像和昵称
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl)
  const [nickname, setNickname] = useState('')
  const [wechatCode, setWechatCode] = useState('')
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [hasUploadedAvatar, setHasUploadedAvatar] = useState(false)
  const [fileName, setFileName] = useState('')

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
      const uploadResult = await new Promise<string>((resolve, reject) => {
        Taro.uploadFile({
          url: 'http://192.168.18.34:3000/api/file',
          filePath: avatarUrl,
          name: 'image',
          formData: {
            'user': 'test'
          },
          success: (res) => {
            console.log('头像上传结果:', res)
            try {
              const data = JSON.parse(res.data)
              // cloudinary 返回的文件名
              // 需要拼接上 cloudinary 的域名
              // setFileName()
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

      // console.log('获取到微信code:', loginRes.code)
      
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
      Taro.showToast({
        title: '请先进行微信登录',
        icon: 'none'
      })
      return
    }

    if (!nickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    if (!hasUploadedAvatar || avatarUrl === defaultAvatarUrl) {
      Taro.showToast({
        title: '请先上传头像',
        icon: 'none',
        duration: 2000
      })
      return
    }

    try {
      const success = await createUser(wechatCode, {
        nickname: nickname,
        avatarUrl: avatarUrl
      })

      if (success) {
        setShowProfileForm(false)
        
        // 重置表单状态
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
        Taro.showToast({
          title: '我的订单功能开发中',
          icon: 'none'
        })
        break
      case 'favorites':
        Taro.showToast({
          title: '我的收藏功能开发中',
          icon: 'none'
        })
        break
      // case 'myItems':
      //   Taro.navigateTo({
      //     url: '/pages/second-hand/my-items/index'
      //   })
      //   break
      case 'feedback':
        Taro.showToast({
          title: '意见反馈功能开发中',
          icon: 'none'
        })
        break
      case 'settings':
        Taro.showToast({
          title: '设置功能开发中',
          icon: 'none'
        })
        break
      default:
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
                src={userInfo.avatarUrl || 'https://picsum.photos/200/200?random=60'}
                mode='aspectFill'
              />
              <View className='login-text'>
                {userInfo.nickname || `用户${userInfo.id}`}
              </View>
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
                {isLoading ? '登录中...' : '微信登录'}
              </View>
            </>
          )}
        </View>
      </View>
      
      {/* 头像昵称填写表单 */}
      {showProfileForm && wechatCode && (
        <View className='profile-form-container'>
          <View className='profile-form'>
            <View className='form-title'>完善个人资料</View>
            <View className='form-desc'>请选择头像并输入昵称</View>
            
            {/* 头像选择 */}
            <View className='avatar-section'>
              <Text className='form-label'>选择头像</Text>
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
                {isUploadingAvatar ? '正在上传头像...' : 
                 hasUploadedAvatar ? '头像上传成功' : '点击上传头像'}
              </Text>
            </View>
            
            {/* 昵称输入 */}
            <View className='nickname-section'>
              <Text className='form-label'>输入昵称</Text>
              <Input
                className='nickname-input'
                type='nickname'
                placeholder='请输入昵称'
                value={nickname}
                onInput={onNicknameInput}
                maxlength={20}
              />
            </View>

            {/* 操作按钮 */}
            <View className='form-actions'>
              <View 
                className='cancel-button'
                onClick={handleCancelProfile}
              >
                取消
              </View>
              <View 
                className={`complete-button ${isLoading || !hasUploadedAvatar ? 'loading' : ''}`}
                onClick={(isLoading || !hasUploadedAvatar) ? undefined : handleCompleteProfile}
              >
                {isLoading ? '登录中...' : !hasUploadedAvatar ? '请先上传头像' : '完成登录'}
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Content section */}
      <View className='content-section'>
        {/* Menu Options */}
        <View className='card menu-list'>
          <View 
            className='menu-item'
            onClick={() => handleMenuClick('orders')}
          >
            <Text className='menu-icon'>📋</Text>
            <Text className='menu-text'>我的发布</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
          <View 
            className='menu-item'
            onClick={() => handleMenuClick('favorites')}
          >
            <Text className='menu-icon'>🏆</Text>
            <Text className='menu-text'>我的收藏</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
          {/* <View 
            className='menu-item'
            onClick={() => handleMenuClick('settings')}
          >
            <Text className='menu-icon'>⚙️</Text>
            <Text className='menu-text'>设置</Text>
            <Text className='menu-arrow'>›</Text>
          </View> */}
        </View>

        {/* 错误信息显示
        {error && (
          <View className='card'>
            <View style={{ padding: '16px', color: '#ff4d4f', fontSize: '14px' }}>
              错误: {error}
              <Button 
                size='mini' 
                onClick={clearError}
                style={{ marginLeft: '10px' }}
              >
                清除
              </Button>
            </View>
          </View>
        )} */}
      </View>
    </View>
  )
}

export default UserLogin 