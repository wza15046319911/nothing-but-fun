import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { PeripheralFilters, PeripheralCategory } from '../../services/peripherals';

interface PeripheralFiltersProps {
  onFiltersChange: (filters: PeripheralFilters) => void;
  initialFilters?: PeripheralFilters;
}

const presetPriceRanges = [
  { label: '$30以下', to: 30 },
  { label: '$30-60', from: 30, to: 60 },
  { label: '$60-100', from: 60, to: 100 },
  { label: '$100-200', from: 100, to: 200 },
  { label: '$200+', from: 200 },
];

type SortOptionKey = 'latest' | 'oldest' | 'priceLow' | 'priceHigh' | 'stock' | 'stockLow';

const sortOptions: Array<{
  key: SortOptionKey;
  label: string;
  description: string;
  sortBy: PeripheralFilters['sortBy'];
  sortOrder: PeripheralFilters['sortOrder'];
}> = [
  {
    key: 'latest',
    label: '最新上架',
    description: '按发布时间由新到旧',
    sortBy: 'dateCreated',
    sortOrder: 'desc',
  },
  {
    key: 'oldest',
    label: '最早上架',
    description: '按发布时间由旧到新',
    sortBy: 'dateCreated',
    sortOrder: 'asc',
  },
  {
    key: 'priceLow',
    label: '价格从低到高',
    description: '优先展示更实惠的商品',
    sortBy: 'priceLow',
    sortOrder: 'asc',
  },
  {
    key: 'priceHigh',
    label: '价格从高到低',
    description: '优先展示高端精选',
    sortBy: 'priceHigh',
    sortOrder: 'desc',
  },
  {
    key: 'stock',
    label: '库存从高到低',
    description: '优先显示库存充足商品',
    sortBy: 'stock',
    sortOrder: 'desc',
  },
  {
    key: 'stockLow',
    label: '库存从低到高',
    description: '优先显示库存较少商品',
    sortBy: 'stock',
    sortOrder: 'asc',
  },
];

const getSortOption = (key: SortOptionKey) =>
  sortOptions.find((option) => option.key === key) ?? sortOptions[0];

const resolveSortKey = (
  sortBy?: PeripheralFilters['sortBy'],
  sortOrder?: PeripheralFilters['sortOrder']
): SortOptionKey => {
  if (sortBy === 'dateCreated' && sortOrder === 'asc') {
    return 'oldest';
  }
  if (sortBy === 'priceLow' && sortOrder === 'asc') {
    return 'priceLow';
  }
  if (sortBy === 'priceHigh' && sortOrder === 'desc') {
    return 'priceHigh';
  }
  if (sortBy === 'stock' && sortOrder === 'desc') {
    return 'stock';
  }
  if (sortBy === 'stock' && sortOrder === 'asc') {
    return 'stockLow';
  }
  return 'latest';
};

const buildFilterPayload = (
  base: PeripheralFilters,
  keyword: string,
  priceFrom: string,
  priceTo: string,
  categoryId?: number,
  sortBy?: PeripheralFilters['sortBy'],
  sortOrder?: PeripheralFilters['sortOrder']
): PeripheralFilters | undefined => {
  const next: PeripheralFilters = { ...base };

  // Clear keyword & price & category fields before applying fresh values
  delete next.keyword;
  delete next.priceFrom;
  delete next.priceTo;
  delete next.categoryId;
  delete next.sortBy;
  delete next.sortOrder;

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword) {
    next.keyword = trimmedKeyword;
  }

  const fromValue = priceFrom.trim() !== '' ? Number(priceFrom) : undefined;
  const toValue = priceTo.trim() !== '' ? Number(priceTo) : undefined;

  if (fromValue !== undefined && Number.isNaN(fromValue)) {
    return undefined;
  }

  if (toValue !== undefined && Number.isNaN(toValue)) {
    return undefined;
  }

  if (fromValue !== undefined) {
    next.priceFrom = fromValue;
  }

  if (toValue !== undefined) {
    next.priceTo = toValue;
  }

  if (categoryId !== undefined && categoryId > 0) {
    next.categoryId = categoryId;
  }

  if (sortBy) {
    next.sortBy = sortBy;
  }

  if (sortOrder) {
    next.sortOrder = sortOrder;
  }

  return next;
};

