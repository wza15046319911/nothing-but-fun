import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { Button, Dialog, Toast } from '@nutui/nutui-react-taro';
import { useAuth } from '../../context/auth';
import { eventRegistrationApi, Event } from '../../services/events';
import EventRegistrationForm from '../EventRegistrationForm';
import './index.less';

interface EventRegistrationStatusProps {
  event: Event;
  onRegistrationChange?: () => void;
}

const EventRegistrationStatus: React.FC<EventRegistrationStatusProps> = ({
  event,
  onRegistrationChange,
}) => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Check registration status and count
  useEffect(() => {
    if (user && event) {
      checkRegistrationStatus();
      loadRegistrationCount();
    }
  }, [user, event]);

  const checkRegistrationStatus = async () => {
    if (!user) return;

    try {
      const registered = await eventRegistrationApi.isUserRegistered(user.id, event.id);
      setIsRegistered(registered);
    } catch (error) {
      console.error('检查注册状态失败:', error);
    }
  };

  const loadRegistrationCount = async () => {
    try {
      const count = await eventRegistrationApi.getEventRegistrationCount(event.id);
      setRegistrationCount(count);
    } catch (error) {
      console.error('获取注册人数失败:', error);
    }
  };

  const handleRegister = () => {
    if (!user) {
      Toast.show('请先登录');
      return;
    }

    // Check if event is full
    if (event.capacity && registrationCount >= event.capacity) {
      Toast.show('活动已满员');
      return;
    }

    // Check if event has started
    const now = new Date();
    const eventStart = new Date(event.startTime);
    if (now >= eventStart) {
      Toast.show('活动已开始，无法报名');
      return;
    }

    setShowRegistrationForm(true);
  };

  const handleCancelRegistration = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await eventRegistrationApi.cancelRegistration(user.id, event.id);
      setIsRegistered(false);
      setRegistrationCount((prev) => Math.max(0, prev - 1));
      setShowCancelDialog(false);
      Toast.show('取消报名成功');
      onRegistrationChange?.();
    } catch (error) {
      console.error('取消报名失败:', error);
      Toast.show('取消报名失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
    setRegistrationCount((prev) => prev + 1);
    onRegistrationChange?.();
  };

  const getEventStatus = () => {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const eventEnd = event.endTime ? new Date(event.endTime) : null;

    if (now < eventStart) {
      return 'upcoming';
    } else if (eventEnd && now > eventEnd) {
      return 'ended';
    } else {
      return 'ongoing';
    }
  };

  const getStatusText = () => {
    const status = getEventStatus();
    switch (status) {
      case 'upcoming':
        return '即将开始';
      case 'ongoing':
        return '进行中';
      case 'ended':
        return '已结束';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    const status = getEventStatus();
    switch (status) {
      case 'upcoming':
        return '#52c41a';
      case 'ongoing':
        return '#faad14';
      case 'ended':
        return '#999';
      default:
        return '#999';
    }
  };

  const isEventFull = event.capacity && registrationCount >= event.capacity;
  const canRegister = !isRegistered && getEventStatus() === 'upcoming' && !isEventFull;
  const canCancel = isRegistered && getEventStatus() === 'upcoming';

  return (
    <View className="event-registration-status">
      {/* Registration Info */}
      <View className="registration-info">
        <View className="status-row">
          <View className="status-badge" style={{ backgroundColor: getStatusColor() }}>
            <Text className="status-text">{getStatusText()}</Text>
          </View>

          {event.capacity && (
            <View className="capacity-info">
              <Text className="capacity-text">
                {registrationCount}/{event.capacity}人
              </Text>
              {isEventFull && <Text className="full-badge">已满员</Text>}
            </View>
          )}
        </View>

        {isRegistered && (
          <View className="registered-badge">
            <Text className="registered-text">✅ 已报名</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="action-buttons">
        {canRegister && (
          <Button type="primary" size="large" onClick={handleRegister} className="register-button">
            立即报名
          </Button>
        )}

        {canCancel && (
          <Button
            type="default"
            size="large"
            onClick={() => setShowCancelDialog(true)}
            className="cancel-button"
          >
            取消报名
          </Button>
        )}

        {!canRegister && !canCancel && !isRegistered && (
          <Button type="default" size="large" disabled className="disabled-button">
            {isEventFull ? '已满员' : getEventStatus() === 'ended' ? '已结束' : '进行中'}
          </Button>
        )}
      </View>

      {/* Registration Form Dialog */}
      <EventRegistrationForm
        event={event}
        visible={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <Dialog
          visible={showCancelDialog}
          title="确认取消报名"
          onClose={() => setShowCancelDialog(false)}
        >
          <View className="cancel-dialog-content">
            <Text className="cancel-message">确定要取消报名"{event.title}"吗？</Text>
            <Text className="cancel-warning">取消后如需重新报名，需要重新填写报名信息。</Text>
            <View className="dialog-actions">
              <Button type="default" onClick={() => setShowCancelDialog(false)} disabled={loading}>
                保留报名
              </Button>
              <Button type="primary" onClick={handleCancelRegistration} loading={loading}>
                确认取消
              </Button>
            </View>
          </View>
        </Dialog>
      )}
    </View>
  );
};

export default EventRegistrationStatus;
