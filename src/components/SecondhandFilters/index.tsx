import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Range, Button, Cell } from '@nutui/nutui-react-taro'
import { SecondhandFilters } from '../../services/secondhand'
import './index.less'

interface SecondhandFiltersProps {
  onFiltersChange: (filters: SecondhandFilters) => void
  initialFilters?: SecondhandFilters
}

const SecondhandFiltersComponent: React.FC<SecondhandFiltersProps> = ({ 
  onFiltersChange, 
  initialFilters = {} 
}) => {

  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.priceFrom || 0, 
    initialFilters.priceTo || 100
  ])
  const [showFilters, setShowFilters] = useState(true)

  // Handle price range change
  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value)
    const filters: SecondhandFilters = {
      ...initialFilters,
      priceFrom: value[0] > 0 ? value[0] : undefined,
      priceTo: value[1] < 100 ? value[1] : undefined
    }
    onFiltersChange(filters)
  }

  // Reset filters
  const handleResetFilters = () => {
    setPriceRange([0, 100])
    onFiltersChange({})
  }

  return (
    <View className='secondhand-filters'>
      <View className='filter-toggle' onClick={() => setShowFilters(!showFilters)}>
        <Text className='toggle-text'>价格筛选</Text>
        <Text className={`toggle-icon ${showFilters ? 'active' : ''}`}>▼</Text>
      </View>

      {showFilters && (
        <View className='filter-content'>
          {/* Price Range Filter */}
          <View className='filter-item'>
            <Text className='filter-label'>价格范围</Text>
            {/* <View className='price-range-container'> */}
              <Cell title="价格范围" style={{padding: '40px 18px'}}>
                <Range
                  value={priceRange}
                  min={0}
                  max={100}
                  step={1}
                  range
                  onChange={handlePriceRangeChange}
                  className='price-range'
                />
              </Cell>

              
            {/* </View> */}
          </View>

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

export default SecondhandFiltersComponent
