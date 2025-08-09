import { useState, useEffect } from 'react'
import { eventsApi, EventType } from '../services/events'
import { restaurantApi, RestaurantType, PriceRange } from '../services/restaurant'

export const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        setLoading(true)
        setError(null)
        const types = await eventsApi.getEventTypes()
        setEventTypes(types)
      } catch (err) {
        console.error('加载活动类型失败:', err)
        setError('加载活动类型失败')
      } finally {
        setLoading(false)
      }
    }

    loadEventTypes()
  }, [])

  // 根据ID获取类型名称
  const getEventTypeName = (typeId: number | undefined): string => {
    if (!typeId) return '未分类'
    const type = eventTypes.find(t => t.id === typeId)
    return type?.name || `类型 ${typeId}`
  }

  // 根据ID获取类型对象
  const getEventType = (typeId: number | undefined): EventType | undefined => {
    if (!typeId) return undefined
    return eventTypes.find(t => t.id === typeId)
  }

  return {
    eventTypes,
    loading,
    error,
    getEventTypeName,
    getEventType
  }
}

export const useRestaurantTypes = () => {
  const [restaurantTypes, setRestaurantTypes] = useState<RestaurantType[]>([])
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [types, ranges] = await Promise.all([
          restaurantApi.getRestaurantTypes(),
          restaurantApi.getPriceRanges()
        ])
        setRestaurantTypes(types)
        setPriceRanges(ranges)
      } catch (err) {
        console.error('加载餐厅数据失败:', err)
        setError('加载餐厅数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadRestaurantData()
  }, [])

  // 根据ID获取餐厅类型名称
  const getRestaurantTypeName = (typeId: number | string | undefined): string => {
    if (!typeId) return '未分类'
    const numericId = typeof typeId === 'string' ? parseInt(typeId) : typeId
    const type = restaurantTypes.find(t => t.id === numericId)
    return type?.name || `类型 ${typeId}`
  }

  // 根据ID获取价格范围名称
  const getPriceRangeName = (rangeId: number | string | undefined): string => {
    if (!rangeId) return '未设定'
    const numericId = typeof rangeId === 'string' ? parseInt(rangeId) : rangeId
    const range = priceRanges.find(r => r.id === numericId)
    return range?.name || `价格 ${rangeId}`
  }

  return {
    restaurantTypes,
    priceRanges,
    loading,
    error,
    getRestaurantTypeName,
    getPriceRangeName
  }
}