const PeripheralFiltersComponent: React.FC<PeripheralFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
}) => {
  const [keyword, setKeyword] = useState(initialFilters.keyword ?? '');
  const [priceFrom, setPriceFrom] = useState(
    initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : ''
  );
  const [priceTo, setPriceTo] = useState(
    initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : ''
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    initialFilters.categoryId
  );
  const [categories, setCategories] = useState<PeripheralCategory[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedSortKey, setSelectedSortKey] = useState<SortOptionKey>(
    resolveSortKey(initialFilters.sortBy, initialFilters.sortOrder)
  );

  // Reflect upstream filter changes (e.g. external reset/pagination updates)
  useEffect(() => {
    setKeyword(initialFilters.keyword ?? '');
  }, [initialFilters.keyword]);

  useEffect(() => {
    setPriceFrom(initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : '');
  }, [initialFilters.priceFrom]);

  useEffect(() => {
    setPriceTo(initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : '');
  }, [initialFilters.priceTo]);

  useEffect(() => {
    setSelectedCategoryId(initialFilters.categoryId);
  }, [initialFilters.categoryId]);

  useEffect(() => {
    setSelectedSortKey(resolveSortKey(initialFilters.sortBy, initialFilters.sortOrder));
  }, [initialFilters.sortBy, initialFilters.sortOrder]);

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 动态导入 peripheralsApi
        const { peripheralsApi } = await import('../../services/peripherals');
        const categoriesData = await peripheralsApi.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('加载分类数据失败:', error);
        // 如果API失败，使用模拟数据作为备选
        const mockCategories = [
          { id: 1, name: '服装' },
          { id: 2, name: '配饰' },
          { id: 3, name: '数码' },
          { id: 4, name: '文具' },
          { id: 5, name: '生活用品' },
        ];
        setCategories(mockCategories);
      }
    };

    loadCategories();
  }, []);

  const hasActivePriceFilter = useMemo(
    () => priceFrom.trim() !== '' || priceTo.trim() !== '',
    [priceFrom, priceTo]
  );

  const hasActiveCategoryFilter = useMemo(
    () => selectedCategoryId !== undefined && selectedCategoryId > 0,
    [selectedCategoryId]
  );

  const applyFilters = (
    keywordValue = keyword,
    priceFromValue = priceFrom,
    priceToValue = priceTo,
    categoryIdValue = selectedCategoryId,
    sortKey: SortOptionKey = selectedSortKey
  ) => {
    const sortConfig = getSortOption(sortKey);
    const payload = buildFilterPayload(
      initialFilters,
      keywordValue,
      priceFromValue,
      priceToValue,
      categoryIdValue,
      sortConfig.sortBy,
      sortConfig.sortOrder
    );

    if (!payload) {
      setError('请输入正确的价格范围');
      return;
    }

    setError('');
    setShowSortOptions(false);
    onFiltersChange(payload);
  };

  const handleReset = () => {
    setKeyword('');
    setPriceFrom('');
    setPriceTo('');
    setSelectedCategoryId(undefined);
    setSelectedSortKey('latest');
    setShowSortOptions(false);
    setError('');

    const defaultSort = getSortOption('latest');
    const payload = buildFilterPayload(
      initialFilters,
      '',
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

  const handleQuickRange = (from: number, to?: number) => {
    const fromValue = `${from}`;
    const toValue = to !== undefined ? `${to}` : '';
    setPriceFrom(fromValue);
    setPriceTo(toValue);
    setShowAdvanced(true);
    applyFilters(keyword, fromValue, toValue, selectedCategoryId);
  };

  const handleKeywordClear = () => {
    setKeyword('');
    applyFilters('', priceFrom, priceTo, selectedCategoryId);
  };

  const handleKeywordConfirm = () => {
    applyFilters();
  };

  const handleSortSelect = (optionKey: SortOptionKey) => {
    setSelectedSortKey(optionKey);
    setShowSortOptions(false);
    applyFilters(keyword, priceFrom, priceTo, selectedCategoryId, optionKey);
  };

  return (
    <View className="flex flex-col gap-4 px-4 mt-2 mb-2 sticky top-[100px] z-[99]">
      {/* 1. Floating Capsule Search Bar */}
      <View className="flex items-center gap-3 bg-white/80 backdrop-blur-md shadow-[0_8px_20px_-6px_rgba(31,38,135,0.15)] rounded-full p-2 border border-white/60 transition-all hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.2)]">
        <View className="flex-1 flex items-center pl-4 bg-transparent">
          <Text className="text-emerald-400 mr-2 text-lg">🔍</Text>
          <Input
            className="flex-1 bg-transparent text-slate-700 h-10 text-base placeholder-slate-400"
            placeholder="搜索周边好物..."
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
            showAdvanced || hasActivePriceFilter || hasActiveCategoryFilter
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-white/60 border-white/60 text-slate-600 backdrop-blur-sm'
          }`}
          onClick={() => {
            setShowAdvanced((prev) => !prev);
            setShowSortOptions(false);
          }}
        >
          <Text className="text-sm font-medium">筛选</Text>
          {(hasActivePriceFilter || hasActiveCategoryFilter) && (
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
      <View className={`fixed inset-0 z-[1000] ${showAdvanced ? 'visible' : 'hidden'}`} catchMove>
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
              {/* Category Filter */}
              <View className="flex flex-col gap-3">
                <Text className="text-sm font-bold text-slate-800">商品分类</Text>
                <View className="flex flex-wrap gap-2">
                  <View
                    className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                      selectedCategoryId === undefined
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedCategoryId(undefined);
                    }}
                  >
                    <Text>全部</Text>
                  </View>
                  {categories.map((category) => (
                    <View
                      key={category.id}
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedCategoryId === category.id
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedCategoryId(
                          selectedCategoryId === category.id ? undefined : category.id
                        );
                      }}
                    >
                      <Text>{category.name}</Text>
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
                        onClick={() => handleQuickRange(range.from || 0, range.to)}
                      >
                        <Text>{range.label}</Text>
                      </View>
                    );
                  })}
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
                  applyFilters(keyword, priceFrom, priceTo, selectedCategoryId, selectedSortKey);
                  setShowAdvanced(false);
                }}
              >
                <Text className="text-sm font-bold text-white">确认筛选</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Sort Popup Modal */}
      <View
        className={`fixed inset-0 z-[1000] ${showSortOptions ? 'visible' : 'hidden'}`}
        catchMove
      >
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
      </View>
    </View>
  );
};

export default PeripheralFiltersComponent;
