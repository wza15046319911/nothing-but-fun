import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Input, Button, Toast } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/auth'
import type { UserInfo } from '../../services/auth'
import './index.less'

type FormKeys = 'email' | 'phone'

type FormState = Record<FormKeys, string>

type ErrorState = Partial<Record<FormKeys, string>>

const ContactInfo: React.FC = () => {
  const { state: authState, updateUserInfo } = useAuth()
  const { userInfo, openid } = authState

  const [formData, setFormData] = useState<FormState>({
    email: userInfo?.email || '',
    phone: userInfo?.phone || ''
  })
  const [errors, setErrors] = useState<ErrorState>({})
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setFormData({
      email: userInfo?.email || '',
      phone: userInfo?.phone || ''
    })
  }, [userInfo?.email, userInfo?.phone])

  const normalizeInputValue = (val: unknown): string => {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object') {
      // @ts-ignore - NutUI/Taro event payload variations
      if (typeof val.detail?.value === 'string') return val.detail.value
      // @ts-ignore - Support synthetic event target value
      if (typeof val.target?.value === 'string') return val.target.value
      // @ts-ignore - Some components pass { value }
      if (typeof val.value === 'string') return val.value
    }
    return String(val ?? '')
  }

  const handleFieldChange = (field: FormKeys, value: unknown) => {
    const rawText = normalizeInputValue(value)
    const nextValue = field === 'phone'
      ? rawText.replace(/[^\d]/g, '').slice(0, 10)
      : rawText

    setFormData(prev => ({
      ...prev,
      [field]: nextValue
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const triggerToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const validateForm = (): boolean => {
    const nextErrors: ErrorState = {}

    const email = formData.email.trim()
    const phone = formData.phone.trim()

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = '请输入有效的邮箱地址'
    }

    if (phone && !/^04\d{8}$/.test(phone)) {
      nextErrors.phone = '请输入有效的澳洲手机号（例如 04XXXXXXXX）'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      triggerToast('请检查输入信息')
      return
    }

    const trimmedEmail = formData.email.trim()
    const trimmedPhone = formData.phone.trim()
    const originalEmail = (userInfo?.email || '').trim()
    const originalPhone = (userInfo?.phone || '').trim()

    const hasChanges =
      trimmedEmail !== originalEmail ||
      trimmedPhone !== originalPhone

    if (!hasChanges) {
      triggerToast('没有检测到任何更改')
      return
    }

    try {
      setLoading(true)

      const updatePayload: Partial<UserInfo> = {}

      if (trimmedEmail !== originalEmail) {
        updatePayload.email = trimmedEmail || null
      }

      if (trimmedPhone !== originalPhone) {
        updatePayload.phone = trimmedPhone || null
      }

      if (openid || userInfo?.openid) {
        updatePayload.openid = openid || userInfo?.openid || undefined
      }

      const success = await updateUserInfo(updatePayload)

      if (success) {
        triggerToast('联系信息更新成功')
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        triggerToast('更新失败，请重试')
      }
    } catch (error) {
      console.error('更新联系信息失败:', error)
      triggerToast('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  const trimmedEmail = formData.email.trim()
  const trimmedPhone = formData.phone.trim()
  const hasChanges =
    trimmedEmail !== (userInfo?.email || '').trim() ||
    trimmedPhone !== (userInfo?.phone || '').trim()

  return (
    <View className='contact-info-container'>
      <ScrollView className='content' scrollY>
        <View className='hero-block'>
          <Text className='hero-title'>联系信息</Text>
          <Text className='hero-subtitle'>保持联系方式最新，便于我们与您保持联系</Text>
        </View>

        <View className='info-overview'>
          <View className='info-item'>
            <Text className='info-label'>当前邮箱</Text>
            <Text className={`info-value ${userInfo?.email ? '' : 'placeholder'}`}>
              {userInfo?.email || '未设置'}
            </Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>当前手机号</Text>
            <Text className={`info-value ${userInfo?.phone ? '' : 'placeholder'}`}>
              {userInfo?.phone || '未设置'}
            </Text>
          </View>
        </View>

        <View className='form-card'>
          <Text className='section-title'>更新联系方式</Text>

          <View className={`input-group ${errors.email ? 'has-error' : ''}`}>
            <Text className='input-label'>邮箱</Text>
            <Input
              type='text'
              placeholder='请输入常用邮箱（可选）'
              value={formData.email}
              onChange={(value) => handleFieldChange('email', value)}
              clearable
              disabled={loading}
            />
            {errors.email && <Text className='error-text'>{errors.email}</Text>}
          </View>

          <View className={`input-group ${errors.phone ? 'has-error' : ''}`}>
            <Text className='input-label'>手机号码</Text>
            <Input
              type='text'
              placeholder='请输入澳洲手机号（04 开头）'
              value={formData.phone}
              onChange={(value) => handleFieldChange('phone', value)}
              clearable
              disabled={loading}
            />
            {errors.phone && <Text className='error-text'>{errors.phone}</Text>}
          </View>

          <View className='tips-block'>
            <Text className='tips-title'>小贴士</Text>
            <Text className='tips-text'>• 邮箱将用于接收订单和活动通知</Text>
            <Text className='tips-text'>• 手机号建议填写澳洲本地号码 04XXXXXXXX</Text>
            <Text className='tips-text'>• 信息仅用于账户安全与服务通知</Text>
          </View>
        </View>
      </ScrollView>

      <View className='action-bar'>
        <Button
          type='default'
          className='cancel-button'
          onClick={handleCancel}
          disabled={loading}
        >
          取消
        </Button>
        <Button
          type='primary'
          className='submit-button'
          onClick={handleSubmit}
          loading={loading}
          disabled={loading || !hasChanges}
        >
          {loading ? '更新中...' : '保存更改'}
        </Button>
      </View>

      <Toast
        content={toastMessage}
        visible={showToast}
        type='text'
        onClose={() => setShowToast(false)}
      />
    </View>
  )
}

export default ContactInfo
