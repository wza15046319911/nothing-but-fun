import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import type { UserInfo } from '../../services/auth';
import './index.less';

type FormKeys = 'email' | 'phone' | 'wechatId';
type FormState = Record<FormKeys, string>;
type ErrorState = Partial<Record<FormKeys, string>>;

const ContactInfo: React.FC = () => {
  const { state: authState, updateUserInfo } = useAuth();
  const { userInfo, openid } = authState;

  const [formData, setFormData] = useState<FormState>({
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    wechatId: userInfo?.wechatId || '',
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
      wechatId: userInfo?.wechatId || '',
    });
  }, [userInfo?.email, userInfo?.phone, userInfo?.wechatId]);

  const handleFieldChange = (field: FormKeys, value: string) => {
    let nextValue = value;
    if (field === 'phone') {
      nextValue = value.replace(/[^\d]/g, '').slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: ErrorState = {};
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = '请输入有效的邮箱地址';
    }

    if (phone && !/^04\d{8}$/.test(phone)) {
      nextErrors.phone = '请输入有效的澳洲手机号（例如 04XXXXXXXX）';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Taro.showToast({ title: '请检查输入信息', icon: 'none' });
      return;
    }

    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedWechatId = formData.wechatId.trim();

    const originalEmail = (userInfo?.email || '').trim();
    const originalPhone = (userInfo?.phone || '').trim();
    const originalWechatId = (userInfo?.wechatId || '').trim();

    const hasChanges =
      trimmedEmail !== originalEmail ||
      trimmedPhone !== originalPhone ||
      trimmedWechatId !== originalWechatId;

    if (!hasChanges) {
      Taro.showToast({ title: '没有检测到任何更改', icon: 'none' });
      return;
    }

    try {
      setLoading(true);
      const updatePayload: Partial<UserInfo> = {};

      if (trimmedEmail !== originalEmail) updatePayload.email = trimmedEmail || null;
      if (trimmedPhone !== originalPhone) updatePayload.phone = trimmedPhone || null;
      if (trimmedWechatId !== originalWechatId) updatePayload.wechatId = trimmedWechatId || null;
      if (openid || userInfo?.openid)
        updatePayload.openid = openid || userInfo?.openid || undefined;

      const success = await updateUserInfo(updatePayload);

      if (success) {
        Taro.showToast({ title: '更新成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({ title: '更新失败', icon: 'none' });
      }
    } catch (error) {
      console.error('更新联系信息失败:', error);
      Taro.showToast({ title: '更新失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  // Check for changes (re-calculate for button state)
  const trimmedEmail = formData.email.trim();
  const trimmedPhone = formData.phone.trim();
  const trimmedWechatId = formData.wechatId.trim();
  const hasChanges =
    trimmedEmail !== (userInfo?.email || '').trim() ||
    trimmedPhone !== (userInfo?.phone || '').trim() ||
    trimmedWechatId !== (userInfo?.wechatId || '').trim();

  return (
    <View className="contact-info-container">
      <ScrollView className="content" scrollY>
        {/* Immersive Header */}
        <View className="enhanced-header">
          <Text className="header-title">联系信息</Text>
          <Text className="header-subtitle">让买家更容易联系到您</Text>
        </View>

        {/* Info Overview (Glass Cards) */}
        <View className="info-overview">
          <View className="info-item">
            <Text className="info-label">邮箱</Text>
            <Text className={`info-value ${userInfo?.email ? '' : 'placeholder'}`}>
              {userInfo?.email || '未设置'}
            </Text>
          </View>
          <View className="info-item">
            <Text className="info-label">手机号</Text>
            <Text className={`info-value ${userInfo?.phone ? '' : 'placeholder'}`}>
              {userInfo?.phone || '未设置'}
            </Text>
          </View>
          <View className="info-item">
            <Text className="info-label">微信号</Text>
            <Text className={`info-value ${userInfo?.wechatId ? '' : 'placeholder'}`}>
              {userInfo?.wechatId || '未设置'}
            </Text>
          </View>
        </View>

        {/* Form Card (Glass) */}
        <View className="form-card">
          <Text className="section-title">更新联系方式</Text>

          <View className="input-group">
            <Text className="input-label">邮箱</Text>
            <Input
              className="custom-input"
              type="text"
              placeholder="请输入常用邮箱"
              value={formData.email}
              onInput={(e) => handleFieldChange('email', e.detail.value)}
              disabled={loading}
              placeholderClass="input-placeholder"
            />
            {errors.email && <Text className="error-text">{errors.email}</Text>}
          </View>

          <View className="input-group">
            <Text className="input-label">微信号</Text>
            <Input
              className="custom-input"
              type="text"
              placeholder="买家添加通过此ID联系您"
              value={formData.wechatId}
              onInput={(e) => handleFieldChange('wechatId', e.detail.value)}
              disabled={loading}
              placeholderClass="input-placeholder"
            />
            <Text className="helper-text">
              提醒：请先在微信「我-设置-朋友权限」中开启「通过微信号添加我」，否则对方可能无法通过微信号找到您。
            </Text>
            {errors.wechatId && <Text className="error-text">{errors.wechatId}</Text>}
          </View>

          <View className="input-group">
            <Text className="input-label">手机号码</Text>
            <Input
              className="custom-input"
              type="number"
              placeholder="请输入澳洲手机号 (04...)"
              value={formData.phone}
              onInput={(e) => handleFieldChange('phone', e.detail.value)}
              disabled={loading}
              placeholderClass="input-placeholder"
            />
            {errors.phone && <Text className="error-text">{errors.phone}</Text>}
          </View>

          <View className="tips-block">
            <Text className="tips-title">📌 小贴士</Text>
            <Text className="tips-text">
              您的信息仅用于交易沟通，为了您的账户安全，请勿向他人透露验证码或密码。
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View className="action-bar">
        <Button className="cancel-button" onClick={handleCancel} disabled={loading}>
          取消
        </Button>
        <Button
          className="submit-button"
          onClick={handleSubmit}
          loading={loading}
          disabled={loading || !hasChanges}
        >
          {loading ? '保存中...' : '保存更改'}
        </Button>
      </View>
    </View>
  );
};

export default ContactInfo;
