import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { PullToRefresh } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import { eventsApi, Event, EventFilters } from '../../services/events';
import { Swiper, SwiperItem } from '@tarojs/components'; // Standard swiper
import EventFiltersComponent from '../../components/EventFilters';
import Pagination from '../../components/Pagination';
import { useEventTypes } from '../../hooks/useTypes';
import './index.less';

const PastActivities: React.FC = () => {
  const { getEventTypeName } = useEventTypes();

  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [currentFilters, setCurrentFilters] = useState<EventFilters>({
    isHistorical: true,
    page: 1,
    limit: 10,
    sortBy: 'sort',
    sortOrder: 'asc',
  });

  const fetchPastEvents = async (showLoading = true, filters: EventFilters = currentFilters) => {
    try {
      if (showLoading) setLoading(true);

      const response = await eventsApi.getAllEvents(filters);

      setEvents(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('获取活动失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: EventFilters) => {
    const newFilters = {
      ...filters,
      isHistorical: true,
      page: 1,
      limit: 10,
    };
    setCurrentFilters(newFilters);
    fetchPastEvents(true, newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...currentFilters, page };
    setCurrentFilters(newFilters);
    fetchPastEvents(true, newFilters);
  };

  const handleRefresh = async () => {
    await fetchPastEvents(false);
  };

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleEventClick = (event: Event) => {
    Taro.navigateTo({
      url: `/pages/events/detail/index?id=${event.id}`,
    });
  };

  return (
    <ScrollView className="enhanced-past-activities-container" scrollY style={{ height: '100vh' }}>
      {/* Immersive Header */}
      <View className="enhanced-header-section">
        <View className="header-content">
          <View className="title-section">
            <Text className="enhanced-header-title">精彩回放站</Text>
            <Text className="enhanced-header-subtitle">高光瞬间重温，留住美好记忆</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View className="enhanced-filters-wrapper">
        <EventFiltersComponent
          onFiltersChange={handleFiltersChange}
          initialFilters={currentFilters}
        />
      </View>

      {/* List */}
      <View className="enhanced-content">
        {loading ? (
          <View className="enhanced-loading-container">
            <View className="loading-dots">
              <View className="dot"></View>
            </View>
            <Text>正在加载精彩回放...</Text>
          </View>
        ) : events.length > 0 ? (
          <View className="enhanced-activity-list">
            {events.map((event, index) => (
              <View
                key={event.id}
                className="enhanced-activity-card"
                onClick={() => handleEventClick(event)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <View className="enhanced-activity-image-container">
                  <View className="image-wrapper">
                    {event.imageUrls && event.imageUrls.length > 1 ? (
                      <Swiper
                        circular
                        indicatorDots
                        autoplay
                        style={{ height: '100%', width: '100%' }}
                        indicatorColor="rgba(255,255,255,0.5)"
                        indicatorActiveColor="#fff"
                      >
                        {event.imageUrls.map((imageUrl, imgIndex) => (
                          <SwiperItem key={imgIndex}>
                            <Image
                              className="enhanced-activity-image"
                              src={imageUrl}
                              mode="aspectFill"
                              lazyLoad
                            />
                          </SwiperItem>
                        ))}
                      </Swiper>
                    ) : (
                      <Image
                        className="enhanced-activity-image"
                        src={
                          event.imageUrls?.[0] ||
                          event.image ||
                          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'
                        }
                        mode="aspectFill"
                        lazyLoad
                      />
                    )}
                    <View className="image-overlay"></View>
                  </View>

                  {event.eventTypeRid && (
                    <View className="type-badge-floating">
                      <Text className="type-text">{getEventTypeName(event.eventTypeRid)}</Text>
                    </View>
                  )}
                </View>

                <View className="enhanced-activity-info">
                  <View className="info-header">
                    <Text className="enhanced-activity-title">{event.title}</Text>
                    <View className="activity-date">
                      <Text>{formatDate(event.startTime)}</Text>
                    </View>
                  </View>

                  <View className="info-content">
                    <Text className="enhanced-activity-desc">
                      {event.description || '暂无描述'}
                    </Text>

                    <View className="enhanced-activity-meta">
                      <View className="enhanced-meta-item">
                        <Text>{event.location || '线上'}</Text>
                      </View>
                      <View className="enhanced-meta-item">
                        <Text className="meta-icon">TIME</Text>
                        <Text>{formatTime(event.startTime)}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="info-footer">
                    <View className="view-button">
                      <Text>回顾精彩</Text>
                      <Text className="button-icon">→</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="enhanced-empty-container">
            <Text className="empty-icon">🎞️</Text>
            <Text className="empty-title">暂无回顾</Text>
            <Text className="empty-subtitle">美好正在发生，敬请期待</Text>
          </View>
        )}

        {!loading && events.length > 0 && pagination.totalPages > 1 && (
          <View style={{ marginTop: '40rpx' }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.limit}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </View>
        )}

        <View style={{ height: '60rpx' }}></View>
      </View>
    </ScrollView>
  );
};

export default PastActivities;
