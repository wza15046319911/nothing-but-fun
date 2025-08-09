import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Picker, Range, Button, Cell } from '@nutui/nutui-react-taro'
import { RestaurantFilters } from '../../services/restaurant'
import { useRestaurantTypes } from '../../hooks/useTypes'
import './index.less'

interface RestaurantFiltersProps {
  onFiltersChange: (filters: RestaurantFilters) => void
  initialFilters?: RestaurantFilters
}

const RestaurantFiltersComponent: React.FC<RestaurantFiltersProps> = ({ 
  onFiltersChange, 
  initialFilters = {} 
}) => {
  // Use restaurant types hook
  const { restaurantTypes: allRestaurantTypes, priceRanges: allPriceRanges } = useRestaurantTypes()
  
  // Add "全部" options to the beginning
  const restaurantTypes = [{ id: 0, name: '全部类型' }, ...allRestaurantTypes]
  const priceRanges = [{ id: 0, name: '全部价位' }, ...allPriceRanges]

  const [selectedRestaurantType, setSelectedRestaurantType] = useState<string>(initialFilters.restaurantTypeRid || '0')
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(initialFilters.priceRangeRid || '0')
  const [ratingRange, setRatingRange] = useState<[number, number]>([
    initialFilters.minRating || 0,
    5
  ])
  const [showFilters, setShowFilters] = useState(true)

  // Unified picker state management
  const [showPicker, setShowPicker] = useState<{
    restaurantType: boolean
    priceRange: boolean
  }>({
    restaurantType: false,
    priceRange: false
  })

  // Rating marks for better UX
  const [ratingMarks] = useState({
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5'
  })

  // Handle restaurant type change
  const handleRestaurantTypeChange = (value: string) => {
    setSelectedRestaurantType(value)
    const filters: RestaurantFilters = {
      ...initialFilters,
      restaurantTypeRid: value === '0' ? undefined : value
    }
    onFiltersChange(filters)
  }

  // Handle price range change
  const handlePriceRangeChange = (value: string) => {
    setSelectedPriceRange(value)
    const filters: RestaurantFilters = {
      ...initialFilters,
      priceRangeRid: value === '0' ? undefined : value
    }
    onFiltersChange(filters)
  }

  // Handle rating range change
  const handleRatingRangeChange = (value: [number, number]) => {
    setRatingRange(value)
    const filters: RestaurantFilters = {
      ...initialFilters,
      minRating: value[0] > 0 ? value[0] : undefined
    }
    onFiltersChange(filters)
  }

  // Reset filters
  const handleResetFilters = () => {
    setSelectedRestaurantType('0')
    setSelectedPriceRange('0')
    setRatingRange([0, 5])
    onFiltersChange({})
  }

  // Toggle picker visibility
  const togglePicker = (pickerType: keyof typeof showPicker) => {
    setShowPicker(prev => ({
      ...prev,
      [pickerType]: !prev[pickerType]
    }))
  }

  // Close picker
  const closePicker = (pickerType: keyof typeof showPicker) => {
    setShowPicker(prev => ({
      ...prev,
      [pickerType]: false
    }))
  }

  // Get options for pickers
  const restaurantTypeOptions = restaurantTypes.map(type => ({
    text: type.name || '未知类型',
    value: type.id.toString()
  }))

  const priceRangeOptions = priceRanges.map(range => ({
    text: range.name || '未知价位',
    value: range.id.toString()
  }))

  return (
    <View className='restaurant-filters'>
      <View className='filter-toggle' onClick={() => setShowFilters(!showFilters)}>
        <Text className='toggle-text'>筛选条件</Text>
        <Text className={`toggle-icon ${showFilters ? 'active' : ''}`}>▼</Text>
      </View>

      {showFilters && (
        <View className='filter-content'>
          {/* Restaurant Type Filter */}
          <View className='filter-item'>
            <Text className='filter-label'>餐厅类型</Text>
            <Cell
              title={restaurantTypes.find(type => type.id.toString() === selectedRestaurantType)?.name || '全部类型'}
              onClick={() => togglePicker('restaurantType')}
            />
            <Picker
              visible={showPicker.restaurantType}
              options={restaurantTypeOptions}
              defaultValue={selectedRestaurantType ? [selectedRestaurantType] : ['0']}
              value={selectedRestaurantType ? [selectedRestaurantType] : ['0']}
              onConfirm={(values) => {
                const selectedValue = Array.isArray(values) && values.length > 0 ? values[0] : '0'
                const valueStr = typeof selectedValue === 'object' && 'value' in selectedValue
                  ? selectedValue.value.toString()
                  : selectedValue.toString()
                handleRestaurantTypeChange(valueStr)
                closePicker('restaurantType')
              }}
              onClose={() => closePicker('restaurantType')}
            >
              <View className='picker-trigger'>
                <Text className='picker-text'>
                  {restaurantTypes.find(type => type.id.toString() === selectedRestaurantType)?.name || '全部类型'}
                </Text>
                <Text className='picker-arrow'>▼</Text>
              </View>
            </Picker>
          </View>

          {/* Price Range Filter */}
          <View className='filter-item'>
            <Text className='filter-label'>价格范围</Text>
            <Cell
              title={priceRanges.find(range => range.id.toString() === selectedPriceRange)?.name || '全部价位'}
              onClick={() => togglePicker('priceRange')}
            />
            <Picker
              visible={showPicker.priceRange}
              options={priceRangeOptions}
              defaultValue={selectedPriceRange ? [selectedPriceRange] : ['0']}
              value={selectedPriceRange ? [selectedPriceRange] : ['0']}
              onConfirm={(values) => {
                const selectedValue = Array.isArray(values) && values.length > 0 ? values[0] : '0'
                const valueStr = typeof selectedValue === 'object' && 'value' in selectedValue
                  ? selectedValue.value.toString()
                  : selectedValue.toString()
                handlePriceRangeChange(valueStr)
                closePicker('priceRange')
              }}
              onClose={() => closePicker('priceRange')}
            >
              <View className='picker-trigger'>
                <Text className='picker-text'>
                  {priceRanges.find(range => range.id.toString() === selectedPriceRange)?.name || '全部价位'}
                </Text>
                <Text className='picker-arrow'>▼</Text>
              </View>
            </Picker>
          </View>

          {/* Rating Range Filter */}
          {/* <View className='filter-item'>
            <Text className='filter-label'>最低评分</Text>
            <View className='rating-range-container'>
              <Text className='rating-text'>{ratingRange[0].toFixed(1)}★</Text>
              <Range
                value={ratingRange}
                min={0}
                max={5}
                step={0.5}
                marks={ratingMarks}
                onChange={handleRatingRangeChange}
                className='rating-range'
              />
              <Text className='rating-text'>{ratingRange[1].toFixed(1)}★</Text>
            </View>
            <View className='rating-labels'>
              <Text className='rating-label'>最低评分: {ratingRange[0].toFixed(1)}星以上</Text>
            </View>
          </View> */}

          {/* Reset Button */}
          <View className='filter-actions'>
            <Button 
              type="default" 
              size="small" 
              onClick={handleResetFilters}
              className='reset-button'
            >
              重置筛选
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default RestaurantFiltersComponent
