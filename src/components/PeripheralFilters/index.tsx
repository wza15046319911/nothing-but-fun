import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Input } from "@tarojs/components";
import {
  PeripheralFilters,
  PeripheralCategory,
} from "../../services/peripherals";

interface PeripheralFiltersProps {
  onFiltersChange: (filters: PeripheralFilters) => void;
  initialFilters?: PeripheralFilters;
}

const presetPriceRanges = [
  { label: "¥30以下", to: 30 },
  { label: "¥30-60", from: 30, to: 60 },
  { label: "¥60-100", from: 60, to: 100 },
  { label: "¥100-200", from: 100, to: 200 },
  { label: "¥200+", from: 200 },
];

type SortOptionKey = "latest" | "oldest" | "priceLow" | "priceHigh" | "stock" | "stockLow";

const sortOptions: Array<{
  key: SortOptionKey;
  label: string;
  description: string;
  sortBy: PeripheralFilters["sortBy"];
  sortOrder: PeripheralFilters["sortOrder"];
}> = [
  {
    key: "latest",
    label: "最新上架",
    description: "按发布时间由新到旧",
    sortBy: "dateCreated",
    sortOrder: "desc",
  },
  {
    key: "oldest",
    label: "最早上架",
    description: "按发布时间由旧到新",
    sortBy: "dateCreated",
    sortOrder: "asc",
  },
  {
    key: "priceLow",
    label: "价格从低到高",
    description: "优先展示更实惠的商品",
    sortBy: "priceLow",
    sortOrder: "asc",
  },
  {
    key: "priceHigh",
    label: "价格从高到低",
    description: "优先展示高端精选",
    sortBy: "priceHigh",
    sortOrder: "desc",
  },
  {
    key: "stock",
    label: "库存从高到低",
    description: "优先显示库存充足商品",
    sortBy: "stock",
    sortOrder: "desc",
  },
  {
    key: "stockLow",
    label: "库存从低到高",
    description: "优先显示库存较少商品",
    sortBy: "stock",
    sortOrder: "asc",
  },
];

const getSortOption = (key: SortOptionKey) =>
  sortOptions.find((option) => option.key === key) ?? sortOptions[0];

const resolveSortKey = (
  sortBy?: PeripheralFilters["sortBy"],
  sortOrder?: PeripheralFilters["sortOrder"]
): SortOptionKey => {
  if (sortBy === "dateCreated" && sortOrder === "asc") {
    return "oldest";
  }
  if (sortBy === "priceLow" && sortOrder === "asc") {
    return "priceLow";
  }
  if (sortBy === "priceHigh" && sortOrder === "desc") {
    return "priceHigh";
  }
  if (sortBy === "stock" && sortOrder === "desc") {
    return "stock";
  }
  if (sortBy === "stock" && sortOrder === "asc") {
    return "stockLow";
  }
  return "latest";
};

