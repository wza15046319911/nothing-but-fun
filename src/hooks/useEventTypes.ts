import { useState, useEffect } from 'react'
import { eventsApi, EventType } from '../services/events'

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
