import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Picker, Range, Button, Cell } from '@nutui/nutui-react-taro'
import { EventFilters } from '../../services/events'
import { useEventTypes } from '../../hooks/useTypes'
import './index.less'

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void
  initialFilters?: EventFilters
}

const EventFiltersComponent: React.FC<EventFiltersProps> = ({
  onFiltersChange,
  initialFilters = {}
}) => {
  // Use event types hook
  const { eventTypes: allEventTypes } = useEventTypes()
  const [showPicker, setShowPicker] = useState<boolean>(false);

  // Add "全部类型" option to the beginning
  const eventTypes = [{ id: 0, name: '全部类型' }, ...allEventTypes]

  // no marks needed; style aligned with secondhand


  const [selectedEventType, setSelectedEventType] = useState<string>(initialFilters.event_type || '0')
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.priceFrom || 0,
    initialFilters.priceTo ?? 100
  ])
  const [showFilters, setShowFilters] = useState(true)

  // Handle event type change
  const handleEventTypeChange = (value: string) => {
    setSelectedEventType(value)
    const filters: EventFilters = {
      event_type: value === '0' ? undefined : value,
      priceFrom: priceRange[0] > 0 ? priceRange[0] : undefined,
      priceTo: priceRange[1] < 100 ? priceRange[1] : undefined
    }
    onFiltersChange(filters)
  }

  // Handle price range change
  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value)
    const filters: EventFilters = {
      event_type: selectedEventType === '0' ? undefined : selectedEventType,
      priceFrom: value[0] > 0 ? value[0] : undefined,
      priceTo: value[1] < 100 ? value[1] : undefined
    }
    onFiltersChange(filters)
  }

  // Reset filters
  const handleResetFilters = () => {
    setSelectedEventType('0')
    setPriceRange([0, 100])
    onFiltersChange({})
  }

  // Get event type options for picker
  const eventTypeOptions = eventTypes.map(type => ({
    text: type.name || '未知类型',
    value: type.id.toString()
  }))

  return (
    <View className='event-filters'>
      <View className='filter-toggle' onClick={() => setShowFilters(!showFilters)}>
        <Text className='toggle-text'>筛选条件</Text>
        <Text className={`toggle-icon ${showFilters ? 'active' : ''}`}>▼</Text>
      </View>

      {showFilters && (
        <View className='filter-content'>
          {/* Event Type Filter */}
          <View className='filter-item'>
            <Text className='filter-label'>活动类型</Text>
            <Cell title={eventTypes.find(type => type.id.toString() === (selectedEventType || '0'))?.name || '全部类型'} onClick={() => setShowPicker(!showPicker)} />
            <Picker
              visible={showPicker}
              options={eventTypeOptions}
              defaultValue={selectedEventType ? [selectedEventType] : ['0']}
              value={selectedEventType ? [selectedEventType] : ['0']}
              onConfirm={(values) => {
                const selectedValue = Array.isArray(values) && values.length > 0 ? values[0] : '0'
                const valueStr = typeof selectedValue === 'object' && 'value' in selectedValue
                  ? selectedValue.value.toString()
                  : selectedValue.toString()
                handleEventTypeChange(valueStr)
                setShowPicker(false)

              }
            }
            onClose={() => setShowPicker(false)}
            >
              <View className='picker-trigger'>
                <Text className='picker-text'>
                  {eventTypes.find(type => type.id.toString() === (selectedEventType || '0'))?.name || '全部类型'}
                </Text>
                <Text className='picker-arrow'>▼</Text>
              </View>
            </Picker>
          </View>

          {/* Price Range Filter */}
          <View className='filter-item'>
            <Text className='filter-label'>价格范围</Text>
            <Cell title="价格范围" style={{ padding: '40px 18px' }}>
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

export default EventFiltersComponent