const buildFilterPayload = (
  base: PeripheralFilters,
  keyword: string,
  priceFrom: string,
  priceTo: string,
  categoryId?: number,
  sortBy?: PeripheralFilters["sortBy"],
  sortOrder?: PeripheralFilters["sortOrder"]
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
  const [categories, setCategories] = useState<PeripheralCategory[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedSortKey, setSelectedSortKey] = useState<SortOptionKey>(
    resolveSortKey(initialFilters.sortBy, initialFilters.sortOrder)
  );

  // Reflect upstream filter changes (e.g. external reset/pagination updates)
  useEffect(() => {
    setKeyword(initialFilters.keyword ?? "");
  }, [initialFilters.keyword]);

  useEffect(() => {
    setPriceFrom(
      initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : ""
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
    () => priceFrom.trim() !== "" || priceTo.trim() !== "",
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
      setError("请输入正确的价格范围");
      return;
    }

    setError("");
    setShowSortOptions(false);
    onFiltersChange(payload);
  };

  const handleReset = () => {
    setKeyword("");
    setPriceFrom("");
    setPriceTo("");
    setSelectedCategoryId(undefined);
    setSelectedSortKey("latest");
    setShowSortOptions(false);
    setError("");

    const defaultSort = getSortOption("latest");
    const payload = buildFilterPayload(
      initialFilters,
      "",
      "",
      "",
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
    const toValue = to !== undefined ? `${to}` : "";
    setPriceFrom(fromValue);
    setPriceTo(toValue);
    setShowAdvanced(true);
    applyFilters(keyword, fromValue, toValue, selectedCategoryId);
  };

  const handleKeywordClear = () => {
    setKeyword("");
    applyFilters("", priceFrom, priceTo, selectedCategoryId);
  };

  const handleKeywordConfirm = () => {
    applyFilters();
  };

  const handleSortSelect = (optionKey: SortOptionKey) => {
    setSelectedSortKey(optionKey);
    setShowSortOptions(false);
    applyFilters(
      keyword,
      priceFrom,
      priceTo,
      selectedCategoryId,
      optionKey
    );
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
                  placeholder="搜索周边..."
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
              {(hasActivePriceFilter || hasActiveCategoryFilter) && (
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
                {getSortOption(selectedSortKey).label}
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
                {/* 分类筛选 */}
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    商品分类
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
                        applyFilters(keyword, priceFrom, priceTo, undefined);
                      }}
                    >
                      <Text>全部</Text>
                    </View>
                    {categories.map((category) => (
                      <View
                        key={category.id}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          selectedCategoryId === category.id
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          applyFilters(keyword, priceFrom, priceTo, category.id);
                        }}
                      >
                        <Text>{category.name}</Text>
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
                      最低价格
                    </Text>
                    <Input
                      className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-slate-700 focus:outline-none"
                      placeholder="0"
                      type="number"
                      value={priceFrom}
                      onInput={(event) => setPriceFrom(event.detail.value)}
                    />
                  </View>

                  <View className="flex-shrink-0 text-slate-400">
                    <Text>—</Text>
                  </View>

                  <View className="relative flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus-within:border-emerald-300">
                    <Text className="pointer-events-none text-xs text-slate-400">
                      最高价格
                    </Text>
                    <Input
                      className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-slate-700 focus:outline-none"
                      placeholder="不限"
                      type="number"
                      value={priceTo}
                      onInput={(event) => setPriceTo(event.detail.value)}
                    />
                  </View>
                </View>

                {/* 快速价格选择 */}
                <View className="flex flex-col gap-2">
                  <Text className="text-sm font-medium text-slate-600">
                    快速选择
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    {presetPriceRanges.map((range, index) => (
                      <View
                        key={index}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm hover:border-emerald-200 hover:text-emerald-500 active:scale-95"
                        onClick={() => handleQuickRange(range.from || 0, range.to)}
                      >
                        <Text>{range.label}</Text>
                      </View>
                    ))}
                  </View>
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
                    <Text>应用筛选</Text>
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
                          selectedSortKey === "latest"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("latest")}
                      >
                        <Text className="text-sm font-medium">最新</Text>
                      </View>
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          selectedSortKey === "oldest"
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
                          selectedSortKey === "priceLow"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("priceLow")}
                      >
                        <Text className="text-sm font-medium">从低到高</Text>
                      </View>
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          selectedSortKey === "priceHigh"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("priceHigh")}
                      >
                        <Text className="text-sm font-medium">从高到低</Text>
                      </View>
                    </View>
                  </View>

                  {/* 第三行：库存 */}
                  <View className="flex flex-col gap-2">
                    <Text className="text-xs font-medium text-slate-600">按库存</Text>
                    <View className="flex gap-2">
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          selectedSortKey === "stock"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("stock")}
                      >
                        <Text className="text-sm font-medium">从高到低</Text>
                      </View>
                      <View
                        className={`flex-1 rounded-xl border px-3 py-2 text-center transition-all ${
                          selectedSortKey === "stockLow"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => handleSortSelect("stockLow")}
                      >
                        <Text className="text-sm font-medium">从低到高</Text>
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

export default PeripheralFiltersComponent;
