import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { RestaurantFilters } from '../../services/restaurant';
import { useRestaurantTypes } from '../../hooks/useTypes';

interface RestaurantFiltersProps {
  onFiltersChange: (filters: RestaurantFilters) => void;
  initialFilters?: RestaurantFilters;
}

const presetRatings = [
  { label: '⭐1+', rating: 1 },
  { label: '⭐2+', rating: 2 },
  { label: '⭐3+', rating: 3 },
  { label: '⭐4+', rating: 4 },
  { label: '⭐5', rating: 5 },
];

const presetPriceRanges = [
  { label: '$20以下', to: 20 },
  { label: '$20-40', from: 20, to: 40 },
  { label: '$40-80', from: 40, to: 80 },
  { label: '$80-150', from: 80, to: 150 },
  { label: '$150+', from: 150 },
];

type SortOptionKey =
  | 'default'
  | 'priceLow'
  | 'priceHigh'
  | 'ratingOverall'
  | 'ratingTaste'
  | 'ratingService'
  | 'ratingEnvironment'
  | 'ratingValue';

const sortOptions: Array<{
  key: SortOptionKey;
  label: string;
  description: string;
  sortBy: RestaurantFilters['sortBy'];
  sortOrder: RestaurantFilters['sortOrder'];
}> = [
  {
    key: 'default',
    label: '默认排序',
    description: '按后台设置顺序展示',
    sortBy: 'sort',
    sortOrder: 'asc',
  },
  {
    key: 'priceLow',
    label: '价格从低到高',
    description: '优先展示更实惠的餐厅',
    sortBy: 'priceLow',
    sortOrder: 'asc',
  },
  {
    key: 'priceHigh',
    label: '价格从高到低',
    description: '优先展示高端餐厅',
    sortBy: 'priceHigh',
    sortOrder: 'desc',
  },
  {
    key: 'ratingOverall',
    label: '综合评分',
    description: '按综合评分由高到低',
    sortBy: 'rating',
    sortOrder: 'desc',
  },
  {
    key: 'ratingTaste',
    label: '口味评分',
    description: '按口味评分由高到低',
    sortBy: 'ratingTaste',
    sortOrder: 'desc',
  },
  {
    key: 'ratingService',
    label: '服务评分',
    description: '按服务评分由高到低',
    sortBy: 'ratingService',
    sortOrder: 'desc',
  },
  {
    key: 'ratingEnvironment',
    label: '环境评分',
    description: '按环境评分由高到低',
    sortBy: 'ratingEnvironment',
    sortOrder: 'desc',
  },
  {
    key: 'ratingValue',
    label: '性价比评分',
    description: '按性价比评分由高到低',
    sortBy: 'ratingValue',
    sortOrder: 'desc',
  },
];

const getSortOption = (key: SortOptionKey) =>
  sortOptions.find((option) => option.key === key) ?? sortOptions[0];

const resolveSortKey = (
  sortBy?: RestaurantFilters['sortBy'],
  sortOrder?: RestaurantFilters['sortOrder']
): SortOptionKey => {
  if (sortBy === 'sort' && (sortOrder === undefined || sortOrder === 'asc')) {
    return 'default';
  }
  if (sortBy === 'priceLow' && sortOrder === 'asc') {
    return 'priceLow';
  }
  if (sortBy === 'priceHigh' && sortOrder === 'desc') {
    return 'priceHigh';
  }
  if (sortBy === 'rating' && (sortOrder === undefined || sortOrder === 'desc')) {
    return 'ratingOverall';
  }
  if (sortBy === 'ratingTaste' && (sortOrder === undefined || sortOrder === 'desc')) {
    return 'ratingTaste';
  }
  if (sortBy === 'ratingService' && (sortOrder === undefined || sortOrder === 'desc')) {
    return 'ratingService';
  }
  if (sortBy === 'ratingEnvironment' && (sortOrder === undefined || sortOrder === 'desc')) {
    return 'ratingEnvironment';
  }
  if (sortBy === 'ratingValue' && (sortOrder === undefined || sortOrder === 'desc')) {
    return 'ratingValue';
  }
  return 'default';
};

