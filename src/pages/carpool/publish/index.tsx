import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import {
  Form,
  FormItem,
  Input,
  DatePicker,
  Button,
  TextArea,
  Picker,
  Toast,
  Switch
} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { carpoolApi, CreateCarpoolPost } from '../../../services/carpool'
import { useAuth } from '../../../context/auth'
import './index.less'

const CarpoolPublish: React.FC = () => {
  const { state: authState } = useAuth()
  const { isLoggedIn, userInfo } = authState

  // Form state
  const [formData, setFormData] = useState({
    origin: 'Toowang',
    destination: 'UQ',
    departureTime: new Date().toISOString(),
    availableSeats: 1,
    price: '20',
    description: 'wu',
    carDetails: '',
    insured: false
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSeatsPicker, setShowSeatsPicker] = useState(false)

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Seats options
  const seatsOptions = Array.from({ length: 8 }, (_, i) => ({
    text: `${i + 1}个座位`,
    value: (i + 1).toString()
  }))

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.origin || !formData.origin.trim()) {
      newErrors.origin = '请输入出发地'
    }

    if (!formData.destination || !formData.destination.trim()) {
      newErrors.destination = '请输入目的地'
    }

    if (!formData.departureTime) {
      newErrors.departureTime = '请选择出发时间'
    } 
    // else {
    //   try {
    //     const departureDate = new Date(formData.departureTime)
    //     const now = new Date()

    //     if (isNaN(departureDate.getTime())) {
    //       newErrors.departureTime = '出发时间格式不正确'
    //     } else if (departureDate <= now) {
    //       newErrors.departureTime = '出发时间不能早于当前时间'
    //     }
    //   } catch (error) {
    //     newErrors.departureTime = '出发时间格式不正确'
    //   }
    // }

    if (!formData.availableSeats || formData.availableSeats < 1 || formData.availableSeats > 8) {
      newErrors.availableSeats = '座位数必须在1-8之间'
    }

    if (!formData.price || !formData.price.trim()) {
      newErrors.price = '请输入价格'
    } else {
      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        newErrors.price = '价格必须为非负数'
      } else if (price > 10000) {
        newErrors.price = '价格不能超过10000澳元'
      }
    }
    console.log(newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Specific handlers for each field to avoid any potential issues
  const handleOriginChange = (value: string) => {
    handleFieldChange('origin', value)
  }

  const handleDestinationChange = (value: string) => {
    handleFieldChange('destination', value)
  }

  const handlePriceChange = (value: string) => {
    handleFieldChange('price', value)
  }

  const handleDescriptionChange = (value: string) => {
    handleFieldChange('description', value)
  }

  const handleCarDetailsChange = (value: string) => {
    handleFieldChange('carDetails', value)
  }

  const handleInsuredChange = (value: boolean) => {
    handleFieldChange('insured', value)
  }

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

      handleFieldChange('departureTime', selectedDate.toISOString())
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

      handleFieldChange('availableSeats', selectedSeats)
    } catch (error) {
      console.error('Error processing seats selection:', error)
      handleFieldChange('availableSeats', 1)
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
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        departureTime: formData.departureTime,
        availableSeats: formData.availableSeats,
        price: formData.price.trim(),
        description: formData.description.trim() || undefined,
        carDetails: formData.carDetails.trim() || undefined,
        insured: formData.insured
      }

      const result = await carpoolApi.createCarpool(parseInt(userInfo.id), carpoolData)

      if (result) {
        showToastMessage('发布成功')

        // Navigate back to carpool list after a short delay
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        throw new Error('API returned null response')
      }

    } catch (error) {
      console.error('发布拼车信息失败:', error)

      // More detailed error handling
      let errorMessage = '发布失败，请重试'
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
        <Text className='page-title'>发布拼车</Text>
      </View>

      <View className='form-container'>
        <Form>
          {/* Origin */}
          <FormItem 
            label="出发地" 
            required
            className={errors.origin ? 'form-item-error' : ''}
          >
            <Input
              placeholder="请输入出发地"
              value={formData.origin}
              onChange={handleOriginChange}
              clearable
            />
            {errors.origin && <Text className='error-text'>{errors.origin}</Text>}
          </FormItem>

          {/* Destination */}
          <FormItem 
            label="目的地" 
            required
            className={errors.destination ? 'form-item-error' : ''}
          >
            <Input
              placeholder="请输入目的地"
              value={formData.destination}
              onChange={handleDestinationChange}
              clearable
            />
            {errors.destination && <Text className='error-text'>{errors.destination}</Text>}
          </FormItem>

          {/* Departure Time */}
          <FormItem 
            label="出发时间" 
            required
            className={errors.departureTime ? 'form-item-error' : ''}
          >
            <View 
              className='picker-trigger'
              onClick={() => setShowDatePicker(true)}
            >
              <Text className={formData.departureTime ? 'picker-text' : 'picker-placeholder'}>
                {formatDateForDisplay(formData.departureTime)}
              </Text>
              <Text className='picker-arrow'>▼</Text>
            </View>
            {errors.departureTime && <Text className='error-text'>{errors.departureTime}</Text>}
          </FormItem>

          {/* Available Seats */}
          <FormItem 
            label="可用座位" 
            required
            className={errors.availableSeats ? 'form-item-error' : ''}
          >
            <View 
              className='picker-trigger'
              onClick={() => setShowSeatsPicker(true)}
            >
              <Text className='picker-text'>{formData.availableSeats}个座位</Text>
              <Text className='picker-arrow'>▼</Text>
            </View>
            {errors.availableSeats && <Text className='error-text'>{errors.availableSeats}</Text>}
          </FormItem>

          {/* Price */}
          <FormItem
            label="价格"
            required
            className={errors.price ? 'form-item-error' : ''}
          >
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ color: '#666', marginRight: '8rpx' }}>$</Text>
              <Input
                type="number"
                placeholder="请输入价格（澳元）"
                value={formData.price}
                onChange={handlePriceChange}
                clearable
                style={{ flex: 1 }}
              />
            </View>
            {errors.price && <Text className='error-text'>{errors.price}</Text>}
          </FormItem>

          {/* Description */}
          <FormItem label="描述" className='description-item'>
            <TextArea
              placeholder="请输入拼车描述（可选）"
              value={formData.description}
              onChange={handleDescriptionChange}
              rows={3}
              maxLength={200}
            />
          </FormItem>

          {/* Car Details */}
          <FormItem label="车辆详情" className='description-item'>
            <TextArea
              placeholder="请输入车辆详情（如车型、颜色、车牌等）"
              value={formData.carDetails}
              onChange={handleCarDetailsChange}
              rows={2}
              maxLength={150}
            />
          </FormItem>

          {/* Insurance */}
          <FormItem label="车辆保险">
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '28rpx', color: '#666' }}>
                车辆是否有保险
              </Text>
              <Switch
                checked={formData.insured}
                onChange={handleInsuredChange}
              />
            </View>
          </FormItem>
        </Form>
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
          {loading ? '发布中...' : '发布拼车'}
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
