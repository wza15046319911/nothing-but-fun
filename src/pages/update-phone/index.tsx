import React, { useState } from 'react';
import { View, Text, Input, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import './index.less';

const UpdatePhone: React.FC = () => {
  const { state, updateUserInfo } = useAuth();
  const { userInfo } = state;

  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 手机号格式验证
  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^04\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  // 处理手机号输入
  const handlePhoneInput = (e) => {
    const value = e.detail.value;
    // 只允许输入数字
    const numericValue = value.replace(/[^\d]/g, '');
    // 限制长度为10位
    const limitedValue = numericValue.slice(0, 10);
    setPhone(limitedValue);
  };

  // 提交更新
  const handleSubmit = async () => {
    if (!phone.trim()) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    if (!validatePhone(phone)) {
      Taro.showToast({
        title: '请输入正确的手机号格式',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const success = await updateUserInfo({ phone });

      if (success) {
        Taro.showToast({
          title: '手机号更新成功',
          icon: 'success',
          duration: 2000,
        });

        // 延迟返回上一页
        setTimeout(() => {
          Taro.navigateBack();
        }, 2000);
      }
    } catch (error) {
      console.error('更新手机号失败:', error);
      Taro.showToast({
        title: '更新失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="update-phone-container" scrollY>
      {/* Content */}
      <View className="content">
        <View className="form-section">
          <View className="form-item">
            <Text className="label">当前手机号</Text>
            <Text className="current-phone">
              {userInfo?.phone ? userInfo.phone.replace(/(\d{2})\d{8}/, '$0********') : '未设置'}
            </Text>
          </View>

          <View className="form-item">
            <Text className="label">新手机号</Text>
            <Input
              className="phone-input"
              type="number"
              placeholder="请输入澳洲手机号"
              value={phone}
              onInput={handlePhoneInput}
              maxlength={10}
              disabled={isSubmitting}
            />
          </View>

          <View className="tips">
            <Text className="tip-text">• 请输入有效的澳洲手机号码</Text>
            <Text className="tip-text">• 手机号将用于重要通知和账户安全</Text>
          </View>
        </View>

        <View className="button-section">
          <Button
            className={`submit-button ${!phone || !validatePhone(phone) || isSubmitting ? 'disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!phone || !validatePhone(phone) || isSubmitting}
          >
            {isSubmitting ? '更新中...' : '确认更新'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default UpdatePhone;