const buildFilterPayload = (
  base: RestaurantFilters,
  keyword: string,
  minRating?: number,
  priceFrom?: string,
  priceTo?: string,
  restaurantTypeRid?: string,
  sortBy?: RestaurantFilters['sortBy'],
  sortOrder?: RestaurantFilters['sortOrder']
): RestaurantFilters | undefined => {
  const next: RestaurantFilters = { ...base };

  // Clear fields before applying fresh values
  delete next.keyword;
  delete next.minRating;
  delete next.priceRangeRid;
  delete next.priceFrom;
  delete next.priceTo;
  delete next.restaurantTypeRid;
  delete next.sortBy;
  delete next.sortOrder;

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword) {
    next.keyword = trimmedKeyword;
  }

  if (minRating !== undefined && minRating > 0) {
    next.minRating = minRating;
  }

  const fromRaw = (priceFrom ?? '').trim();
  const toRaw = (priceTo ?? '').trim();

  const fromValue = fromRaw !== '' ? Number(fromRaw) : undefined;
  const toValue = toRaw !== '' ? Number(toRaw) : undefined;

  if (fromValue !== undefined && Number.isNaN(fromValue)) {
    return undefined;
  }

  if (toValue !== undefined && Number.isNaN(toValue)) {
    return undefined;
  }

  if (fromValue !== undefined && toValue !== undefined && fromValue > toValue) {
    return undefined;
  }

  if (fromValue !== undefined) {
    next.priceFrom = fromValue;
  }

  if (toValue !== undefined) {
    next.priceTo = toValue;
  }

  if (restaurantTypeRid !== undefined && restaurantTypeRid !== '0') {
    next.restaurantTypeRid = restaurantTypeRid;
  }

  if (sortBy) {
    next.sortBy = sortBy;
  }

  if (sortOrder) {
    next.sortOrder = sortOrder;
  }

  return next;
};

