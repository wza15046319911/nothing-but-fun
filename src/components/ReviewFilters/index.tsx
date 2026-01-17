import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { Picker, Button, Range } from '@nutui/nutui-react-taro';
import { ReviewQueryParams } from '../../services/restaurant';
import './index.less';

interface ReviewFiltersProps {
  onFiltersChange: (filters: ReviewQueryParams) => void;
  initialFilters?: ReviewQueryParams;
}

const ReviewFiltersComponent: React.FC<ReviewFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>(initialFilters.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState<string>(initialFilters.sortOrder || 'desc');
  const [ratingRange, setRatingRange] = useState<[number, number]>([
    initialFilters.minRating || 1,
    initialFilters.maxRating || 5,
  ]);

  // 排序选项
  const sortOptions = [
    { text: '最新发布', value: 'createdAt' },
    { text: '评分高低', value: 'rating' },
    { text: '审核时间', value: 'moderatedAt' },
  ];

  // 排序方向选项
  const orderOptions = [
    { text: '降序', value: 'desc' },
    { text: '升序', value: 'asc' },
  ];

  // Handle sort by change
  const handleSortByChange = (value: string) => {
    setSortBy(value);
    const filters: ReviewQueryParams = {
      ...initialFilters,
      sortBy: value as any,
      sortOrder: sortOrder as any,
    };
    onFiltersChange(filters);
  };

  // Handle sort order change
  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    const filters: ReviewQueryParams = {
      ...initialFilters,
      sortBy: sortBy as any,
      sortOrder: value as any,
    };
    onFiltersChange(filters);
  };

  // Handle rating range change
  const handleRatingRangeChange = (value: [number, number]) => {
    setRatingRange(value);
    const filters: ReviewQueryParams = {
      ...initialFilters,
      minRating: value[0] > 1 ? value[0] : undefined,
      maxRating: value[1] < 5 ? value[1] : undefined,
    };
    onFiltersChange(filters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSortBy('createdAt');
    setSortOrder('desc');
    setRatingRange([1, 5]);
    onFiltersChange({});
  };

  return (
    <View className="review-filters">
      <View className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
        <Text className="toggle-text">筛选和排序</Text>
        <Text className={`toggle-icon ${showFilters ? 'active' : ''}`}>▼</Text>
      </View>

      {showFilters && (
        <View className="filter-content">
          {/* Sort By Filter */}
          <View className="filter-item">
            <Text className="filter-label">排序方式</Text>
            <Picker
              options={sortOptions}
              value={sortBy}
              onConfirm={(value) => handleSortByChange(value as string)}
            >
              <View className="picker-trigger">
                <Text className="picker-text">
                  {sortOptions.find((option) => option.value === sortBy)?.text || '最新发布'}
                </Text>
                <Text className="picker-arrow">▼</Text>
              </View>
            </Picker>
          </View>

          {/* Sort Order Filter */}
          <View className="filter-item">
            <Text className="filter-label">排序方向</Text>
            <Picker
              options={orderOptions}
              value={sortOrder}
              onConfirm={(value) => handleSortOrderChange(value as string)}
            >
              <View className="picker-trigger">
                <Text className="picker-text">
                  {orderOptions.find((option) => option.value === sortOrder)?.text || '降序'}
                </Text>
                <Text className="picker-arrow">▼</Text>
              </View>
            </Picker>
          </View>

          {/* Rating Range Filter */}
          <View className="filter-item">
            <Text className="filter-label">评分范围</Text>
            <View className="rating-range-container">
              <Text className="rating-text">{ratingRange[0]}星</Text>
              <Range
                value={ratingRange}
                min={1}
                max={5}
                step={1}
                onChange={handleRatingRangeChange}
                className="rating-range"
              />
              <Text className="rating-text">{ratingRange[1]}星</Text>
            </View>
          </View>

          {/* Reset Button */}
          <View className="filter-actions">
            <Button
              type="default"
              size="small"
              onClick={handleResetFilters}
              className="reset-button"
            >
              重置筛选
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReviewFiltersComponent;
