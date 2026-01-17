import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { PullToRefresh, Loading, Empty, Button, Dialog, Toast } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import { eventRegistrationApi, EventRegistration, Event } from '../../services/events';
import './index.less';

interface UserEventRegistration {
  registration: EventRegistration;
  event: Event;
}

const UserRegistrations: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<UserEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  // Load user registrations
  const loadRegistrations = async (showLoading = true) => {
    if (!user) return;

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await eventRegistrationApi.getUserEvents(user.id);
      setRegistrations(response);
    } catch (error) {
      console.error('获取用户注册失败:', error);
      Taro.showToast({
        title: '加载失败，请稍后重试',
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRegistrations(false);
  };

  // Handle cancel registration
  const handleCancelRegistration = async (eventId: number, eventTitle: string) => {
    if (!user) return;

    const result = await Taro.showModal({
      title: '确认取消报名',
      content: `确定要取消报名"${eventTitle}"吗？`,
      confirmText: '确认取消',
      cancelText: '保留报名',
    });

    if (!result.confirm) return;

    setCancelingId(eventId);
    try {
      await eventRegistrationApi.cancelRegistration(user.id, eventId);
      setRegistrations((prev) => prev.filter((item) => item.event.id !== eventId));
      Toast.show('取消报名成功');
    } catch (error) {
      console.error('取消报名失败:', error);
      Toast.show('取消报名失败，请稍后重试');
    } finally {
      setCancelingId(null);
    }
  };

  // Format time
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Get event status
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const eventEnd = event.endTime ? new Date(event.endTime) : null;

    if (now < eventStart) {
      return { text: '即将开始', color: '#52c41a', canCancel: true };
    } else if (eventEnd && now > eventEnd) {
      return { text: '已结束', color: '#999', canCancel: false };
    } else {
      return { text: '进行中', color: '#faad14', canCancel: false };
    }
  };

  // Navigate to event detail (placeholder for now)
  const handleEventClick = (eventId: number) => {
    Toast.show(`查看活动详情: ${eventId}`);
    // TODO: Navigate to event detail page when implemented
    // Taro.navigateTo({
    //   url: `/pages/event-detail/index?id=${eventId}`
    // })
  };

  useEffect(() => {
    if (user) {
      loadRegistrations();
    }
  }, [user]);

  if (!user) {
    return (
      <View className="user-registrations-container">
        <View className="login-prompt">
          <Text className="prompt-text">请先登录查看您的活动报名</Text>
          <Button
            type="primary"
            onClick={() => Taro.navigateTo({ url: '/pages/user-login/index' })}
          >
            去登录
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="user-registrations-container">
      {/* Header */}
      <View className="header">
        <View className="header-content">
          <Text className="title">我的报名</Text>
          <Text className="subtitle">管理您的活动报名</Text>
        </View>
      </View>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className="content" scrollY>
          {loading ? (
            <View className="loading-container">
              <Loading type="spinner" />
              <Text className="loading-text">加载中...</Text>
            </View>
          ) : registrations.length === 0 ? (
            <Empty description="您还没有报名任何活动" imageSize={120} />
          ) : (
            <View className="registrations-list">
              {registrations.map(({ registration, event }) => {
                const status = getEventStatus(event);
                return (
                  <View
                    key={registration.id}
                    className="registration-card"
                    onClick={() => handleEventClick(event.id)}
                  >
                    {/* Event Image */}
                    <View className="event-image-container">
                      <Image
                        className="event-image"
                        src={
                          event.image ||
                          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'
                        }
                        mode="aspectFill"
                        lazyLoad
                      />
                      <View className="status-badge" style={{ backgroundColor: status.color }}>
                        <Text className="status-text">{status.text}</Text>
                      </View>
                    </View>

                    {/* Event Info */}
                    <View className="event-info">
                      <Text className="event-title">{event.title}</Text>
                      <Text className="event-time">🕒 {formatTime(event.startTime)}</Text>
                      <Text className="event-location">📍 {event.location || '线上活动'}</Text>
                      <Text className="registration-time">
                        报名时间: {formatTime(registration.registeredAt)}
                      </Text>
                    </View>

                    {/* Actions */}
                    <View className="event-actions">
                      {status.canCancel && (
                        <Button
                          type="default"
                          size="small"
                          loading={cancelingId === event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRegistration(event.id, event.title);
                          }}
                          className="cancel-button"
                        >
                          取消报名
                        </Button>
                      )}

                      {registration.isAttended && (
                        <View className="attended-badge">
                          <Text className="attended-text">✅ 已签到</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
    </View>
  );
};

export default UserRegistrations;