const RestaurantFiltersComponent: React.FC<RestaurantFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
}) => {
  // Use restaurant types hook
  const { restaurantTypes: allRestaurantTypes } = useRestaurantTypes();

  // Add "全部" option to the beginning

  const [keyword, setKeyword] = useState(initialFilters.keyword ?? '');
  const [selectedMinRating, setSelectedMinRating] = useState<number | undefined>(
    initialFilters.minRating
  );
  const [priceFrom, setPriceFrom] = useState(
    initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : ''
  );
  const [priceTo, setPriceTo] = useState(
    initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : ''
  );
  const [selectedRestaurantTypeRid, setSelectedRestaurantTypeRid] = useState<string | undefined>(
    initialFilters.restaurantTypeRid
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedSortKey, setSelectedSortKey] = useState<SortOptionKey>(
    resolveSortKey(initialFilters.sortBy, initialFilters.sortOrder)
  );

  // Reflect upstream filter changes
  useEffect(() => {
    setKeyword(initialFilters.keyword ?? '');
  }, [initialFilters.keyword]);

  useEffect(() => {
    setSelectedMinRating(initialFilters.minRating);
  }, [initialFilters.minRating]);

  useEffect(() => {
    setPriceFrom(initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : '');
  }, [initialFilters.priceFrom]);

  useEffect(() => {
    setPriceTo(initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : '');
  }, [initialFilters.priceTo]);

  useEffect(() => {
    setSelectedRestaurantTypeRid(initialFilters.restaurantTypeRid);
  }, [initialFilters.restaurantTypeRid]);

  useEffect(() => {
    setSelectedSortKey(resolveSortKey(initialFilters.sortBy, initialFilters.sortOrder));
  }, [initialFilters.sortBy, initialFilters.sortOrder]);

  const hasActiveRatingFilter = useMemo(
    () => selectedMinRating !== undefined && selectedMinRating > 0,
    [selectedMinRating]
  );

  const hasActivePriceFilter = useMemo(
    () => priceFrom.trim() !== '' || priceTo.trim() !== '',
    [priceFrom, priceTo]
  );

  const hasActiveTypeFilter = useMemo(
    () => selectedRestaurantTypeRid !== undefined && selectedRestaurantTypeRid !== '0',
    [selectedRestaurantTypeRid]
  );

  const applyFilters = (
    keywordValue = keyword,
    minRatingValue = selectedMinRating,
    priceFromValue = priceFrom,
    priceToValue = priceTo,
    restaurantTypeValue = selectedRestaurantTypeRid,
    sortKey: SortOptionKey = selectedSortKey
  ) => {
    const sortConfig = getSortOption(sortKey);
    const payload = buildFilterPayload(
      initialFilters,
      keywordValue,
      minRatingValue,
      priceFromValue,
      priceToValue,
      restaurantTypeValue,
      sortConfig.sortBy,
      sortConfig.sortOrder
    );

    if (!payload) {
      setError('请输入正确的价格范围');
      return;
    }

    setError('');
    onFiltersChange(payload);
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedMinRating(undefined);
    setPriceFrom('');
    setPriceTo('');
    setSelectedRestaurantTypeRid(undefined);
    setSelectedSortKey('default');
    setShowSortOptions(false);
    setError('');

    const defaultSort = getSortOption('default');
    const payload = buildFilterPayload(
      initialFilters,
      '',
      undefined,
      '',
      '',
      undefined,
      defaultSort.sortBy,
      defaultSort.sortOrder
    );
    if (payload) {
      onFiltersChange(payload);
    }
  };

  const handleQuickRange = (from?: number, to?: number) => {
    const fromValue = from !== undefined ? `${from}` : '';
    const toValue = to !== undefined ? `${to}` : '';
    setPriceFrom(fromValue);
    setPriceTo(toValue);
    setShowAdvanced(true);
    applyFilters(keyword, selectedMinRating, fromValue, toValue, selectedRestaurantTypeRid);
  };

  const handleKeywordClear = () => {
    setKeyword('');
    applyFilters('', selectedMinRating, priceFrom, priceTo, selectedRestaurantTypeRid);
  };

  const handleKeywordConfirm = () => {
    applyFilters();
  };

  const handleSortSelect = (optionKey: SortOptionKey) => {
    setSelectedSortKey(optionKey);
    setShowSortOptions(false);
    applyFilters(
      keyword,
      selectedMinRating,
      priceFrom,
      priceTo,
      selectedRestaurantTypeRid,
      optionKey
    );
  };

  return (
    <View className="flex flex-col gap-4 px-4 mt-2 mb-2">
      {/* 1. Floating Capsule Search Bar */}
      <View className="flex items-center gap-3 bg-white/80 backdrop-blur-md shadow-[0_8px_20px_-6px_rgba(31,38,135,0.15)] rounded-full p-2 border border-white/60 transition-all hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.2)]">
        <View className="flex-1 flex items-center pl-4 bg-transparent">
          <Text className="text-emerald-400 mr-2 text-lg">🔍</Text>
          <Input
            className="flex-1 bg-transparent text-slate-700 h-10 text-base placeholder-slate-400"
            placeholder="搜索无限美味..."
            placeholderStyle="color: #94a3b8;"
            value={keyword}
            onInput={(event) => setKeyword(event.detail.value)}
            onConfirm={handleKeywordConfirm}
          />
          {keyword.trim() !== '' && (
            <View className="p-2" onClick={handleKeywordClear}>
              <View className="bg-slate-200/80 rounded-full w-5 h-5 flex items-center justify-center">
                <Text className="text-gray-500 text-xs">×</Text>
              </View>
            </View>
          )}
        </View>
        <View
          className="bg-emerald-600 h-10 px-6 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
          onClick={() => applyFilters()}
        >
          <Text className="text-white font-semibold text-sm">搜索</Text>
        </View>
      </View>

      {/* 2. Horizontal Scrollable Chips */}
      <View className="whitespace-nowrap overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide flex gap-2 items-center flex-nowrap">
        {/* Filter Toggle Chip */}
        <View
          className={`flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-full border transition-all ${
            showAdvanced || hasActiveRatingFilter || hasActivePriceFilter || hasActiveTypeFilter
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-white/60 border-white/60 text-slate-600 backdrop-blur-sm'
          }`}
          onClick={() => {
            setShowAdvanced((prev) => !prev);
            setShowSortOptions(false);
          }}
        >
          <Text className="text-sm font-medium">筛选</Text>
          {(hasActiveRatingFilter || hasActivePriceFilter || hasActiveTypeFilter) && (
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
          )}
        </View>

        {/* Sort Toggle Chip */}
        <View
          className={`flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-full border transition-all ${
            showSortOptions
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-white/60 border-white/60 text-slate-600 backdrop-blur-sm'
          }`}
          onClick={() => {
            setShowSortOptions((prev) => !prev);
            setShowAdvanced(false);
          }}
        >
          <Text className="text-sm font-medium">排序</Text>
          <Text className="text-xs opacity-70 ml-1">{getSortOption(selectedSortKey).label}</Text>
        </View>
      </View>

      {/* Filter Popup Modal */}
      {showAdvanced && <View className="fixed inset-0 z-[1000]" catchMove>
        {/* Backdrop */}
        <View
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-100 transition-opacity"
          onClick={() => setShowAdvanced(false)}
        />

        {/* Bottom Sheet Content */}
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-slideUp">
          {/* Header handle */}
          <View className="flex items-center justify-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-slate-200" />
          </View>

          {/* Title Bar */}
          <View className="px-5 pb-4 flex flex-row justify-between items-center border-b border-slate-100/50">
            <Text className="text-lg font-bold text-slate-800">筛选</Text>
            <View className="p-1" onClick={() => setShowAdvanced(false)}>
              <Text className="text-slate-400 text-xl">✕</Text>
            </View>
          </View>

          {/* Scrollable Form */}
          <ScrollView scrollY className="flex-1 w-full overflow-y-auto">
            <View className="flex flex-col gap-6 p-5 pb-10">
              {/* Type Filter */}
              <View className="flex flex-col gap-3">
                <Text className="text-sm font-bold text-slate-800">餐厅类型</Text>
                <View className="flex flex-wrap gap-2">
                  <View
                    className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                      selectedRestaurantTypeRid === undefined
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedRestaurantTypeRid(undefined);
                    }}
                  >
                    <Text>全部</Text>
                  </View>
                  {allRestaurantTypes.map((type) => (
                    <View
                      key={type.id}
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedRestaurantTypeRid === type.id.toString()
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        const newVal = type.id.toString();
                        setSelectedRestaurantTypeRid(
                          selectedRestaurantTypeRid === newVal ? undefined : newVal
                        );
                      }}
                    >
                      <Text>{type.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Price Filter */}
              <View className="flex flex-col gap-3">
                <Text className="text-sm font-bold text-slate-800">价格范围</Text>
                <Text className="text-xs text-slate-400 -mt-2">支持输入单边范围</Text>

                <View className="flex items-center gap-3">
                  <View className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <Input
                      className="text-sm text-slate-800 text-center h-5"
                      placeholder="最低价"
                      placeholderStyle="color:#cbd5e1"
                      type="number"
                      value={priceFrom}
                      onInput={(event) => setPriceFrom(event.detail.value)}
                    />
                  </View>
                  <Text className="text-slate-300">-</Text>
                  <View className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <Input
                      className="text-sm text-slate-800 text-center h-5"
                      placeholder="最高价"
                      placeholderStyle="color:#cbd5e1"
                      type="number"
                      value={priceTo}
                      onInput={(event) => setPriceTo(event.detail.value)}
                    />
                  </View>
                </View>

                <View className="flex flex-wrap gap-2">
                  {presetPriceRanges.map((range, index) => {
                    const isActive =
                      (range.from !== undefined
                        ? priceFrom === `${range.from}`
                        : priceFrom === '') &&
                      (range.to !== undefined ? priceTo === `${range.to}` : priceTo === '');

                    return (
                      <View
                        key={index}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border border-transparent'
                        }`}
                        onClick={() => handleQuickRange(range.from, range.to)}
                      >
                        <Text>{range.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Rating Filter */}
              <View className="flex flex-col gap-3">
                <Text className="text-sm font-bold text-slate-800">最低评分</Text>
                <View className="flex flex-wrap gap-2">
                  <View
                    className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                      selectedMinRating === undefined
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedMinRating(undefined);
                    }}
                  >
                    <Text>不限</Text>
                  </View>
                  {presetRatings.map((item) => (
                    <View
                      key={item.rating}
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedMinRating === item.rating
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedMinRating(item.rating);
                      }}
                    >
                      <Text>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="p-4 border-t border-slate-100 bg-white safe-area-bottom">
            <View className="flex items-center gap-3">
              <View
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 active:scale-95 transition-transform flex items-center justify-center"
                onClick={handleReset}
              >
                <Text className="text-sm font-semibold text-slate-600">重置</Text>
              </View>

              <View
                className="flex-[2] py-3.5 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform flex items-center justify-center"
                onClick={() => {
                  applyFilters(
                    keyword,
                    selectedMinRating,
                    priceFrom,
                    priceTo,
                    selectedRestaurantTypeRid,
                    selectedSortKey
                  );
                  setShowAdvanced(false);
                }}
              >
                <Text className="text-sm font-bold text-white">确认筛选</Text>
              </View>
            </View>
          </View>
        </View>
      </View>}

      {/* Sort Popup Modal */}
      {showSortOptions && <View className="fixed inset-0 z-[1000]" catchMove>
        <View
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-100 transition-opacity"
          onClick={() => setShowSortOptions(false)}
        />

        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] flex flex-col shadow-2xl animate-slideUp">
          <View className="flex items-center justify-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-slate-200" />
          </View>

          <View className="px-5 pb-4 flex flex-row justify-between items-center border-b border-slate-100/50">
            <Text className="text-lg font-bold text-slate-800">排序方式</Text>
            <View className="p-1" onClick={() => setShowSortOptions(false)}>
              <Text className="text-slate-400 text-xl">✕</Text>
            </View>
          </View>

          <ScrollView scrollY className="flex-1 w-full overflow-y-auto">
            <View className="flex flex-col gap-2 p-5 pb-10">
              {sortOptions.map((option) => (
                <View
                  key={option.key}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedSortKey === option.key
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : 'bg-white border-slate-100'
                  }`}
                  onClick={() => {
                    handleSortSelect(option.key);
                    setShowSortOptions(false);
                  }}
                >
                  <View className="flex flex-col items-start gap-1">
                    <Text
                      className={`text-sm font-bold ${selectedSortKey === option.key ? 'text-emerald-700' : 'text-slate-700'}`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-xs text-slate-400">{option.description}</Text>
                  </View>
                  {selectedSortKey === option.key && (
                    <View className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>}
    </View>
  );
};

export default RestaurantFiltersComponent;
