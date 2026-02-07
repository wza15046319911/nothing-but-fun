import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import {
  SecondhandFilters,
  SecondhandCategory,
  SecondhandProductStatus,
  secondhandApi,
} from '../../services/secondhand';

interface SecondhandFiltersProps {
  onFiltersChange: (filters: SecondhandFilters) => void;
  initialFilters?: SecondhandFilters;
}

const presetRanges = [
  { label: '$0-50', from: 0, to: 50 },
  { label: '$50-100', from: 50, to: 100 },
  { label: '$100-300', from: 100, to: 300 },
  { label: '$300-500', from: 300, to: 500 },
  { label: '$500+', from: 500 },
];

const listingStatusOptions = [
  { value: 'available', label: '可购买' },
  { value: 'reserved', label: '已预订' },
  { value: 'sold', label: '已售出' },
];

const buildFilterPayload = (
  base: SecondhandFilters,
  keyword: string,
  priceFrom: string,
  priceTo: string,
  categoryId?: number,
  subCategoryId?: number,
  productStatusId?: number,
  listingStatus?: 'available' | 'sold' | 'reserved',
  sortBy?: SecondhandFilters['sortBy'],
  sortOrder?: SecondhandFilters['sortOrder']
): SecondhandFilters | undefined => {
  const next: SecondhandFilters = { ...base };

  // Clear keyword & price & category fields before applying fresh values
  delete next.keyword;
  delete next.priceFrom;
  delete next.priceTo;
  delete next.categoryId;
  delete next.subCategoryId;
  delete next.productStatusId;
  delete next.status;
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

  if (subCategoryId !== undefined && subCategoryId > 0) {
    next.subCategoryId = subCategoryId;
  }

  if (productStatusId !== undefined && productStatusId > 0) {
    next.productStatusId = productStatusId;
  }

  if (listingStatus) {
    next.status = listingStatus;
  }

  if (sortBy) {
    next.sortBy = sortBy;
  }

  if (sortOrder) {
    next.sortOrder = sortOrder;
  }

  return next;
};

