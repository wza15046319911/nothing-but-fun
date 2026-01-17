import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { PullToRefresh, Loading, Empty, Button, Tag } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import {
  carpoolApi,
  CarpoolPost,
  CarpoolQueryParams,
  formatPrice,
  formatDateTime,
  getStatusText,
  getStatusClassName,
} from '../../services/carpool';
import Pagination from '../../components/Pagination';
import './index.less';

const Carpool: React.FC = () => {
  // State management
  const [carpools, setCarpools] = useState<CarpoolPost[]>([]);
  const [loading, setLoading] = useState(false);
  // const [refreshing, setRefreshing] = useState(false)

  // Local UI state for filters & sort
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // State for query parameters
  const [queryParams, setQueryParams] = useState<CarpoolQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'departureTime',
    order: 'asc',
  });

  // Load carpool data
  const loadCarpools = async (showLoading = true, params: CarpoolQueryParams = queryParams) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await carpoolApi.getAllCarpools(params);
      setCarpools(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('加载拼车信息失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
      // setRefreshing(false)
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    // setRefreshing(true)
    await loadCarpools(false);
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    const newParams = {
      ...queryParams,
      page,
    };
    setQueryParams(newParams);
    loadCarpools(true, newParams);
  };

  // Derived list after local filter & sort
  const displayCarpools = useMemo(() => {
    let list = [...carpools];

    // Text filters
    if (originQuery.trim()) {
      const q = originQuery.trim().toLowerCase();
      list = list.filter((x) => x.origin.toLowerCase().includes(q));
    }
    if (destinationQuery.trim()) {
      const q = destinationQuery.trim().toLowerCase();
      list = list.filter((x) => x.destination.toLowerCase().includes(q));
    }

    // Date filter (all / today / tomorrow)
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      list = list.filter((item) => {
        const dep = new Date(item.departureTime);
        const depDay = new Date(dep.getFullYear(), dep.getMonth(), dep.getDate());
        if (dateFilter === 'today') return depDay.getTime() === today.getTime();
        if (dateFilter === 'tomorrow') return depDay.getTime() === tomorrow.getTime();
        return true;
      });
    }

    return list;
  }, [carpools, originQuery, destinationQuery, dateFilter]);

  // Handle carpool card click
  const handleCarpoolClick = (_carpool: CarpoolPost) => {
    Taro.showToast({ title: '详情功能开发中', icon: 'none', duration: 1500 });
  };

  // Quick helpers
  const swapOriginDestination = () => {
    setOriginQuery((prev) => {
      const newOrigin = destinationQuery;
      setDestinationQuery(prev);
      return newOrigin;
    });
  };

  const copyCarpoolInfo = async (carpool: CarpoolPost) => {
    const { date, time } = formatDateTime(carpool.departureTime);
    const text = `拼车：${carpool.origin} → ${carpool.destination}\n出发：${date} ${time}\n价格：${formatPrice(carpool.price)}\n座位：${carpool.availableSeats}个${carpool.description ? `\n备注：${carpool.description}` : ''}`;
    try {
      await Taro.setClipboardData({ data: text });
      Taro.showToast({ title: '已复制', icon: 'success', duration: 1200 });
    } catch {
      Taro.showToast({ title: '复制失败', icon: 'none' });
    }
  };

  // Handle post new carpool
  const handlePostCarpool = () => {
    Taro.navigateTo({
      url: '/pages/carpool/publish/index',
    });
  };

  // Load data on component mount
  useEffect(() => {
    loadCarpools();
  }, []);

  return (
    <View className="carpool-container">
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className="content" scrollY>
          {/* Header */}
          <View className="header-section">
            <Text className="page-title">拼车信息</Text>
            {/* 司机发布功能已暂时关闭 */}
            <Button type="primary" size="small" className="post-button" onClick={handlePostCarpool}>
              发布拼车
            </Button>
          </View>

          {/* Filter Bar */}
          <View className="filter-section">
            <View className="route-filters">
              <View className="input-wrapper">
                <Text className="input-label">出发</Text>
                <Input
                  className="route-input"
                  value={originQuery}
                  placeholder="例如：Toowong"
                  onInput={(e) => setOriginQuery((e.detail as any).value)}
                />
              </View>
              <Button size="small" className="swap-button" onClick={swapOriginDestination}>
                ⇄
              </Button>
              <View className="input-wrapper">
                <Text className="input-label">到达</Text>
                <Input
                  className="route-input"
                  value={destinationQuery}
                  placeholder="例如：UQ"
                  onInput={(e) => setDestinationQuery((e.detail as any).value)}
                />
              </View>
            </View>

            <View className="chips-row">
              <View
                className={`chip ${dateFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDateFilter('all')}
              >
                全部
              </View>
              <View
                className={`chip ${dateFilter === 'today' ? 'active' : ''}`}
                onClick={() => setDateFilter('today')}
              >
                今天
              </View>
              <View
                className={`chip ${dateFilter === 'tomorrow' ? 'active' : ''}`}
                onClick={() => setDateFilter('tomorrow')}
              >
                明天
              </View>
            </View>
          </View>

          {/* Loading */}
          {loading && (
            <View className="loading-container">
              <Loading type="spinner" />
              <Text className="loading-text">加载中...</Text>
            </View>
          )}

          {/* Carpool List */}
          {!loading && (
            <View className="carpool-list">
              {displayCarpools.length > 0 ? (
                displayCarpools.map((carpool) => {
                  const { date, time } = formatDateTime(carpool.departureTime);
                  return (
                    <View
                      key={carpool.id}
                      className="carpool-card"
                      onClick={() => handleCarpoolClick(carpool)}
                    >
                      <View className="card-header">
                        <View className="route-info">
                          <View className="route-points">
                            <Text className="start-point">{carpool.origin}</Text>
                            <Text className="route-arrow">→</Text>
                            <Text className="end-point">{carpool.destination}</Text>
                          </View>
                          <View className="route-time">
                            <Text className="time-date">{date}</Text>
                            <Text className="time-hour">{time}</Text>
                          </View>
                        </View>
                        <View className="status-info">
                          <Tag
                            type={carpool.status === 'open' ? 'success' : 'warning'}
                            className={getStatusClassName(carpool.status)}
                          >
                            {getStatusText(carpool.status)}
                          </Tag>
                        </View>
                      </View>

                      <View className="card-body">
                        <View className="card-info">
                          <View className="info-item">
                            <Text className="info-label">价格</Text>
                            <Text className="info-value">{formatPrice(carpool.price)}</Text>
                          </View>
                          <View className="info-item">
                            <Text className="info-label">座位</Text>
                            <Text className="info-value">{carpool.availableSeats}个</Text>
                          </View>
                          <View className="info-item">
                            <Text className="info-label">发布时间</Text>
                            <Text className="info-value">
                              {formatDateTime(carpool.createdAt).date}
                            </Text>
                          </View>
                        </View>

                        {carpool.description && (
                          <View className="card-description">
                            <Text className="description-text">{carpool.description}</Text>
                          </View>
                        )}
                      </View>

                      <View className="card-footer">
                        <Button
                          type={carpool.status === 'open' ? 'primary' : 'default'}
                          size="small"
                          disabled={carpool.status !== 'open'}
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCarpoolInfo(carpool);
                          }}
                        >
                          {carpool.status === 'open' ? '复制信息联系' : '复制信息'}
                        </Button>
                        <Button
                          size="small"
                          className="action-button secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCarpoolInfo(carpool);
                          }}
                        >
                          复制
                        </Button>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Empty description="暂无拼车信息" imageSize={120}>
                  {/* 司机发布功能已暂时关闭 */}
                  <Button
                    type="primary"
                    onClick={handlePostCarpool}
                    className="empty-action-button"
                  >
                    发布拼车信息
                  </Button>
                </Empty>
              )}
            </View>
          )}

          {/* Pagination */}
          {!loading &&
            originQuery.trim() === '' &&
            destinationQuery.trim() === '' &&
            dateFilter === 'all' &&
            displayCarpools.length > 0 &&
            pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
        </ScrollView>
      </PullToRefresh>
    </View>
  );
};

export default Carpool;
