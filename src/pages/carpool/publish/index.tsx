import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Textarea, Switch } from '@tarojs/components'
import {
  DatePicker,
  Button,
  Picker,
  Toast
} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { carpoolApi, CreateCarpoolPost } from '../../../services/carpool'
import { useAuth } from '../../../context/auth'
import './index.less'

const CarpoolPublish: React.FC = () => {
  const { state: authState } = useAuth()
  const { isLoggedIn, userInfo } = authState

  // Form state (independent states)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [availableSeats, setAvailableSeats] = useState(1)
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [carDetails, setCarDetails] = useState('')
  const [insured, setInsured] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSeatsPicker, setShowSeatsPicker] = useState(false)

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preset quick routes
  const quickRoutes = [
    { origin: 'Toowong', destination: 'UQ' },
    { origin: 'City', destination: 'UQ' },
    { origin: 'Sunnybank', destination: 'City' },
    { origin: 'Indooroopilly', destination: 'UQ' },
  ]

  // Seats options
  const seatsOptions = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    text: `${i + 1}个座位`,
    value: (i + 1).toString()
  })), [])

  // no-op

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!origin || !origin.trim()) {
      newErrors.origin = '请输入出发地'
    }

    if (!destination || !destination.trim()) {
      newErrors.destination = '请输入目的地'
    }

    if (!departureTime) {
      newErrors.departureTime = '请选择出发时间'
    } 

    if (!availableSeats || availableSeats < 1 || availableSeats > 8) {
      newErrors.availableSeats = '座位数必须在1-8之间'
    }

    if (!price || !price.trim()) {
      newErrors.price = '请输入价格'
    } else {
      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = '价格必须为非负数'
      } else if (priceNum > 10000) {
        newErrors.price = '价格不能超过10000澳元'
      }
    }
    console.log(newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Clear error when user starts typing
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }



  // Quick helpers
  const swapRoute = () => {
    const o = origin
    const d = destination
    setOrigin(d)
    setDestination(o)
  }

  const applyQuickRoute = (route: { origin: string; destination: string }) => {
    setOrigin(route.origin)
    setDestination(route.destination)
  }

  // 初始化：编辑模式预填 or 发布默认值
  useEffect(() => {
    const params = Taro.getCurrentInstance()?.router?.params || {}
    const mode = params.mode
    const idStr = params.id
    if (mode === 'edit' && idStr) {
      const id = parseInt(idStr)
      if (!Number.isNaN(id)) {
        setIsEditMode(true)
        setEditingId(id)
        ;(async () => {
          const post = await carpoolApi.getCarpoolById(id)
          if (post) {
            setOrigin(post.origin || '')
            setDestination(post.destination || '')
            setDepartureTime(post.departureTime || '')
            setAvailableSeats(post.availableSeats || 1)
            setPrice(String(post.price ?? ''))
            setDescription(post.description || '')
            setCarDetails(post.carDetails || '')
            setInsured(!!post.insured)
          }
        })()
      }
    } else {
      setOrigin('Toowang')
      setDestination('UQ')
      setDepartureTime(new Date().toISOString())
      setAvailableSeats(1)
      setPrice('20')
      setDescription('')
      setCarDetails('')
      setInsured(false)
    }
  }, [])

  // Handle date picker confirm
  const handleDateConfirm = (_options: any, values: any) => {
    try {
      let selectedDate: Date

      if (Array.isArray(values) && values.length >= 5) {
        // values format: [year, month, day, hour, minute]
        const year = values[0]
        const month = values[1] - 1 // JavaScript months are 0-indexed
        const day = values[2]
        const hour = values[3]
        const minute = values[4]

        selectedDate = new Date(year, month, day, hour, minute)
      } else if (values instanceof Date) {
        selectedDate = values
      } else {
        // Fallback to current date + 1 hour
        selectedDate = new Date()
        selectedDate.setHours(selectedDate.getHours() + 1)
      }

      setDepartureTime(selectedDate.toISOString())
      if (errors.departureTime) setErrors(prev => ({ ...prev, departureTime: '' }))
    } catch (error) {
      console.error('Error processing date:', error)
      showToastMessage('日期选择出错，请重试')
    }

    setShowDatePicker(false)
  }

  // Handle seats picker confirm
  const handleSeatsConfirm = (values: any) => {
    try {
      let selectedSeats: number

      if (Array.isArray(values) && values.length > 0) {
        // Extract value from picker option object or use directly
        const value = values[0]
        if (typeof value === 'object' && 'value' in value) {
          selectedSeats = parseInt(value.value)
        } else {
          selectedSeats = parseInt(value)
        }
      } else {
        selectedSeats = 1 // Default fallback
      }

      if (isNaN(selectedSeats) || selectedSeats < 1 || selectedSeats > 8) {
        selectedSeats = 1
      }

      setAvailableSeats(selectedSeats)
      if (errors.availableSeats) setErrors(prev => ({ ...prev, availableSeats: '' }))
    } catch (error) {
      console.error('Error processing seats selection:', error)
      setAvailableSeats(1)
    }

    setShowSeatsPicker(false)
  }



  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!isLoggedIn || !userInfo) {
      showToastMessage('请先登录')
      return
    }

    if (!validateForm()) {
      showToastMessage('请检查表单信息')
      return
    }

    try {
      setLoading(true)

      const carpoolData: Omit<CreateCarpoolPost, 'userId'> = {
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime,
        availableSeats,
        price: price.trim(),
        description: description.trim() || undefined,
        carDetails: carDetails.trim() || undefined,
        insured
      }

      if (isEditMode && editingId) {
        const result = await carpoolApi.updateCarpoolByOpenId(userInfo.openid, editingId, carpoolData)
        if (result) {
          showToastMessage('保存成功')
        } else {
          throw new Error('API returned null response')
        }
      } else {
        const result = await carpoolApi.createCarpool(parseInt(userInfo.id), carpoolData)
        if (result) {
          showToastMessage('发布成功')
        } else {
          throw new Error('API returned null response')
        }
      }

      // Navigate back to previous page after a short delay
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('发布/保存拼车信息失败:', error)

      // More detailed error handling
      let errorMessage = '操作失败，请重试'
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络后重试'
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = '登录已过期，请重新登录'
        } else if (error.message.includes('400') || error.message.includes('validation')) {
          errorMessage = '提交的信息有误，请检查后重试'
        }
      }

      showToastMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel/back
  const handleCancel = () => {
    Taro.navigateBack()
  }

  // Format date for display
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '请选择出发时间'
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }


  return (
    <View className='carpool-publish-container'>
      <View className='header-section'>
        <Text className='page-title'>{isEditMode ? '编辑拼车' : '发布拼车'}</Text>
      </View>

      <View className='form-container'>
        {/* Quick actions */}
        <View className='quick-row'>
          <View className='quick-chips'>
            {quickRoutes.map((r, idx) => (
              <View key={idx} className='qchip' onClick={() => applyQuickRoute(r)}>
                {r.origin} → {r.destination}
              </View>
            ))}
          </View>
          <Button size='small' className='swap-route' onClick={swapRoute}>⇄ 互换</Button>
        </View>
        {/* Route Row */}
        <View className='form-section'>
          <Text className='section-title'>出行路线</Text>
          <View className='form-row two-cols'>
            <View className={`form-field ${errors.origin ? 'error' : ''}`}>
              <Text className='field-label required'>出发地</Text>
              <Input
                className='field-input'
                placeholder="请输入出发地"
                value={origin}
                onInput={(e) => {
                  setOrigin(e.detail.value)
                  clearError('origin')
                }}
              />
              {errors.origin && <Text className='field-error'>{errors.origin}</Text>}
            </View>

            <View className={`form-field ${errors.destination ? 'error' : ''}`}>
              <Text className='field-label required'>目的地</Text>
              <Input
                className='field-input'
                placeholder="请输入目的地"
                value={destination}
                onInput={(e) => {
                  setDestination(e.detail.value)
                  clearError('destination')
                }}
              />
              {errors.destination && <Text className='field-error'>{errors.destination}</Text>}
            </View>
          </View>
        </View>

        {/* Departure Time */}
        <View className='form-section'>
          <Text className='section-title'>出发时间</Text>
          <View className={`form-field ${errors.departureTime ? 'error' : ''}`}>
            <Text className='field-label required'>选择时间</Text>
            <View 
              className='picker-field'
              onClick={() => setShowDatePicker(true)}
            >
              <Text className={departureTime ? 'picker-value' : 'picker-placeholder'}>
                {formatDateForDisplay(departureTime)}
              </Text>
              <Text className='picker-icon'>▼</Text>
            </View>
            {errors.departureTime && <Text className='field-error'>{errors.departureTime}</Text>}
          </View>
        </View>

        {/* Seats & Price Row */}
        <View className='form-section'>
          <Text className='section-title'>价格座位</Text>
          <View className='form-row two-cols'>
            <View className={`form-field ${errors.availableSeats ? 'error' : ''}`}>
              <Text className='field-label required'>可用座位</Text>
              <View 
                className='picker-field'
                onClick={() => setShowSeatsPicker(true)}
              >
                <Text className='picker-value'>{availableSeats}个座位</Text>
                <Text className='picker-icon'>▼</Text>
              </View>
              {errors.availableSeats && <Text className='field-error'>{errors.availableSeats}</Text>}
              <Text className='field-hint'>支持 1 - 8 个座位</Text>
            </View>

            <View className={`form-field ${errors.price ? 'error' : ''}`}>
              <Text className='field-label required'>价格</Text>
              <View className='price-input-wrapper'>
                <Text className='currency-symbol'>$</Text>
                <Input
                  className='field-input price-input'
                  type="number"
                  placeholder="请输入价格"
                  value={price}
                  onInput={(e) => {
                    setPrice(e.detail.value)
                    clearError('price')
                  }}
                />
                <Text className='currency-unit'>AUD</Text>
              </View>
              {errors.price && <Text className='field-error'>{errors.price}</Text>}
              <Text className='field-hint'>0 表示免费</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className='form-section'>
          <Text className='section-title'>补充信息</Text>
          <View className='form-field'>
            <Text className='field-label'>拼车描述</Text>
            <Textarea
              className='field-textarea'
              placeholder="请输入拼车描述（可选）"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={200}
              autoHeight
            />
            <Text className='field-hint'>剩余 {200 - description.length} 字</Text>
          </View>

          <View className='form-field'>
            <Text className='field-label'>车辆详情</Text>
            <Textarea
              className='field-textarea'
              placeholder="请输入车辆详情（如车型、颜色、车牌等）"
              value={carDetails}
              onInput={(e) => setCarDetails(e.detail.value)}
              maxlength={150}
              autoHeight
            />
            <Text className='field-hint'>剩余 {150 - carDetails.length} 字</Text>
          </View>

          <View className='form-field switch-field'>
            <Text className='field-label'>车辆保险</Text>
            <View className='switch-wrapper'>
              <Text className='switch-label'>车辆是否有保险</Text>
              <Switch
                checked={insured}
                onChange={(e) => setInsured(e.detail.value)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className='action-buttons'>
        <Button 
          type="default" 
          className='cancel-button'
          onClick={handleCancel}
        >
          取消
        </Button>
        <Button 
          type="primary" 
          className='submit-button'
          onClick={handleSubmit}
          loading={loading}
        >
          {loading ? (isEditMode ? '保存中...' : '发布中...') : (isEditMode ? '保存修改' : '发布拼车')}
        </Button>
      </View>

      {/* Date Picker */}
      <DatePicker
        visible={showDatePicker}
        type="datetime"
        title="选择出发时间"
        onConfirm={handleDateConfirm}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Seats Picker */}
      <Picker
        visible={showSeatsPicker}
        options={seatsOptions}
        title="选择座位数"
        onConfirm={handleSeatsConfirm}
        onClose={() => setShowSeatsPicker(false)}
      />



      {/* Toast */}
      <Toast
        content={toastMessage}
        visible={showToast}
        type="text"
        onClose={() => setShowToast(false)}
      />
    </View>
  )
}

export default CarpoolPublish