const SecondhandFiltersComponent: React.FC<SecondhandFiltersProps> = ({
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
  const [categories, setCategories] = useState<SecondhandCategory[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | undefined>(
    initialFilters.subCategoryId
  );
  const [productStatuses, setProductStatuses] = useState<SecondhandProductStatus[]>([]);
  const [selectedProductStatusId, setSelectedProductStatusId] = useState<number | undefined>(
    initialFilters.productStatusId
  );
  const [selectedListingStatus, setSelectedListingStatus] = useState<SecondhandFilters['status']>(
    initialFilters.status
  );
  const [sortOrder, setSortOrder] = useState<SecondhandFilters['sortOrder']>(
    initialFilters.sortOrder ?? 'asc'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SecondhandFilters['sortBy']>(
    initialFilters.sortBy ?? 'sort'
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
    setSelectedSubCategoryId(initialFilters.subCategoryId);
  }, [initialFilters.subCategoryId]);

  useEffect(() => {
    setSelectedProductStatusId(initialFilters.productStatusId);
  }, [initialFilters.productStatusId]);

  useEffect(() => {
    setSelectedListingStatus(initialFilters.status);
  }, [initialFilters.status]);

  useEffect(() => {
    if (initialFilters.sortOrder) {
      setSortOrder(initialFilters.sortOrder);
    }
  }, [initialFilters.sortOrder]);

  useEffect(() => {
    if (initialFilters.sortBy) {
      setSortBy(initialFilters.sortBy);
    }
  }, [initialFilters.sortBy]);

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 使用新的API加载子分类（一级分类）
        const subCategoryData = await secondhandApi.getAllSubCategories();
        setSubCategories(subCategoryData);

        // 加载所有分类数据，保持向后兼容
        const categoryData = await secondhandApi.getAllCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error('加载分类数据失败:', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (initialFilters.categoryId && categories.length > 0) {
      const matched = categories.find((category) => category.id === initialFilters.categoryId);
      if (matched?.subCategoryId) {
        setSelectedSubCategoryId((prev) => (prev === undefined ? matched.subCategoryId : prev));
      }
    }
  }, [initialFilters.categoryId, categories]);

  useEffect(() => {
    const loadProductStatuses = async () => {
      try {
        const statuses = await secondhandApi.getProductStatuses();
        setProductStatuses(statuses);
      } catch (error) {
        console.error('加载商品状况失败:', error);
      }
    };

    loadProductStatuses();
  }, []);

  // 当选择子分类时，动态加载对应的二级分类
  const loadCategoriesForSubCategory = async (subCategoryId: number) => {
    try {
      const categoryData = await secondhandApi.getCategoriesBySubCategory(subCategoryId);
      setCategories(categoryData);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  useEffect(() => {
    if (selectedSubCategoryId !== undefined && selectedCategoryId !== undefined) {
      const exists = categories.some(
        (category) =>
          category.id === selectedCategoryId && category.subCategoryId === selectedSubCategoryId
      );
      if (!exists) {
        setSelectedCategoryId(undefined);
      }
    }
  }, [selectedSubCategoryId, selectedCategoryId, categories]);

  const filteredCategories = useMemo(() => {
    // 由于我们现在动态加载分类，categories已经是过滤后的结果
    return categories;
  }, [categories]);

  const hasActivePriceFilter = useMemo(
    () => priceFrom.trim() !== '' || priceTo.trim() !== '',
    [priceFrom, priceTo]
  );

  const hasActiveCategoryFilter = useMemo(
    () =>
      (selectedCategoryId !== undefined && selectedCategoryId > 0) ||
      (selectedSubCategoryId !== undefined && selectedSubCategoryId > 0),
    [selectedCategoryId, selectedSubCategoryId]
  );

  const hasActiveProductStatusFilter = useMemo(
    () => selectedProductStatusId !== undefined && selectedProductStatusId > 0,
    [selectedProductStatusId]
  );

  const hasActiveListingStatusFilter = useMemo(
    () => !!selectedListingStatus,
    [selectedListingStatus]
  );

  const hasActiveAdvancedFilter = useMemo(
    () =>
      hasActivePriceFilter ||
      hasActiveCategoryFilter ||
      hasActiveProductStatusFilter ||
      hasActiveListingStatusFilter,
    [
      hasActivePriceFilter,
      hasActiveCategoryFilter,
      hasActiveProductStatusFilter,
      hasActiveListingStatusFilter,
    ]
  );

  const applyFilters = (
    keywordValue = keyword,
    priceFromValue = priceFrom,
    priceToValue = priceTo,
    categoryIdValue = selectedCategoryId,
    subCategoryIdValue = selectedSubCategoryId,
    productStatusIdValue = selectedProductStatusId,
    listingStatusValue = selectedListingStatus,
    sortByValue: SecondhandFilters['sortBy'] = sortBy,
    sortOrderValue: SecondhandFilters['sortOrder'] = sortOrder
  ) => {
    const payload = buildFilterPayload(
      initialFilters,
      keywordValue,
      priceFromValue,
      priceToValue,
      categoryIdValue,
      subCategoryIdValue,
      productStatusIdValue,
      listingStatusValue,
      sortByValue,
      sortOrderValue
    );

    if (!payload) {
      setError('请输入正确的价格范围');
      return;
    }

    const fromValue = priceFromValue.trim() !== '' ? Number(priceFromValue) : undefined;
    const toValue = priceToValue.trim() !== '' ? Number(priceToValue) : undefined;

    if (
      fromValue !== undefined &&
      toValue !== undefined &&
      !Number.isNaN(fromValue) &&
      !Number.isNaN(toValue) &&
      fromValue > toValue
    ) {
      setError('最低价格不能高于最高价格');
      return;
    }

    setError('');
    onFiltersChange(payload);
  };

  const handleReset = () => {
    setKeyword('');
    setPriceFrom('');
    setPriceTo('');
    setSelectedCategoryId(undefined);
    setSelectedSubCategoryId(undefined);
    setSelectedProductStatusId(undefined);
    setSortBy('sort');
    setSortOrder('asc');
    setError('');

    const payload = buildFilterPayload(
      initialFilters,
      '',
      '',
      '',
      undefined,
      undefined,
      undefined,
      undefined,
      'sort',
      'asc'
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
    applyFilters(keyword, fromValue, toValue);
  };

  type SortOptionKey =
    | 'default'
    | 'latest'
    | 'oldest'
    | 'priceLow'
    | 'priceHigh'
    | 'conditionNew'
    | 'conditionOld';

  const sortOptions: Array<{
    key: SortOptionKey;
    label: string;
    description: string;
    sortBy: SecondhandFilters['sortBy'];
    sortOrder: SecondhandFilters['sortOrder'];
  }> = [
    {
      key: 'default',
      label: '默认排序',
      description: '按后台设置顺序展示',
      sortBy: 'sort',
      sortOrder: 'asc',
    },
    {
      key: 'latest',
      label: '最新发布',
      description: '按发布时间由新到旧',
      sortBy: 'dateCreated',
      sortOrder: 'desc',
    },
    {
      key: 'oldest',
      label: '最早发布',
      description: '按发布时间由旧到新',
      sortBy: 'dateCreated',
      sortOrder: 'asc',
    },
    {
      key: 'priceLow',
      label: '价格从低到高',
      description: '优先展示更实惠的商品',
      sortBy: 'price',
      sortOrder: 'asc',
    },
    {
      key: 'priceHigh',
      label: '价格从高到低',
      description: '优先展示高价商品',
      sortBy: 'price',
      sortOrder: 'desc',
    },
    {
      key: 'conditionNew',
      label: '状况从新到旧',
      description: '优先展示状况较新的商品',
      sortBy: 'condition',
      sortOrder: 'desc',
    },
    {
      key: 'conditionOld',
      label: '状况从旧到新',
      description: '优先展示状况较旧的商品',
      sortBy: 'condition',
      sortOrder: 'asc',
    },
  ];

  const getCurrentSortKey = (): SortOptionKey => {
    // 根据当前的 sortBy 和 sortOrder 确定选中的排序键
    if (sortBy === 'sort') {
      return 'default';
    }
    if (sortBy === 'dateCreated') {
      return sortOrder === 'desc' ? 'latest' : 'oldest';
    }
    if (sortBy === 'price') {
      return sortOrder === 'desc' ? 'priceHigh' : 'priceLow';
    }
    if (sortBy === 'condition') {
      return sortOrder === 'desc' ? 'conditionNew' : 'conditionOld';
    }
    return 'latest';
  };

  const getSortOption = (key: SortOptionKey) =>
    sortOptions.find((option) => option.key === key) ?? sortOptions[0];

  const handleSortSelect = (optionKey: SortOptionKey) => {
    const option = getSortOption(optionKey);
    setSortBy(option.sortBy);
    setSortOrder(option.sortOrder);
    setShowSortOptions(false);
    applyFilters(
      keyword,
      priceFrom,
      priceTo,
      selectedCategoryId,
      selectedSubCategoryId,
      selectedProductStatusId,
      selectedListingStatus,
      option.sortBy,
      option.sortOrder
    );
  };

  const handleKeywordClear = () => {
    setKeyword('');
    applyFilters(
      '',
      priceFrom,
      priceTo,
      selectedCategoryId,
      selectedSubCategoryId,
      selectedProductStatusId,
      selectedListingStatus
    );
  };

  const handleKeywordConfirm = () => {
    applyFilters();
  };

  return (
    <View className="flex flex-col gap-4 px-4 mt-2 mb-2 sticky top-[100px] z-[99]">
      {/* 1. Floating Capsule Search Bar */}
      <View className="flex items-center gap-3 bg-white/80 backdrop-blur-md shadow-[0_8px_20px_-6px_rgba(31,38,135,0.15)] rounded-full p-2 border border-white/60 transition-all hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.2)]">
        <View className="flex-1 flex items-center pl-4 bg-transparent">
          <Text className="text-emerald-400 mr-2 text-lg">🔍</Text>
          <Input
            className="flex-1 bg-transparent text-slate-700 h-10 text-base placeholder-slate-400"
            placeholder="搜索好物..."
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
            showAdvanced || hasActiveAdvancedFilter
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-white/60 border-white/60 text-slate-600 backdrop-blur-sm'
          }`}
          onClick={() => setShowAdvanced((prev) => !prev)}
        >
          <Text className="text-sm font-medium">筛选</Text>
          {hasActiveAdvancedFilter && (
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
          onClick={() => setShowSortOptions((prev) => !prev)}
        >
          <Text className="text-sm font-medium">排序</Text>
          <Text className="text-xs opacity-60 ml-1 truncate max-w-[80px]">
            {getSortOption(getCurrentSortKey()).label}
          </Text>
        </View>

        {/* Quick Categories (Demo) */}
        <View
          className={`flex-shrink-0 px-4 py-2 rounded-full border backdrop-blur-sm ${
            selectedCategoryId === undefined && selectedSubCategoryId === undefined
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white/60 text-slate-600 border-white/60'
          }`}
          onClick={() => {
            setSelectedSubCategoryId(undefined);
            setSelectedCategoryId(undefined);
            applyFilters(
              keyword,
              priceFrom,
              priceTo,
              undefined,
              undefined,
              selectedProductStatusId,
              selectedListingStatus
            );
          }}
        >
          <Text className="text-sm font-medium">全部</Text>
        </View>

        {/* Render top 3 categories as quick chips if available */}
        {categories.slice(0, 3).map((cat) => (
          <View
            key={cat.id}
            className={`flex-shrink-0 px-4 py-2 rounded-full border backdrop-blur-sm ${
              selectedCategoryId === cat.id
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-white/60 text-slate-600 border-white/60'
            }`}
            onClick={() => {
              if (selectedCategoryId === cat.id) {
                setSelectedCategoryId(undefined);
                applyFilters(
                  keyword,
                  priceFrom,
                  priceTo,
                  undefined,
                  selectedSubCategoryId,
                  selectedProductStatusId,
                  selectedListingStatus
                );
              } else {
                setSelectedCategoryId(cat.id);
                applyFilters(
                  keyword,
                  priceFrom,
                  priceTo,
                  cat.id,
                  selectedSubCategoryId,
                  selectedProductStatusId,
                  selectedListingStatus
                );
              }
            }}
          >
            <Text className="text-sm font-medium">{cat.name}</Text>
          </View>
        ))}
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
              {/* Sub Categories (Big Category) */}
              {subCategories.length > 0 && (
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-bold text-slate-800">商品大类</Text>
                  <View className="flex flex-wrap gap-2">
                    <View
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedSubCategoryId === undefined
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={async () => {
                        setSelectedSubCategoryId(undefined);
                        setSelectedCategoryId(undefined);
                        try {
                          const categoryData = await secondhandApi.getAllCategories();
                          setCategories(categoryData);
                        } catch (error) {
                          console.error('加载分类失败:', error);
                        }
                        applyFilters(
                          keyword,
                          priceFrom,
                          priceTo,
                          undefined,
                          undefined,
                          selectedProductStatusId,
                          selectedListingStatus
                        );
                      }}
                    >
                      <Text>全部</Text>
                    </View>
                    {subCategories.map((subCategory) => (
                      <View
                        key={subCategory.id}
                        className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                          selectedSubCategoryId === subCategory.id
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                        onClick={async () => {
                          setSelectedSubCategoryId(subCategory.id);
                          setSelectedCategoryId(undefined);
                          await loadCategoriesForSubCategory(subCategory.id);
                          applyFilters(
                            keyword,
                            priceFrom,
                            priceTo,
                            undefined,
                            subCategory.id,
                            selectedProductStatusId,
                            selectedListingStatus
                          );
                        }}
                      >
                        <Text>{subCategory.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Categories (Sub Category) */}
              <View className="flex flex-col gap-3">
                <Text className="text-sm font-bold text-slate-800">商品细分类</Text>
                <View className="flex flex-wrap gap-2">
                  <View
                    className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                      selectedCategoryId === undefined
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedCategoryId(undefined);
                      applyFilters(
                        keyword,
                        priceFrom,
                        priceTo,
                        undefined,
                        selectedSubCategoryId,
                        selectedProductStatusId,
                        selectedListingStatus
                      );
                    }}
                  >
                    <Text>全部</Text>
                  </View>
                  {filteredCategories.map((category) => (
                    <View
                      key={category.id}
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedCategoryId === category.id
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        applyFilters(
                          keyword,
                          priceFrom,
                          priceTo,
                          category.id,
                          selectedSubCategoryId,
                          selectedProductStatusId,
                          selectedListingStatus
                        );
                      }}
                    >
                      <Text>{category.name}</Text>
                    </View>
                  ))}
                </View>
                {selectedSubCategoryId && filteredCategories.length === 0 && (
                  <Text className="text-xs text-slate-400">该大类下暂无细分分类</Text>
                )}
              </View>

              {/* Condition */}
              {productStatuses.length > 0 && (
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-bold text-slate-800">商品状况</Text>
                  <View className="flex flex-wrap gap-2">
                    <View
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedProductStatusId === undefined
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedProductStatusId(undefined);
                        applyFilters(
                          keyword,
                          priceFrom,
                          priceTo,
                          selectedCategoryId,
                          selectedSubCategoryId,
                          undefined
                        );
                      }}
                    >
                      <Text>全部</Text>
                    </View>
                    {productStatuses.map((status) => (
                      <View
                        key={status.id}
                        className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                          selectedProductStatusId === status.id
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                        onClick={() => {
                          setSelectedProductStatusId(status.id);
                          applyFilters(
                            keyword,
                            priceFrom,
                            priceTo,
                            selectedCategoryId,
                            selectedSubCategoryId,
                            status.id
                          );
                        }}
                      >
                        <Text>{status.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Status */}
              <View className="flex flex-col gap-3">
                <Text className="text-sm font-bold text-slate-800">上架状态</Text>
                <View className="flex flex-wrap gap-2">
                  <View
                    className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                      selectedListingStatus === undefined
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedListingStatus(undefined);
                      applyFilters(
                        keyword,
                        priceFrom,
                        priceTo,
                        selectedCategoryId,
                        selectedSubCategoryId,
                        selectedProductStatusId,
                        undefined
                      );
                    }}
                  >
                    <Text>全部</Text>
                  </View>
                  {listingStatusOptions.map((status) => (
                    <View
                      key={status.value}
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedListingStatus === status.value
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedListingStatus(status.value as any);
                        applyFilters(
                          keyword,
                          priceFrom,
                          priceTo,
                          selectedCategoryId,
                          selectedSubCategoryId,
                          selectedProductStatusId,
                          status.value as any
                        );
                      }}
                    >
                      <Text>{status.label}</Text>
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
                  {presetRanges.map((range) => (
                    <View
                      key={range.label}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        priceFrom === `${range.from}` &&
                        (range.to === undefined ? priceTo === '' : priceTo === `${range.to}`)
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border border-transparent'
                      }`}
                      onClick={() => handleQuickRange(range.from, range.to)}
                    >
                      <Text>{range.label}</Text>
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
                    priceFrom,
                    priceTo,
                    selectedCategoryId,
                    selectedSubCategoryId,
                    selectedProductStatusId,
                    selectedListingStatus
                  );
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
              {sortOptions.map((option) => {
                const isSelected = sortBy === option.sortBy && sortOrder === option.sortOrder;
                return (
                  <View
                    key={option.key}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isSelected
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
                        className={`text-sm font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}
                      >
                        {option.label}
                      </Text>
                      <Text className="text-xs text-slate-400">{option.description}</Text>
                    </View>
                    {isSelected && (
                      <View className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Text className="text-white text-xs">✓</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default SecondhandFiltersComponent;
