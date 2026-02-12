import React from 'react';
import { View, Text } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import './index.less';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  loading = false,
}) => {
  // Don't show pagination if there's only one page or no data
  if (totalPages <= 1 || total === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <View className="pagination">
      <View className="pagination-info">
        <Text className="info-text">
          显示 {startItem}-{endItem} 项，共 {total} 项
        </Text>
      </View>

      <View className="pagination-controls">
        <Button
          type="default"
          size="small"
          disabled={currentPage <= 1 || loading}
          onClick={handlePrevious}
          onTap={handlePrevious}
          className="pagination-button"
        >
          上一页
        </Button>

        <View className="page-info">
          <Text className="page-text">
            {currentPage} / {totalPages}
          </Text>
        </View>

        <Button
          type="default"
          size="small"
          disabled={currentPage >= totalPages || loading}
          onClick={handleNext}
          onTap={handleNext}
          className="pagination-button"
        >
          下一页
        </Button>
      </View>
    </View>
  );
};

export default Pagination;
