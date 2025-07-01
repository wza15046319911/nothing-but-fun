import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { rentalHouseApi, RentalHouse as RentalHouseType, RentalHouseQueryParams } from '../../services/rental_house'
import './index.less'

const RentalHouse: React.FC = () => {
  // 状态管理
  const [houses, setHouses] = useState<RentalHouseType[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSuburb, setSelectedSuburb] = useState<string>('')
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('')
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})

  // 常用区域
  const popularSuburbs = [
    '全部', 'Brisbane City', 'South Brisbane', 'Fortitude Valley', 
    'Paddington', 'West End', 'St Lucia', 'Bulimba'
  ]

  // 房屋类型
  const propertyTypes = [
    { value: '', label: '全部类型' },
    { value: 'apartment', label: '公寓' },
    { value: 'house', label: '别墅' },
    { value: 'townhouse', label: '联排别墅' },
    { value: 'studio', label: '单间公寓' }
  ]

  // 加载房源数据
  const loadHouses = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      const params: RentalHouseQueryParams = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      // 添加筛选条件
      if (selectedSuburb && selectedSuburb !== '全部') {
        params.suburb = selectedSuburb
      }
      if (selectedPropertyType) {
        params.propertyType = selectedPropertyType
      }
      if (priceRange.min) {
        params.minPrice = priceRange.min
      }
      if (priceRange.max) {
        params.maxPrice = priceRange.max
      }
      
      const response = await rentalHouseApi.getAllRentalHouses(params)
      setHouses(response.data || [])
    } catch (error) {
      console.error('加载房源失败:', error)
      Taro.showToast({
        title: '加载失败，请稍后重试',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadHouses(false)
  }

  // 区域筛选
  const handleSuburbFilter = (suburb: string) => {
    setSelectedSuburb(suburb)
  }

  // 房屋类型筛选
  const handlePropertyTypeFilter = (type: string) => {
    setSelectedPropertyType(type)
  }

  // 房源点击事件
  const handleHouseClick = (house: RentalHouseType) => {
    Taro.navigateTo({
      url: `/pages/rental-house/detail/index?id=${house.id}`
    })
  }

  // 格式化价格显示
  const formatPrice = (price: string) => {
    return `$${price}/周`
  }

  // 格式化房屋配置
  const formatPropertyConfig = (house: RentalHouseType) => {
    let config = `${house.bedrooms}卧${house.bathrooms}卫`
    if (house.carSpaces > 0) {
      config += `${house.carSpaces}车位`
    }
    if (house.studyRooms > 0) {
      config += `${house.studyRooms}书房`
    }
    return config
  }

  // 获取房屋特色标签
  const getFeatureTags = (features: string[]) => {
    const featureMap = {
      'pool': '游泳池',
      'gym': '健身房',
      'balcony': '阳台',
      'air_conditioning': '空调',
      'garden': '花园',
      'parking': '停车位',
      'furnished': '已装修',
      'pet_friendly': '允许宠物'
    }
    
    return features.slice(0, 3).map(feature => 
      featureMap[feature] || feature
    )
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadHouses()
  }, [selectedSuburb, selectedPropertyType, priceRange])

  return (
    <View className='rental-house-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>租房信息</Text>
          <Text className='subtitle'>找到您理想的家</Text>
        </View>
      </View>

      {/* 筛选栏 */}
      <View className='filter-section'>
        {/* 区域筛选 */}
        <ScrollView className='suburb-filter' scrollX>
          <View className='filter-list'>
            {popularSuburbs.map(suburb => (
              <View 
                key={suburb}
                className={`filter-item ${selectedSuburb === suburb || (suburb === '全部' && !selectedSuburb) ? 'active' : ''}`}
                onClick={() => handleSuburbFilter(suburb === '全部' ? '' : suburb)}
              >
                <Text className='filter-text'>{suburb}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 房屋类型筛选 */}
        <ScrollView className='type-filter' scrollX>
          <View className='filter-list'>
            {propertyTypes.map(type => (
              <View 
                key={type.value}
                className={`filter-item ${selectedPropertyType === type.value ? 'active' : ''}`}
                onClick={() => handlePropertyTypeFilter(type.value)}
              >
                <Text className='filter-text'>{type.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 房源列表 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <ScrollView className='content' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading type="spinner" />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : houses.length === 0 ? (
            <Empty 
              description="暂无房源信息"
              imageSize={120}
            />
          ) : (
            <View className='houses-list'>
              {houses.map(house => (
                <View 
                  key={house.id} 
                  className='house-card'
                  onClick={() => handleHouseClick(house)}
                >
                  {/* 房源图片 */}
                  <View className='house-image-container'>
                    <Image 
                      className='house-image'
                      src={house.images[house.mainImageIndex] || house.images[0]}
                      mode='aspectFill'
                      lazyLoad
                    />
                    {/* 房屋类型标签 */}
                    <View className='property-type-badge'>
                      {house.propertyType === 'apartment' ? '公寓' : 
                       house.propertyType === 'house' ? '别墅' : 
                       house.propertyType === 'townhouse' ? '联排' : '其他'}
                    </View>
                    {/* 是否配家具 */}
                    {house.furnished && (
                      <View className='furnished-badge'>
                        已配家具
                      </View>
                    )}
                  </View>

                  {/* 房源信息 */}
                  <View className='house-info'>
                    <View className='house-header'>
                      <Text className='house-title'>{house.title}</Text>
                      <Text className='house-price'>{formatPrice(house.weeklyPrice)}</Text>
                    </View>
                    
                    <View className='house-location'>
                      <Text className='location-text'>📍 {house.streetAddress}, {house.suburb}</Text>
                    </View>

                    <View className='house-config'>
                      <Text className='config-text'>{formatPropertyConfig(house)}</Text>
                      <Text className='area-text'>• {house.floorArea}㎡</Text>
                    </View>
                    
                    {/* 房屋特色 */}
                    <View className='house-features'>
                      {getFeatureTags(house.features).map((feature, index) => (
                        <View key={index} className='feature-tag'>
                          <Text className='feature-text'>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    {/* 底部信息 */}
                    <View className='house-footer'>
                      <View className='contact-info'>
                        <Text className='agency-name'>{house.agencyName}</Text>
                      </View>
                      <View className='house-stats'>
                        <Text className='view-count'>👁 {house.viewCount}</Text>
                        <Text className='available-date'>
                          {new Date(house.availableFrom).toLocaleDateString('zh-CN')} 起租
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
    </View>
  )
}

export default RentalHouse 