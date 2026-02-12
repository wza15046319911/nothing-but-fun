import React, { useState } from 'react';
import { View, Text, Image, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import './index.less';
import { uploadImageWithRetry } from 'src/services/upload';

// 默认头像URL
const defaultAvatarUrl =
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

const cloudinaryAvatarBaseUrl = 'https://res.cloudinary.com/ds9attzj6/image/upload/f_auto/v1751287215';

const UserLogin: React.FC = () => {
  // 使用Auth Context
  const { state, createUser, clearError, updateUserInfo } = useAuth();
  const { isLoggedIn, isLoading, userInfo } = state;

  // 新增状态用于头像和昵称
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [nickname, setNickname] = useState('');
  const [wechatCode, setWechatCode] = useState('');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasUploadedAvatar, setHasUploadedAvatar] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [avatarUploadWarning, setAvatarUploadWarning] = useState('');

  const getAvatarUrlFromUploadData = (data: any): string => {
    if (data?.filename_disk) {
      return `${cloudinaryAvatarBaseUrl}/${data.filename_disk}`;
    }
    if (data?.url && typeof data.url === 'string') {
      return data.url;
    }
    throw new Error('头像上传响应异常，请稍后重试');
  };

  // 处理头像选择
  const onChooseAvatar = async (e) => {
    const { avatarUrl: localAvatarPath } = e.detail;

    // 设置上传状态
    setIsUploadingAvatar(true);
    setAvatarUploadWarning('');

    // 显示加载状态
    Taro.showLoading({
      title: '上传头像中...',
    });

    try {
      const uploadResult = await uploadImageWithRetry(localAvatarPath, 'avatar');
      const nextAvatarUrl = getAvatarUrlFromUploadData(uploadResult.data);

      // 上传成功，更新头像URL
      setAvatarUrl(nextAvatarUrl);
      setHasUploadedAvatar(true);

      if (isLoggedIn && userInfo) {
        const success = await updateUserInfo({ avatarUrl: nextAvatarUrl });
        if (!success) {
          throw new Error('头像上传成功，但更新资料失败，请稍后重试');
        }
      }

      Taro.hideLoading();
      Taro.showToast({
        title: isLoggedIn ? '头像更新成功' : '头像上传成功',
        icon: 'success',
        duration: 1500,
      });
    } catch (error) {
      console.error('头像上传失败:', error);
      Taro.hideLoading();
      const message = (error as any)?.message || '头像上传失败，请稍后重试';
      Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2000,
      });
      setAvatarUploadWarning('头像上传失败，您可先完成登录，登录后再重试上传头像');
      if (!isLoggedIn) {
        setAvatarUrl(defaultAvatarUrl);
        setHasUploadedAvatar(false);
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 处理昵称输入
  const onNicknameInput = (e) => {
    setNickname(e.detail.value);
  };

  // 微信授权登录（当用户不存在时显示完善资料表单）
  const handleWechatLogin = async () => {
    try {
      clearError();

      // 获取微信登录code
      const loginRes = await Taro.login();

      if (!loginRes.code) {
        throw new Error('获取微信登录code失败');
      }

      // 保存code用于后续创建用户
      setWechatCode(loginRes.code);
      setShowProfileForm(true);
    } catch (error) {
      console.error('登录失败:', error);
      Taro.showToast({
        title: error.message || '获取微信授权失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    }
  };

  // 完成头像昵称设置并创建用户
  const handleCompleteProfile = async () => {
    if (isSubmittingProfile || isLoading) {
      return;
    }
    if (!wechatCode) {
      Taro.showToast({ title: '请先进行微信登录', icon: 'none' });
      return;
    }

    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    // if (!hasUploadedAvatar || avatarUrl === defaultAvatarUrl) {
    //   Taro.showToast({ title: '请先上传头像', icon: 'none' })
    //   return
    // }

    try {
      setIsSubmittingProfile(true);
      const success = await createUser(wechatCode, {
        nickname: nickname,
        avatarUrl: hasUploadedAvatar ? avatarUrl : defaultAvatarUrl,
      });

      if (success) {
        setShowProfileForm(false);
        setWechatCode('');
        setAvatarUrl(defaultAvatarUrl);
        setNickname('');
        setHasUploadedAvatar(false);

        Taro.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('创建用户失败:', error);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // 取消头像昵称设置
  const handleCancelProfile = () => {
    setShowProfileForm(false);
    setWechatCode('');
    setAvatarUrl(defaultAvatarUrl);
    setNickname('');
    setHasUploadedAvatar(false);
    setIsUploadingAvatar(false);
    setIsSubmittingProfile(false);
  };

  // 处理菜单项点击
  const handleMenuClick = (menuType: string) => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后再使用此功能',
        showCancel: false,
        confirmText: '知道了',
      });
      return;
    }

    switch (menuType) {
      case 'orders':
        Taro.navigateTo({ url: '/pages/user-posts/index' });
        break;
      case 'favorites':
        Taro.showToast({ title: '我的收藏功能开发中', icon: 'none' });
        break;
      case 'phone':
        Taro.navigateTo({ url: '/pages/update-phone/index' });
        break;
      case 'contact':
        Taro.navigateTo({ url: '/pages/contact-info/index' });
        break;
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' });
        break;
    }
  };

  return (
    <View className="user-container">
      {/* Header section */}
      <View className="user-header">
        <View className="login-section">
          {isLoggedIn && userInfo ? (
            <>
              <Image
                className="avatar-placeholder"
                src={userInfo.avatarUrl || defaultAvatarUrl}
                mode="aspectFill"
              />
              <View className="login-text">{userInfo.nickname || `用户`}</View>
              <View className="login-desc">欢迎回来，{userInfo.nickname || ''}</View>
              <Button className="retry-avatar-button" openType="chooseAvatar" onChooseAvatar={onChooseAvatar}>
                重新上传头像
              </Button>
            </>
          ) : (
            <>
              <View className="avatar-placeholder">
                <Text className="avatar-icon">👤</Text>
              </View>
              <View className="login-text">您尚未登录</View>
              <View className="login-desc">登录后体验更多功能</View>
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
      <View className="content-section">
        {/* Menu Options */}
        <View className="card menu-list">
          <View className="menu-item" onClick={() => handleMenuClick('orders')}>
            <Text className="menu-icon">📋</Text>
            <Text className="menu-text">我的发布</Text>
            <Text className="menu-arrow">›</Text>
          </View>
          {/* <View className="menu-item" onClick={() => handleMenuClick('favorites')}>
            <Text className="menu-icon">❤️</Text>
            <Text className="menu-text">我的收藏</Text>
            <Text className="menu-arrow">›</Text>
          </View> */}
          <View className="menu-item" onClick={() => handleMenuClick('contact')}>
            <Text className="menu-icon">📧</Text>
            <Text className="menu-text">联系我</Text>
            <Text className="menu-arrow">›</Text>
          </View>
        </View>
      </View>

      {/* Profile Form Modal Component */}
      {showProfileForm && wechatCode && (
        <View className="profile-form-container">
          {(isSubmittingProfile || isLoading) && (
            <View className="profile-form-blocker">
              <View className="profile-form-blocker-text">处理中...</View>
            </View>
          )}
          <View className="profile-form">
            <View className="form-title">完善个人资料</View>
            <View className="form-desc">为了更好的体验，请完善您的信息</View>

            <View className="avatar-section">
              <View className="form-label">点击设置头像</View>
              <Button
                className="avatar-button"
                openType="chooseAvatar"
                onChooseAvatar={onChooseAvatar}
                disabled={isUploadingAvatar}
              >
                <Image className="avatar-preview" src={avatarUrl} mode="aspectFill" />
              </Button>
              <Text className="avatar-tip">
                {isUploadingAvatar ? '上传中...' : hasUploadedAvatar ? '✅ 已选择' : '点击上方图标'}
              </Text>
              {!!avatarUploadWarning && <Text className="avatar-warning">{avatarUploadWarning}</Text>}
            </View>

            <View className="nickname-section">
              <Text className="form-label">设置昵称</Text>
              <Input
                className="nickname-input"
                type="nickname"
                placeholder="请输入昵称"
                value={nickname}
                onInput={onNicknameInput}
                maxlength={20}
              />
            </View>

            <View className="form-actions">
              <View className="cancel-button" onClick={handleCancelProfile}>
                取消
              </View>
              <View
                className={`complete-button ${isLoading || isSubmittingProfile ? 'loading' : ''}`}
                onClick={isSubmittingProfile || isLoading ? undefined : handleCompleteProfile}
              >
                {isLoading || isSubmittingProfile ? '处理中...' : '完成注册'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default UserLogin;
