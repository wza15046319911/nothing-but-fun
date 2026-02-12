import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Toast, Calendar } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import { eventsApi, Event, EventFilters } from '../../services/events';
import Pagination from '../../components/Pagination';
import { useEventTypes } from '../../hooks/useTypes';
import './index.less';

// Helper function to format date to YYYY-MM-DD
const formatDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Get today's date string
const getTodayString = () => formatDateString(new Date());

// Get date range (7 days) starting from base date
const getWeekRangeStrings = (baseDate: Date) => {
  const start = new Date(baseDate);
  const end = new Date(baseDate);
  end.setDate(start.getDate() + 6);
  return {
    startDate: formatDateString(start),
    endDate: formatDateString(end),
  };
};

// Helper function to generate dates for a week starting from a base date
const generateDatesFromBase = (baseDate: Date) => {
  const dates: any = [];
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  const todayString = formatDateString(today);

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    const dateString = formatDateString(date);

    dates.push({
      date: date,
      day: date.getDate(),
      weekday: days[date.getDay()],
      isToday: dateString === todayString,
      month: date.getMonth() + 1,
      dateString: dateString,
    });
  }

  return dates;
};

const RecentActivities: React.FC = () => {
  const { getEventTypeName } = useEventTypes();

  // State
  const [baseDate, setBaseDate] = useState<Date>(new Date()); // 横向日期列表的起始日期
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // 初始为 null，等数据加载后再设置
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  // 根据 baseDate 动态生成横向日期列表
  const dates = useMemo(() => generateDatesFromBase(baseDate), [baseDate]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [initialDateSet, setInitialDateSet] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const initialWeekRange = getWeekRangeStrings(new Date());
  const [currentFilters, setCurrentFilters] = useState<EventFilters>({
    isHistorical: false,
    page: 1,
    limit: 50, // 增加数量以涵盖更多未来活动
    startDate: initialWeekRange.startDate,
    endDate: initialWeekRange.endDate,
    sortBy: 'sort',
    sortOrder: 'asc',
  });

  // 找到第一个有活动的日期
  const findFirstDateWithEvents = (eventList: Event[]) => {
    for (const dateInfo of dates) {
      const hasEvent = eventList.some((event) => {
        const eventDate = new Date(event.startTime);
        const eventDateString = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        return eventDateString === dateInfo.dateString;
      });
      if (hasEvent) {
        return dateInfo.dateString;
      }
    }
    return dates[0].dateString; // 如果没有活动，默认选今天
  };

  const fetchUpcomingEvents = async (
    showLoading = true,
    filters: EventFilters = currentFilters
  ) => {
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

      // 首次加载时，自动选中第一个有活动的日期
      if (!initialDateSet && response.data.length > 0) {
        const firstDateWithEvents = findFirstDateWithEvents(response.data);
        setSelectedDate(firstDateWithEvents);
        setInitialDateSet(true);
      } else if (!initialDateSet) {
        // 没有活动，默认选今天
        setSelectedDate(dates[0].dateString);
        setInitialDateSet(true);
      }
    } catch (error) {
      console.error('获取活动失败:', error);
      showToastMessage('加载失败，请稍后重试');
      // 加载失败时默认选今天
      if (!initialDateSet) {
        setSelectedDate(dates[0].dateString);
        setInitialDateSet(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: EventFilters) => {
    const newFilters = {
      ...currentFilters,
      ...filters,
      isHistorical: false,
      page: 1,
      limit: 50,
    };
    setCurrentFilters(newFilters);
    fetchUpcomingEvents(true, newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = {
      ...currentFilters,
      page,
    };
    setCurrentFilters(newFilters);
    fetchUpcomingEvents(true, newFilters);
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const applyWeekRange = (date: Date, dateString?: string, showLoading = true) => {
    const range = getWeekRangeStrings(date);
    const newFilters = {
      ...currentFilters,
      isHistorical: false,
      page: 1,
      limit: 50,
      startDate: range.startDate,
      endDate: range.endDate,
    };
    setCurrentFilters(newFilters);
    setBaseDate(date);
    setSelectedDate(dateString || formatDateString(date));
    fetchUpcomingEvents(showLoading, newFilters);
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const filteredEvents = selectedDate
    ? events.filter((event) => {
        const eventDate = new Date(event.startTime);
        const eventDateString = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        return eventDateString === selectedDate;
      })
    : [];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleEventClick = (event: Event) => {
    Taro.navigateTo({
      url: `/pages/events/detail/index?id=${event.id}`,
    });
  };

  const onConfirmCalendar = (date: any) => {
    // NutUI Calendar returns date in format: YYYY-MM-DD string or Date object
    let selectedDateObj: Date;

    if (typeof date === 'string') {
      selectedDateObj = new Date(date);
    } else if (date instanceof Date) {
      selectedDateObj = date;
    } else if (Array.isArray(date) && date.length > 3) {
      // sometimes returns [d, m, y, 'yyyy-mm-dd']
      selectedDateObj = new Date(date[3]);
    } else {
      // Fallback: try to convert to string
      selectedDateObj = new Date(String(date));
    }
    const dateString = formatDateString(selectedDateObj);

    // 更新选中的日期并按周拉取活动
    applyWeekRange(selectedDateObj, dateString);

    setCalendarVisible(false);
  };

  const getSelectedDateInfo = () => {
    if (!selectedDate) return dates[0];

    // Check if in generated 7 days
    const found = dates.find((date) => date.dateString === selectedDate);
    if (found) return found;

    // Create info for date outside 7-day range
    const date = new Date(selectedDate);
    if (isNaN(date.getTime())) return dates[0]; // Invalid date fallback

    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return {
      date: date,
      day: date.getDate(),
      weekday: days[date.getDay()],
      isToday: false,
      month: date.getMonth() + 1,
      dateString: selectedDate,
    };
  };

  const selectedDateInfo = getSelectedDateInfo();

  return (
    <ScrollView className="enhanced-events-container" scrollY style={{ height: '100vh' }}>
      {/* Immersive Header */}
      <View className="enhanced-header">
        <View className="header-content">
          <View className="title-section">
            <Text className="enhanced-title">布玩新鲜事</Text>
            <Text className="enhanced-subtitle">精选活动日历，发现玩乐灵感</Text>
          </View>
        </View>
      </View>

      {/* Date Navigation (Sticky) */}
      <View className="enhanced-date-nav">
        <Text className="month-text">{selectedDateInfo.month}月</Text>
        <View className="scroll-wrapper">
          <ScrollView className="date-scroll" scrollX showScrollbar={false}>
            {dates.map((date, index) => (
              <View
                key={index}
                className={`date-item ${date.dateString === selectedDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(date.dateString)}
              >
                <Text className="day-number">{date.day}</Text>
                <Text className="day-name">{date.isToday ? '今天' : `周${date.weekday}`}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        {/* 如果当前周不包含今天，显示回到今天按钮 */}
        {!dates.some((d) => d.isToday) && (
          <View
            className="back-to-today"
            onClick={() => {
              const today = new Date();
              applyWeekRange(today);
            }}
          >
            <Text>今</Text>
          </View>
        )}
        <View className="calendar-trigger" onClick={() => setCalendarVisible(true)}>
          <Text>📅</Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="enhanced-content">
        <View className="activity-section">
          <View className="section-title">
            {selectedDate === getTodayString()
              ? '今日活动'
              : `${selectedDateInfo.month}月${selectedDateInfo.day}日 · 周${selectedDateInfo.weekday}`}
          </View>

          {loading ? (
            <View className="enhanced-loading-container">
              <View className="loading-dots">
                <View className="dot dot-1"></View>
                <View className="dot dot-2"></View>
                <View className="dot dot-3"></View>
              </View>
              <Text>正在加载活动...</Text>
            </View>
          ) : filteredEvents.length > 0 ? (
            <View className="events-list">
              {filteredEvents.map((event, index) => (
                <View
                  key={event.id}
                  className="enhanced-event-card"
                  onClick={() => handleEventClick(event)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <View className="enhanced-event-image-container">
                    <Image
                      className="enhanced-event-image"
                      src={
                        event.imageUrls?.[0] ||
                        event.image ||
                        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'
                      }
                      mode="aspectFill"
                      lazyLoad
                    />
                    <View className="image-overlay"></View>

                    <View className={`price-badge-floating ${event.free ? 'free' : ''}`}>
                      <Text>
                        {event.free
                          ? '免费'
                          : (() => {
                              if (event.priceFrom !== undefined && event.priceFrom !== null) {
                                if (
                                  event.priceTo !== undefined &&
                                  event.priceTo !== null &&
                                  event.priceTo !== event.priceFrom
                                ) {
                                  return `$${event.priceFrom}-${event.priceTo}`;
                                }
                                return `$${event.priceFrom}`;
                              }
                              if (event.price !== undefined && event.price !== null) {
                                return `$${event.price}`;
                              }
                              return '待定';
                            })()}
                      </Text>
                    </View>

                    {event.eventTypeRid && (
                      <View className="event-type-badge">
                        <Text>{getEventTypeName(event.eventTypeRid)}</Text>
                      </View>
                    )}
                  </View>

                  <View className="enhanced-event-info">
                    <View className="info-header">
                      <Text className="enhanced-event-title">{event.title}</Text>
                      <Text className="meta-time">{formatTime(event.startTime)}</Text>
                    </View>

                    <View className="info-content">
                      <View className="event-time-location">
                        <View className="time-location-item">
                          <Text>📍</Text>
                          <Text>{event.location || '线上活动'}</Text>
                        </View>
                        <View className="time-location-item">
                          <Text>👥</Text>
                          <Text>{event.capacity ? `${event.capacity}人` : '不限'}</Text>
                        </View>
                      </View>
                      <Text className="enhanced-event-description">
                        {event.description || '暂无描述'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="enhanced-empty-container">
              <Text className="empty-icon">🍃</Text>
              <Text className="empty-title">
                {selectedDate === getTodayString() ? '今日暂无活动' : '当日暂无活动'}
              </Text>
              <Text className="empty-subtitle">去看看其他日期的精彩吧</Text>
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
        </View>

        <View style={{ height: '60rpx' }}></View>
      </View>

      <Toast
        content={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />

      {calendarVisible && (
        <Calendar
          visible={calendarVisible}
          defaultValue={selectedDate || undefined}
          startDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
          onClose={() => setCalendarVisible(false)}
          onConfirm={onConfirmCalendar}
        />
      )}
    </ScrollView>
  );
};

export default RecentActivities;
