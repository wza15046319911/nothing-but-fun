import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Input } from "@tarojs/components";
import { RestaurantFilters } from "../../services/restaurant";
import { useRestaurantTypes } from "../../hooks/useTypes";

interface RestaurantFiltersProps {
  onFiltersChange: (filters: RestaurantFilters) => void;
  initialFilters?: RestaurantFilters;
}

const presetRatings = [
  { label: "⭐1+", rating: 1 },
  { label: "⭐2+", rating: 2 },
  { label: "⭐3+", rating: 3 },
  { label: "⭐4+", rating: 4 },
  { label: "⭐5", rating: 5 },
];

const presetPriceRanges = [
  { label: "¥20以下", to: 20 },
  { label: "¥20-40", from: 20, to: 40 },
  { label: "¥40-80", from: 40, to: 80 },
  { label: "¥80-150", from: 80, to: 150 },
  { label: "¥150+", from: 150 },
];

const buildFilterPayload = (
  base: RestaurantFilters,
  keyword: string,
  minRating?: number,
  priceFrom?: string,
  priceTo?: string,
  restaurantTypeRid?: string
): RestaurantFilters | undefined => {
  const next: RestaurantFilters = { ...base };

  // Clear fields before applying fresh values
  delete next.keyword;
  delete next.minRating;
  delete next.priceRangeRid;
  delete next.priceFrom;
  delete next.priceTo;
  delete next.restaurantTypeRid;

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword) {
    next.keyword = trimmedKeyword;
  }

  if (minRating !== undefined && minRating > 0) {
    next.minRating = minRating;
  }

  const fromRaw = (priceFrom ?? "").trim();
  const toRaw = (priceTo ?? "").trim();

  const fromValue = fromRaw !== "" ? Number(fromRaw) : undefined;
  const toValue = toRaw !== "" ? Number(toRaw) : undefined;

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

  if (restaurantTypeRid !== undefined && restaurantTypeRid !== "0") {
    next.restaurantTypeRid = restaurantTypeRid;
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
  const restaurantTypes = [{ id: 0, name: '全部类型' }, ...allRestaurantTypes];

  const [keyword, setKeyword] = useState(initialFilters.keyword ?? "");
  const [selectedMinRating, setSelectedMinRating] = useState<number | undefined>(
    initialFilters.minRating
  );
  const [priceFrom, setPriceFrom] = useState(
    initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : ""
  );
  const [priceTo, setPriceTo] = useState(
    initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : ""
  );
  const [selectedRestaurantTypeRid, setSelectedRestaurantTypeRid] = useState<string | undefined>(
    initialFilters.restaurantTypeRid
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");

  // Reflect upstream filter changes
  useEffect(() => {
    setKeyword(initialFilters.keyword ?? "");
  }, [initialFilters.keyword]);

  useEffect(() => {
    setSelectedMinRating(initialFilters.minRating);
  }, [initialFilters.minRating]);

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
    setSelectedRestaurantTypeRid(initialFilters.restaurantTypeRid);
  }, [initialFilters.restaurantTypeRid]);

  const hasActiveRatingFilter = useMemo(
    () => selectedMinRating !== undefined && selectedMinRating > 0,
    [selectedMinRating]
  );

  const hasActivePriceFilter = useMemo(
    () => priceFrom.trim() !== "" || priceTo.trim() !== "",
    [priceFrom, priceTo]
  );

  const hasActiveTypeFilter = useMemo(
    () => selectedRestaurantTypeRid !== undefined && selectedRestaurantTypeRid !== "0",
    [selectedRestaurantTypeRid]
  );

  const applyFilters = (
    keywordValue = keyword,
    minRatingValue = selectedMinRating,
    priceFromValue = priceFrom,
    priceToValue = priceTo,
    restaurantTypeValue = selectedRestaurantTypeRid
  ) => {
    const payload = buildFilterPayload(
      initialFilters,
      keywordValue,
      minRatingValue,
      priceFromValue,
      priceToValue,
      restaurantTypeValue
    );

    if (!payload) {
      setError("请输入正确的价格范围");
      return;
    }

    setError("");
    onFiltersChange(payload);
  };

  const handleReset = () => {
    setKeyword("");
    setSelectedMinRating(undefined);
    setPriceFrom("");
    setPriceTo("");
    setSelectedRestaurantTypeRid(undefined);
    setError("");

    const payload = buildFilterPayload(initialFilters, "", undefined, "", "", undefined);
    if (payload) {
      onFiltersChange(payload);
    }
  };

  const handleQuickRange = (from?: number, to?: number) => {
    const fromValue = from !== undefined ? `${from}` : "";
    const toValue = to !== undefined ? `${to}` : "";
    setPriceFrom(fromValue);
    setPriceTo(toValue);
    setShowAdvanced(true);
    applyFilters(keyword, selectedMinRating, fromValue, toValue, selectedRestaurantTypeRid);
  };

  const handleKeywordClear = () => {
    setKeyword("");
    applyFilters("", selectedMinRating, priceFrom, priceTo, selectedRestaurantTypeRid);
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
                  placeholder="搜索餐厅名称或描述..."
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
                {(hasActiveRatingFilter || hasActivePriceFilter || hasActiveTypeFilter) && (
                  <View className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                    <Text>ON</Text>
                  </View>
                )}
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
                {/* 餐厅类型筛选 */}
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    餐厅类型
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    {restaurantTypes.map((type) => (
                      <View
                        key={type.id}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          (selectedRestaurantTypeRid === undefined && type.id === 0) ||
                          selectedRestaurantTypeRid === type.id.toString()
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => {
                          const newValue = type.id === 0 ? undefined : type.id.toString();
                          setSelectedRestaurantTypeRid(newValue);
                          applyFilters(keyword, selectedMinRating, priceFrom, priceTo, newValue);
                        }}
                      >
                        <Text>{type.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 价格区间筛选 */}
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    价格区间
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    {presetPriceRanges.map((range) => {
                      const isActive =
                        (range.from !== undefined ? priceFrom === `${range.from}` : priceFrom === "") &&
                        (range.to !== undefined ? priceTo === `${range.to}` : priceTo === "");

                      return (
                        <View
                          key={range.label}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                            isActive
                              ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                          }`}
                          onClick={() => {
                            handleQuickRange(range.from, range.to);
                          }}
                        >
                          <Text>{range.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <View className="flex flex-wrap items-center gap-2">
                    <Input
                      className="w-24 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-600 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      type="number"
                      placeholder="最低价"
                      value={priceFrom}
                      onInput={(event) => setPriceFrom(event.detail.value)}
                    />
                    <Text className="text-slate-400">—</Text>
                    <Input
                      className="w-24 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-600 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      type="number"
                      placeholder="最高价"
                      value={priceTo}
                      onInput={(event) => setPriceTo(event.detail.value)}
                    />
                    {(priceFrom.trim() !== "" || priceTo.trim() !== "") && (
                      <View
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        onClick={() => {
                          setPriceFrom("");
                          setPriceTo("");
                          applyFilters(keyword, selectedMinRating, "", "", selectedRestaurantTypeRid);
                        }}
                      >
                        <Text>清除</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* 评分筛选 */}
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    最低评分
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    <View
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        selectedMinRating === undefined
                          ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                      }`}
                      onClick={() => {
                        setSelectedMinRating(undefined);
                        applyFilters(keyword, undefined, priceFrom, priceTo, selectedRestaurantTypeRid);
                      }}
                    >
                      <Text>全部</Text>
                    </View>
                    {presetRatings.map((item) => (
                      <View
                        key={item.rating}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          selectedMinRating === item.rating
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-500"
                        }`}
                        onClick={() => {
                          setSelectedMinRating(item.rating);
                          applyFilters(keyword, item.rating, priceFrom, priceTo, selectedRestaurantTypeRid);
                        }}
                      >
                        <Text>{item.label}</Text>
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
        </View>
      </View>
    </View>
  );
};

export default RestaurantFiltersComponent;
