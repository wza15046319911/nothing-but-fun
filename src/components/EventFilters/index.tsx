import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';

// 活动类型接口
export interface EventType {
  id: number;
  name: string;
}

// 活动筛选参数接口
export interface EventFilters {
  keyword?: string;
  isHistorical?: boolean;
  event_type?: string;
  eventTypeRid?: number;
  isFree?: boolean;
  free?: boolean;
  priceFrom?: number;
  priceTo?: number;
  sortBy?: 'sort' | 'startTime' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void;
  initialFilters?: EventFilters;
}

const presetPriceRanges = [
  { label: '免费', isFree: true },
  { label: '$30以下', to: 30 },
  { label: '$30-60', from: 30, to: 60 },
  { label: '$60-100', from: 60, to: 100 },
  { label: '$100+', from: 100 },
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
  const [keyword, setKeyword] = useState(initialFilters.keyword ?? '');
  const [priceFrom, setPriceFrom] = useState(
    initialFilters.priceFrom !== undefined ? `${initialFilters.priceFrom}` : ''
  );
  const [priceTo, setPriceTo] = useState(
    initialFilters.priceTo !== undefined ? `${initialFilters.priceTo}` : ''
  );
  const [isFree, setIsFree] = useState(initialFilters.isFree ?? false);
  const [selectedEventTypeRid, setSelectedEventTypeRid] = useState<number | undefined>(
    initialFilters.eventTypeRid
  );
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

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
    () => priceFrom.trim() !== '' || priceTo.trim() !== '' || isFree,
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
      setError('请输入正确的价格范围');
      return;
    }

    setError('');
    onFiltersChange(payload);
  };

  const handleReset = () => {
    setKeyword('');
    setPriceFrom('');
    setPriceTo('');
    setIsFree(false);
    setSelectedEventTypeRid(undefined);
    setError('');

    const payload = buildFilterPayload(initialFilters, '', '', '', false, undefined);
    if (payload) {
      onFiltersChange(payload);
    }
  };

  const handleQuickRange = (range: {
    label: string;
    from?: number;
    to?: number;
    isFree?: boolean;
  }) => {
    if (range.isFree) {
      setIsFree(true);
      setPriceFrom('');
      setPriceTo('');
      applyFilters(keyword, '', '', true, selectedEventTypeRid);
    } else {
      const fromValue = range.from !== undefined ? `${range.from}` : '';
      const toValue = range.to !== undefined ? `${range.to}` : '';
      setIsFree(false);
      setPriceFrom(fromValue);
      setPriceTo(toValue);
      applyFilters(keyword, fromValue, toValue, false, selectedEventTypeRid);
    }
    setShowAdvanced(true);
  };

  const handleKeywordClear = () => {
    setKeyword('');
    applyFilters('', priceFrom, priceTo, isFree, selectedEventTypeRid);
  };

  const handleKeywordConfirm = () => {
    applyFilters();
  };

  const handleFreeToggle = () => {
    const newIsFree = !isFree;
    setIsFree(newIsFree);
    if (newIsFree) {
      setPriceFrom('');
      setPriceTo('');
    }
    applyFilters(
      keyword,
      newIsFree ? '' : priceFrom,
      newIsFree ? '' : priceTo,
      newIsFree,
      selectedEventTypeRid
    );
  };

  return (
    <View className="flex flex-col gap-4 px-4 mt-2 mb-2 sticky top-[100px] z-[99]">
      {/* 1. Floating Capsule Search Bar */}
      <View className="flex items-center gap-3 bg-white/80 backdrop-blur-md shadow-[0_8px_20px_-6px_rgba(31,38,135,0.15)] rounded-full p-2 border border-white/60 transition-all hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.2)]">
        <View className="flex-1 flex items-center pl-4 bg-transparent">
          <Text className="text-emerald-400 mr-2 text-lg">🔍</Text>
          <Input
            className="flex-1 bg-transparent text-slate-700 h-10 text-base placeholder-slate-400"
            placeholder="搜索精彩回顾..."
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
            showAdvanced || hasActivePriceFilter || hasActiveEventTypeFilter
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-white/60 border-white/60 text-slate-600 backdrop-blur-sm'
          }`}
          onClick={() => setShowAdvanced((prev) => !prev)}
        >
          <Text className="text-sm font-medium">筛选</Text>
          {(hasActivePriceFilter || hasActiveEventTypeFilter) && (
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
          )}
        </View>

        {/* Quick Event Types */}
        <View
          className={`flex-shrink-0 px-4 py-2 rounded-full border backdrop-blur-sm ${
            selectedEventTypeRid === undefined
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white/60 text-slate-600 border-white/60'
          }`}
          onClick={() => {
            setSelectedEventTypeRid(undefined);
            applyFilters(keyword, priceFrom, priceTo, isFree, undefined);
          }}
        >
          <Text className="text-sm font-medium">全部</Text>
        </View>

        {eventTypes.slice(0, 5).map((eventType) => (
          <View
            key={eventType.id}
            className={`flex-shrink-0 px-4 py-2 rounded-full border backdrop-blur-sm ${
              selectedEventTypeRid === eventType.id
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-white/60 text-slate-600 border-white/60'
            }`}
            onClick={() => {
              if (selectedEventTypeRid === eventType.id) {
                setSelectedEventTypeRid(undefined);
                applyFilters(keyword, priceFrom, priceTo, isFree, undefined);
              } else {
                setSelectedEventTypeRid(eventType.id);
                applyFilters(keyword, priceFrom, priceTo, isFree, eventType.id);
              }
            }}
          >
            <Text className="text-sm font-medium">{eventType.name}</Text>
          </View>
        ))}

        {/* Free Chip */}
        <View
          className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all ${
            isFree
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
              : 'bg-white/60 border-white/60 text-slate-600 backdrop-blur-sm'
          }`}
          onClick={handleFreeToggle}
        >
          <Text className="text-sm font-medium">免费活动</Text>
        </View>
      </View>

      {error && <Text className="block text-xs font-medium text-rose-500 px-2">{error}</Text>}

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
              {/* Event Types Grid */}
              <View className="flex flex-col gap-3">
                <Text className="text-sm font-bold text-slate-800">活动类型</Text>
                <View className="flex flex-wrap gap-2">
                  <View
                    className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                      selectedEventTypeRid === undefined
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedEventTypeRid(undefined);
                    }}
                  >
                    <Text>全部</Text>
                  </View>
                  {eventTypes.map((eventType) => (
                    <View
                      key={eventType.id}
                      className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
                        selectedEventTypeRid === eventType.id
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedEventTypeRid(
                          selectedEventTypeRid === eventType.id ? undefined : eventType.id
                        );
                      }}
                    >
                      <Text>{eventType.name}</Text>
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
                      onConfirm={handleKeywordConfirm}
                      disabled={isFree}
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
                      onConfirm={handleKeywordConfirm}
                      disabled={isFree}
                    />
                  </View>
                </View>

                <View className="flex flex-wrap gap-2">
                  {presetPriceRanges.map((range, index) => (
                    <View
                      key={index}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        (range.isFree && isFree) ||
                        (!isFree &&
                          priceFrom === `${range.from}` &&
                          (range.to === undefined ? priceTo === '' : priceTo === `${range.to}`))
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border border-transparent'
                      }`}
                      onClick={() => handleQuickRange(range)}
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
                  applyFilters(keyword, priceFrom, priceTo, isFree, selectedEventTypeRid);
                  setShowAdvanced(false);
                }}
              >
                <Text className="text-sm font-bold text-white">确认筛选</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EventFiltersComponent;
