import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Input } from "@tarojs/components";
import { SecondhandFilters, SecondhandCategory, SecondhandProductStatus, secondhandApi } from "../../services/secondhand";

interface SecondhandFiltersProps {
  onFiltersChange: (filters: SecondhandFilters) => void;
  initialFilters?: SecondhandFilters;
}

const presetRanges = [
  { label: "¥0-50", from: 0, to: 50 },
  { label: "¥50-100", from: 50, to: 100 },
  { label: "¥100-300", from: 100, to: 300 },
  { label: "¥300-500", from: 300, to: 500 },
  { label: "¥500+", from: 500 },
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

  const fromValue = priceFrom.trim() !== "" ? Number(priceFrom) : undefined;
  const toValue = priceTo.trim() !== "" ? Number(priceTo) : undefined;

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
  const [keyword, setKeyword] = useState(initialFilters.keyword ?? "");
  const [priceFrom, setPriceFrom] = useState(
    initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : ""
  );
  const [priceTo, setPriceTo] = useState(
    initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : ""
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
    initialFilters.sortOrder ?? 'desc'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [error, setError] = useState("");
  const sortBy: SecondhandFilters['sortBy'] = 'dateCreated';

  // Reflect upstream filter changes (e.g. external reset/pagination updates)
  useEffect(() => {
    setKeyword(initialFilters.keyword ?? "");
  }, [initialFilters.keyword]);

  useEffect(() => {
    setPriceFrom(
      initialFilters.priceFrom !== undefined
        ? `${initialFilters.priceFrom}`
        : ""
    );
  }, [initialFilters.priceFrom]);

  useEffect(() => {
    setPriceTo(
      initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : ""
    );
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
      const matched = categories.find(category => category.id === initialFilters.categoryId);
      if (matched?.subCategoryId) {
        setSelectedSubCategoryId(prev => (prev === undefined ? matched.subCategoryId : prev));
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
          category.id === selectedCategoryId &&
          category.subCategoryId === selectedSubCategoryId
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
    () => priceFrom.trim() !== "" || priceTo.trim() !== "",
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
      hasActivePriceFilter || hasActiveCategoryFilter || hasActiveProductStatusFilter || hasActiveListingStatusFilter,
    [hasActivePriceFilter, hasActiveCategoryFilter, hasActiveProductStatusFilter, hasActiveListingStatusFilter]
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
      setError("请输入正确的价格范围");
      return;
    }

    const fromValue =
      priceFromValue.trim() !== "" ? Number(priceFromValue) : undefined;
    const toValue =
      priceToValue.trim() !== "" ? Number(priceToValue) : undefined;

    if (
      fromValue !== undefined &&
      toValue !== undefined &&
      !Number.isNaN(fromValue) &&
      !Number.isNaN(toValue) &&
      fromValue > toValue
    ) {
      setError("最低价格不能高于最高价格");
      return;
    }

    setError("");
    onFiltersChange(payload);
  };

  const handleReset = () => {
    setKeyword("");
    setPriceFrom("");
    setPriceTo("");
    setSelectedCategoryId(undefined);
    setSelectedSubCategoryId(undefined);
    setSelectedProductStatusId(undefined);
    setSortOrder('desc');
    setError("");

    const payload = buildFilterPayload(
      initialFilters,
      "",
      "",
      "",
      undefined,
      undefined,
      undefined,
      undefined,
      sortBy,
      'desc'
    );
    if (payload) {
      onFiltersChange(payload);
    }
  };

  const handleQuickRange = (from: number, to?: number) => {
    const fromValue = `${from}`;
    const toValue = to !== undefined ? `${to}` : "";

    setPriceFrom(fromValue);
    setPriceTo(toValue);
    setShowAdvanced(true);
    applyFilters(keyword, fromValue, toValue);
  };

  type SortOptionKey = 'latest' | 'oldest' | 'priceLow' | 'priceHigh' | 'conditionNew' | 'conditionOld';

  const sortOptions: Array<{
    key: SortOptionKey;
    label: string;
    description: string;
    sortBy: SecondhandFilters['sortBy'];
    sortOrder: SecondhandFilters['sortOrder'];
  }> = [
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
    setKeyword("");
    applyFilters("", priceFrom, priceTo, selectedCategoryId, selectedSubCategoryId, selectedProductStatusId, selectedListingStatus);
  };

  const handleKeywordConfirm = () => {
    applyFilters();
  };

  return (
    <View className="px-4 mt-4">
      <View className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500/10 via-white to-white shadow-[0_12px_28px_-18px_rgba(16,185,129,0.45)] backdrop-blur-sm">
        <View className="p-5 space-y-4">
          <View className="flex flex-col gap-3">
            <View className="flex flex-nowrap items-center gap-3">
              <View className="relative flex-1 min-w-0">
                <View className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <Text className="text-gray-400 text-lg">🔍</Text>
                </View>
                <Input
                  className="w-1/2 rounded-2xl border border-transparent bg-white/90 pl-12 pr-16 py-3 text-sm text-gray-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="搜索商品..."
                  value={keyword}
                  onInput={(event) => setKeyword(event.detail.value)}
                  onConfirm={handleKeywordConfirm}
                />
                {keyword.trim() !== "" && (
                  <View
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200/80 text-xs text-gray-500 shadow-sm"
                    onClick={handleKeywordClear}
                  >
                    <Text>✕</Text>
                  </View>
                )}
              </View>

              <View
                className="flex h-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 active:scale-95 active:shadow-md"
                onClick={() => applyFilters()}
              >
                <Text>搜索</Text>
              </View>
            </View>

            <View className="flex items-center gap-3">
              <View
                className={`flex h-12 items-center rounded-2xl border px-4 text-sm font-medium transition-colors ${
                  showAdvanced
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                }`}
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                <Text>{showAdvanced ? "收起筛选" : "筛选"}</Text>
                {hasActiveAdvancedFilter && (
                  <View className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                    <Text>ON</Text>
                  </View>
                )}
              </View>

              <View
                className={`flex h-12 items-center rounded-2xl border px-4 text-sm font-medium transition-colors ${
                  showSortOptions
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                }`}
                onClick={() => setShowSortOptions((prev) => !prev)}
              >
                <Text>{showSortOptions ? "收起排序" : "排序"}</Text>
                <Text className="ml-2 text-xs text-slate-500">
                  {getSortOption(getCurrentSortKey()).label}
                </Text>
              </View>
            </View>
          </View>

          {error && (
            <Text className="block text-xs font-medium text-rose-500">
              {error}
            </Text>
          )}

          {showAdvanced && (
            <View className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-inner shadow-slate-200/60">
              <View className="flex flex-col gap-4">
                {subCategories.length > 0 && (
                  <View className="flex flex-col gap-3">
                    <Text className="text-sm font-semibold text-slate-700">
                      商品大类
                    </Text>
                    <View className="flex flex-wrap gap-2">
                      <View
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          selectedSubCategoryId === undefined
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={async () => {
                          setSelectedSubCategoryId(undefined);
                          setSelectedCategoryId(undefined);
                          // 加载所有分类数据
                          try {
                            const categoryData = await secondhandApi.getAllCategories();
                            setCategories(categoryData);
                          } catch (error) {
                            console.error('加载分类失败:', error);
                          }
                          applyFilters(keyword, priceFrom, priceTo, undefined, undefined, selectedProductStatusId, selectedListingStatus);
                        }}
                      >
                        <Text>全部</Text>
                      </View>
                      {subCategories.map((subCategory) => (
                        <View
                          key={subCategory.id}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                            selectedSubCategoryId === subCategory.id
                              ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                          }`}
                          onClick={async () => {
                            setSelectedSubCategoryId(subCategory.id);
                            setSelectedCategoryId(undefined);
                            await loadCategoriesForSubCategory(subCategory.id);
                            applyFilters(keyword, priceFrom, priceTo, undefined, subCategory.id, selectedProductStatusId, selectedListingStatus);
                          }}
                        >
                          <Text>{subCategory.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 分类筛选 */}
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    商品细分类
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    <View
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        selectedCategoryId === undefined
                          ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                      }`}
                      onClick={() => {
                        setSelectedCategoryId(undefined);
                        applyFilters(keyword, priceFrom, priceTo, undefined, selectedSubCategoryId, selectedProductStatusId, selectedListingStatus);
                      }}
                    >
                      <Text>全部</Text>
                    </View>
                    {filteredCategories.map((category) => (
                      <View
                        key={category.id}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          selectedCategoryId === category.id
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          applyFilters(keyword, priceFrom, priceTo, category.id, selectedSubCategoryId, selectedProductStatusId, selectedListingStatus);
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

                {/* 商品状况筛选 */}
                {productStatuses.length > 0 && (
                  <View className="flex flex-col gap-3">
                    <Text className="text-sm font-semibold text-slate-700">
                      商品状况
                    </Text>
                    <View className="flex flex-wrap gap-2">
                      <View
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          selectedProductStatusId === undefined
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => {
                          setSelectedProductStatusId(undefined);
                          applyFilters(keyword, priceFrom, priceTo, selectedCategoryId, selectedSubCategoryId, undefined);
                        }}
                      >
                        <Text>全部</Text>
                      </View>
                      {productStatuses.map((status) => (
                        <View
                          key={status.id}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                            selectedProductStatusId === status.id
                              ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                          }`}
                          onClick={() => {
                            setSelectedProductStatusId(status.id);
                            applyFilters(keyword, priceFrom, priceTo, selectedCategoryId, selectedSubCategoryId, status.id);
                          }}
                        >
                          <Text>{status.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    上架状态
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    <View
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        selectedListingStatus === undefined
                          ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                      }`}
                      onClick={() => {
                        setSelectedListingStatus(undefined);
                        applyFilters(keyword, priceFrom, priceTo, selectedCategoryId, selectedSubCategoryId, selectedProductStatusId, undefined);
                      }}
                    >
                      <Text>全部</Text>
                    </View>
                    {listingStatusOptions.map((status) => (
                      <View
                        key={status.value}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          selectedListingStatus === status.value
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => {
                          setSelectedListingStatus(status.value);
                          applyFilters(keyword, priceFrom, priceTo, selectedCategoryId, selectedSubCategoryId, selectedProductStatusId, status.value);
                        }}
                      >
                        <Text>{status.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 价格范围筛选 */}
                <View className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Text className="text-sm font-semibold text-slate-700">
                    价格范围
                  </Text>
                  <Text className="text-xs text-slate-400">
                    支持输入单边范围，只填写最低价或最高价即可
                  </Text>
                </View>

                <View className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <View className="relative flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus-within:border-emerald-300">
                    <Text className="pointer-events-none text-xs text-slate-400">
                      最低价
                    </Text>
                    <Input
                      className="mt-1 w-full text-sm text-gray-700 focus:outline-none"
                      placeholder="¥0"
                      type="number"
                      value={priceFrom}
                      onInput={(event) => setPriceFrom(event.detail.value)}
                      onConfirm={handleKeywordConfirm}
                    />
                  </View>

                  <Text className="text-center text-slate-400 sm:w-10">-</Text>

                  <View className="relative flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus-within:border-emerald-300">
                    <Text className="pointer-events-none text-xs text-slate-400">
                      最高价
                    </Text>
                    <Input
                      className="mt-1 w-full text-sm text-gray-700 focus:outline-none"
                      placeholder="不限"
                      type="number"
                      value={priceTo}
                      onInput={(event) => setPriceTo(event.detail.value)}
                      onConfirm={handleKeywordConfirm}
                    />
                  </View>
                </View>

                <View className="flex flex-wrap gap-2 pt-1">
                  {presetRanges.map((range) => (
                    <View
                      key={range.label}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        priceFrom === `${range.from}` &&
                        (range.to === undefined
                          ? priceTo === ""
                          : priceTo === `${range.to}`)
                          ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                      }`}
                      onClick={() => handleQuickRange(range.from, range.to)}
                    >
                      <Text>{range.label}</Text>
                    </View>
                  ))}
                </View>

                <View className="flex items-center justify-between pt-2">
                  <View
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                    onClick={handleReset}
                  >
                    <Text>重置</Text>
                  </View>

                  <View
                    className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 active:scale-95"
                    onClick={() => applyFilters()}
                  >
                    <Text>应用价格筛选</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {showSortOptions && (
            <View className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-inner shadow-slate-200/60">
              <View className="flex flex-col gap-4">
                {/* 排序选项 */}
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    排序方式
                  </Text>
                  
                  {/* 第一行：时间 */}
                  <View className="flex flex-col gap-2">
                    <Text className="text-xs font-medium text-slate-600">按时间</Text>
                    <View className="flex gap-2">
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          getCurrentSortKey() === "latest"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("latest")}
                      >
                        <Text className="text-sm font-medium">最新</Text>
                      </View>
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          getCurrentSortKey() === "oldest"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("oldest")}
                      >
                        <Text className="text-sm font-medium">最早</Text>
                      </View>
                    </View>
                  </View>

                  {/* 第二行：价格 */}
                  <View className="flex flex-col gap-2">
                    <Text className="text-xs font-medium text-slate-600">按价格</Text>
                    <View className="flex gap-2">
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          getCurrentSortKey() === "priceHigh"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("priceHigh")}
                      >
                        <Text className="text-sm font-medium">从高到低</Text>
                      </View>
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          getCurrentSortKey() === "priceLow"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("priceLow")}
                      >
                        <Text className="text-sm font-medium">从低到高</Text>
                      </View>
                    </View>
                  </View>

                  {/* 第三行：使用状况 */}
                  <View className="flex flex-col gap-2">
                    <Text className="text-xs font-medium text-slate-600">按使用状况</Text>
                    <View className="flex gap-2">
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          getCurrentSortKey() === "conditionNew"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("conditionNew")}
                      >
                        <Text className="text-sm font-medium">从新到旧</Text>
                      </View>
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          getCurrentSortKey() === "conditionOld"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("conditionOld")}
                      >
                        <Text className="text-sm font-medium">从旧到新</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default SecondhandFiltersComponent;
