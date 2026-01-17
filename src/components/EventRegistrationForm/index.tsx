import React, { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { Button, Dialog, Toast } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import { eventRegistrationApi, Event, NewEventRegistration } from '../../services/events';
import './index.less';

interface EventRegistrationFormProps {
  event: Event;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  event,
  visible,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<NewEventRegistration>({
    userId: user?.id || 0,
    realName: '',
    email: '',
    phoneNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (visible && user) {
      setFormData({
        userId: user.id,
        realName: '',
        email: '',
        phoneNumber: '',
      });
      setErrors({});
    }
  }, [visible, user]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.realName.trim()) {
      newErrors.realName = '请输入真实姓名';
    } else if (formData.realName.length > 100) {
      newErrors.realName = '姓名长度不能超过100个字符';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    } else if (formData.email.length > 255) {
      newErrors.email = '邮箱长度不能超过255个字符';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '请输入手机号码';
    } else if (formData.phoneNumber.length < 5 || formData.phoneNumber.length > 20) {
      newErrors.phoneNumber = '手机号码长度应在5-20个字符之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      Toast.show('请先登录');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await eventRegistrationApi.registerForEvent(event.id, user.id, formData);

      Toast.show('报名成功！');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('报名失败:', error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('已经注册') || error.message.includes('already registered')) {
          Toast.show('您已经报名过这个活动了');
        } else if (error.message.includes('已满员') || error.message.includes('full')) {
          Toast.show('活动已满员，报名失败');
        } else if (error.message.includes('活动不存在')) {
          Toast.show('活动不存在');
        } else {
          Toast.show(`报名失败: ${error.message}`);
        }
      } else {
        Toast.show('报名失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof NewEventRegistration, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <Dialog
      visible={visible}
      title="活动报名"
      onClose={onClose}
      closeOnOverlayClick={false}
      className="event-registration-dialog"
    >
      <View className="registration-form">
        {/* Event Info */}
        <View className="event-info">
          <Text className="event-title">{event.title}</Text>
          <Text className="event-time">🕒 {new Date(event.startTime).toLocaleString('zh-CN')}</Text>
          <Text className="event-location">📍 {event.location || '线上活动'}</Text>
          {event.capacity && (
            <Text className="event-capacity">👥 限制人数: {event.capacity}人</Text>
          )}
        </View>

        {/* Form Fields */}
        <View className="form-fields">
          <View className="form-field">
            <Text className="field-label">真实姓名 *</Text>
            <Input
              className={`field-input ${errors.realName ? 'error' : ''}`}
              placeholder="请输入您的真实姓名"
              value={formData.realName}
              onInput={(e) => handleInputChange('realName', e.detail.value)}
              maxlength={100}
            />
            {errors.realName && <Text className="error-text">{errors.realName}</Text>}
          </View>

          <View className="form-field">
            <Text className="field-label">邮箱地址 *</Text>
            <Input
              className={`field-input ${errors.email ? 'error' : ''}`}
              placeholder="请输入您的邮箱地址"
              value={formData.email}
              onInput={(e) => handleInputChange('email', e.detail.value)}
              maxlength={255}
            />
            {errors.email && <Text className="error-text">{errors.email}</Text>}
          </View>

          <View className="form-field">
            <Text className="field-label">手机号码 *</Text>
            <Input
              className={`field-input ${errors.phoneNumber ? 'error' : ''}`}
              placeholder="请输入您的手机号码"
              value={formData.phoneNumber}
              onInput={(e) => handleInputChange('phoneNumber', e.detail.value)}
              maxlength={20}
            />
            {errors.phoneNumber && <Text className="error-text">{errors.phoneNumber}</Text>}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="form-actions">
          <Button
            type="default"
            size="large"
            onClick={onClose}
            disabled={submitting}
            className="cancel-button"
          >
            取消
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            loading={submitting}
            className="submit-button"
          >
            {submitting ? '报名中...' : '确认报名'}
          </Button>
        </View>

        {/* Terms */}
        <View className="terms">
          <Text className="terms-text">
            点击"确认报名"即表示您同意活动相关条款，并承诺提供真实有效的个人信息。
          </Text>
        </View>
      </View>
    </Dialog>
  );
};

export default EventRegistrationForm;
