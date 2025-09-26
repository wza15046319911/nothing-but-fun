import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Input } from "@tarojs/components";

// 活动类型接口
export interface EventType {
  id: number
  name: string
}

// 活动筛选参数接口
export interface EventFilters {
  keyword?: string
  isHistorical?: boolean
  event_type?: string
  eventTypeRid?: number
  isFree?: boolean
  priceFrom?: number
  priceTo?: number
  page?: number
  limit?: number
}

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void;
  initialFilters?: EventFilters;
}

const presetPriceRanges = [
  { label: "免费", isFree: true },
  { label: "¥30以下", to: 30 },
  { label: "¥30-60", from: 30, to: 60 },
  { label: "¥60-100", from: 60, to: 100 },
  { label: "¥100+", from: 100 },
];

const buildFilterPayload = (
  base: EventFilters,
  keyword: string,
  priceFrom: string,
  priceTo: string,
  isFree: boolean,
  eventTypeRid?: number
): EventFilters | undefined => {
  const next: EventFilters = { ...base };

  // Clear keyword & price & category fields before applying fresh values
  delete next.keyword;
  delete next.priceFrom;
  delete next.priceTo;
  delete next.isFree;
  delete next.eventTypeRid;

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword) {
    next.keyword = trimmedKeyword;
  }

  if (isFree) {
    next.isFree = true;
  } else {
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
  }

  if (eventTypeRid !== undefined && eventTypeRid > 0) {
    next.eventTypeRid = eventTypeRid;
  }

  return next;
};

