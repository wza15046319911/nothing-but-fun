import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Button, Tag } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { carpoolApi, CarpoolPost, CarpoolQueryParams, formatPrice, formatDateTime, getStatusText, getStatusClassName } from '../../services/carpool'
import Pagination from '../../components/Pagination'
import './index.less'

const Carpool: React.FC = () => {
  // State management
  const [carpools, setCarpools] = useState<CarpoolPost[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // State for query parameters
  const [queryParams, setQueryParams] = useState<CarpoolQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'departureTime',
    order: 'asc'
  })

  // Load carpool data
  const loadCarpools = async (showLoading = true, params: CarpoolQueryParams = queryParams) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      const response = await carpoolApi.getAllCarpools(params)
      setCarpools(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('加载拼车信息失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCarpools(false)
  }

  // Handle pagination change
  const handlePageChange = (page: number) => {
    const newParams = {
      ...queryParams,
      page
    }
    setQueryParams(newParams)
    loadCarpools(true, newParams)
  }

  // Handle carpool card click
  const handleCarpoolClick = (_carpool: CarpoolPost) => {
    Taro.showToast({
      title: '详情功能开发中',
      icon: 'none',
      duration: 2000
    })
  }

  // Handle post new carpool
  const handlePostCarpool = () => {
    Taro.navigateTo({
      url: '/pages/carpool/publish/index'
    })
  }

  // Load data on component mount
  useEffect(() => {
    loadCarpools()
  }, [])

  return (
    <View className='carpool-container'>
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className='content' scrollY>
          {/* Header */}
          <View className='header-section'>
            <Text className='page-title'>拼车信息</Text>
            <Button 
              type="primary" 
              size="small" 
              className='post-button'
              onClick={handlePostCarpool}
            >
              发布拼车
            </Button>
          </View>

          {/* Loading */}
          {loading && (
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          )}

          {/* Carpool List */}
          {!loading && (
            <View className='carpool-list'>
              {carpools.length > 0 ? (
                carpools.map(carpool => {
                  const { date, time } = formatDateTime(carpool.departureTime)
                  return (
                    <View 
                      key={carpool.id} 
                      className='carpool-card'
                      onClick={() => handleCarpoolClick(carpool)}
                    >
                      <View className='card-header'>
                        <View className='route-info'>
                          <View className='route-points'>
                            <Text className='start-point'>{carpool.origin}</Text>
                            <Text className='route-arrow'>→</Text>
                            <Text className='end-point'>{carpool.destination}</Text>
                          </View>
                          <View className='route-time'>
                            <Text className='time-date'>{date}</Text>
                            <Text className='time-hour'>{time}</Text>
                          </View>
                        </View>
                        <View className='status-info'>
                          <Tag 
                            type={carpool.status === 'open' ? 'success' : 'warning'}
                            className={getStatusClassName(carpool.status)}
                          >
                            {getStatusText(carpool.status)}
                          </Tag>
                        </View>
                      </View>
                      
                      <View className='card-body'>
                        <View className='card-info'>
                          <View className='info-item'>
                            <Text className='info-label'>价格</Text>
                            <Text className='info-value'>{formatPrice(carpool.price)}</Text>
                          </View>
                          <View className='info-item'>
                            <Text className='info-label'>座位</Text>
                            <Text className='info-value'>{carpool.availableSeats}个</Text>
                          </View>
                          <View className='info-item'>
                            <Text className='info-label'>发布时间</Text>
                            <Text className='info-value'>{formatDateTime(carpool.createdAt).date}</Text>
                          </View>
                        </View>
                        
                        {carpool.description && (
                          <View className='card-description'>
                            <Text className='description-text'>{carpool.description}</Text>
                          </View>
                        )}
                      </View>
                      
                      <View className='card-footer'>
                        <Button 
                          type={carpool.status === 'open' ? 'primary' : 'default'}
                          size="small"
                          disabled={carpool.status !== 'open'}
                          className='action-button'
                        >
                          {carpool.status === 'open' ? '联系车主' : '不可预订'}
                        </Button>
                      </View>
                    </View>
                  )
                })
              ) : (
                <Empty 
                  description="暂无拼车信息"
                  imageSize={120}
                >
                  <Button 
                    type="primary" 
                    onClick={handlePostCarpool}
                    className='empty-action-button'
                  >
                    发布拼车信息
                  </Button>
                </Empty>
              )}
            </View>
          )}

          {/* Pagination */}
          {!loading && carpools.length > 0 && pagination.totalPages > 1 && (
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
  )
}

export default Carpool