const EventFiltersComponent: React.FC<EventFiltersProps> = ({
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
  const [isFree, setIsFree] = useState(initialFilters.isFree ?? false);
  const [selectedEventTypeRid, setSelectedEventTypeRid] = useState<number | undefined>(
    initialFilters.eventTypeRid
  );
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");

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
    setIsFree(initialFilters.isFree ?? initialFilters.free ?? false);
  }, [initialFilters.isFree, initialFilters.free]);

  useEffect(() => {
    setSelectedEventTypeRid(initialFilters.eventTypeRid);
  }, [initialFilters.eventTypeRid]);

  // 加载活动类型数据
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        // 动态导入 eventsApi
        const { eventsApi } = await import('../../services/events');
        const eventTypesData = await eventsApi.getEventTypes();
        setEventTypes(eventTypesData);
      } catch (error) {
        console.error('加载活动类型数据失败:', error);
        // 如果API失败，使用模拟数据作为备选
        const mockEventTypes = [
          { id: 1, name: '运动' },
          { id: 2, name: '文化' },
          { id: 3, name: '聚会' },
          { id: 4, name: '手工' },
          { id: 5, name: '美食' },
        ];
        setEventTypes(mockEventTypes);
      }
    };

    loadEventTypes();
  }, []);

  const hasActivePriceFilter = useMemo(
    () => priceFrom.trim() !== "" || priceTo.trim() !== "" || isFree,
    [priceFrom, priceTo, isFree]
  );

  const hasActiveEventTypeFilter = useMemo(
    () => selectedEventTypeRid !== undefined && selectedEventTypeRid > 0,
    [selectedEventTypeRid]
  );

  const applyFilters = (
    keywordValue = keyword,
    priceFromValue = priceFrom,
    priceToValue = priceTo,
    isFreeValue = isFree,
    eventTypeRidValue = selectedEventTypeRid
  ) => {
    const payload = buildFilterPayload(
      initialFilters,
      keywordValue,
      priceFromValue,
      priceToValue,
      isFreeValue,
      eventTypeRidValue
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
    setPriceFrom("");
    setPriceTo("");
    setIsFree(false);
    setSelectedEventTypeRid(undefined);
    setError("");

    const payload = buildFilterPayload(initialFilters, "", "", "", false, undefined);
    if (payload) {
      onFiltersChange(payload);
    }
  };

  const handleQuickRange = (range: { label: string; from?: number; to?: number; isFree?: boolean }) => {
    if (range.isFree) {
      setIsFree(true);
      setPriceFrom("");
      setPriceTo("");
      applyFilters(keyword, "", "", true, selectedEventTypeRid);
    } else {
      const fromValue = range.from !== undefined ? `${range.from}` : "";
      const toValue = range.to !== undefined ? `${range.to}` : "";
      setIsFree(false);
      setPriceFrom(fromValue);
      setPriceTo(toValue);
      applyFilters(keyword, fromValue, toValue, false, selectedEventTypeRid);
    }
    setShowAdvanced(true);
  };

  const handleKeywordClear = () => {
    setKeyword("");
    applyFilters("", priceFrom, priceTo, isFree, selectedEventTypeRid);
  };

  const handleKeywordConfirm = () => {
    applyFilters();
  };

  const handleFreeToggle = () => {
    const newIsFree = !isFree;
    setIsFree(newIsFree);
    if (newIsFree) {
      setPriceFrom("");
      setPriceTo("");
    }
    applyFilters(keyword, newIsFree ? "" : priceFrom, newIsFree ? "" : priceTo, newIsFree, selectedEventTypeRid);
  };

  return (
    <View className="px-4 mt-4">
      <View className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-500/10 via-white to-white shadow-[0_12px_28px_-18px_rgba(147,51,234,0.45)] backdrop-blur-sm">
        <View className="p-5 space-y-4">
          <View className="flex flex-col gap-3">
            <View className="flex flex-nowrap items-center gap-3">
              <View className="relative flex-1 min-w-0">
                <View className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <Text className="text-gray-400 text-lg">🔍</Text>
                </View>
                <Input
                  className="w-1/2 rounded-2xl border border-transparent bg-white/90 pl-12 pr-16 py-3 text-sm text-gray-700 shadow-inner focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  placeholder="搜索活动..."
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
                className="flex h-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 active:scale-95 active:shadow-md"
                onClick={() => applyFilters()}
              >
                <Text>搜索</Text>
              </View>
            </View>

            <View className="flex items-center gap-3">
              <View
                className={`flex h-12 items-center rounded-2xl border px-4 text-sm font-medium transition-colors ${
                  showAdvanced
                    ? "border-purple-300 bg-purple-50 text-purple-600"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:border-purple-200 hover:text-purple-500"
                }`}
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                <Text>{showAdvanced ? "收起筛选" : "筛选"}</Text>
                {(hasActivePriceFilter || hasActiveEventTypeFilter) && (
                  <View className="ml-2 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-semibold text-white">
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
                {/* 活动类型筛选 */}
                <View className="flex flex-col gap-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    活动类型
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    <View
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        selectedEventTypeRid === undefined
                          ? "border-purple-400 bg-purple-500 text-white shadow-md shadow-purple-400/40"
                          : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:text-purple-500"
                      }`}
                      onClick={() => {
                        setSelectedEventTypeRid(undefined);
                        applyFilters(keyword, priceFrom, priceTo, isFree, undefined);
                      }}
                    >
                      <Text>全部</Text>
                    </View>
                    {eventTypes.map((eventType) => (
                      <View
                        key={eventType.id}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          selectedEventTypeRid === eventType.id
                            ? "border-purple-400 bg-purple-500 text-white shadow-md shadow-purple-400/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:text-purple-500"
                        }`}
                        onClick={() => {
                          setSelectedEventTypeRid(eventType.id);
                          applyFilters(keyword, priceFrom, priceTo, isFree, eventType.id);
                        }}
                      >
                        <Text>{eventType.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 价格筛选 */}
                <View className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Text className="text-sm font-semibold text-slate-700">
                    价格筛选
                  </Text>
                  <Text className="text-xs text-slate-400">
                    选择免费活动或设置价格范围
                  </Text>
                </View>

                {/* 免费切换 */}
                <View className="flex items-center gap-3">
                  <View
                    className={`flex h-10 items-center rounded-xl border px-3 text-sm font-medium transition-all ${
                      isFree
                        ? "border-purple-400 bg-purple-500 text-white shadow-md shadow-purple-400/40"
                        : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:text-purple-500"
                    }`}
                    onClick={handleFreeToggle}
                  >
                    <Text>{isFree ? "✓ 免费活动" : "免费活动"}</Text>
                  </View>
                </View>

                {/* 价格范围输入（仅在非免费时显示） */}
                {!isFree && (
                  <View className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <View className="relative flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus-within:border-purple-300">
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

                    <View className="relative flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus-within:border-purple-300">
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
                )}

                {/* 快速价格选择 */}
                <View className="flex flex-col gap-2">
                  <Text className="text-sm font-medium text-slate-600">
                    快速选择
                  </Text>
                  <View className="flex flex-wrap gap-2">
                    {presetPriceRanges.map((range, index) => (
                      <View
                        key={index}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm hover:border-purple-200 hover:text-purple-500 active:scale-95"
                        onClick={() => handleQuickRange(range)}
                      >
                        <Text>{range.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="flex items-center justify-between pt-2">
                  <View
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-purple-200 hover:text-purple-500"
                    onClick={handleReset}
                  >
                    <Text>重置</Text>
                  </View>

                  <View
                    className="rounded-2xl bg-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-purple-500/30 active:scale-95"
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

export default EventFiltersComponent;