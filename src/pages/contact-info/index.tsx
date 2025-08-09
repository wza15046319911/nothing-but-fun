import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Form, FormItem, Input, Button, Toast } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/auth'
import './index.less'

const ContactInfo: React.FC = () => {
  const { state: authState, updateUserInfo } = useAuth()
  const { userInfo, openid } = authState

  // Form state
  const [formData, setFormData] = useState({
    contact: userInfo?.contact || ''
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.contact && !formData.contact.trim()) {
      newErrors.contact = '请输入有效的联系方式'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const normalizeInputValue = (val: any): string => {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object') {
      // Support NutUI/Taro event payloads
      // @ts-ignore
      if (typeof val.detail?.value === 'string') return val.detail.value
      // @ts-ignore
      if (typeof val.target?.value === 'string') return val.target.value
      // Some components pass { value }
      // @ts-ignore
      if (typeof val.value === 'string') return val.value
    }
    return String(val ?? '')
  }

  // Handle field changes
  const handleFieldChange = (field: 'contact', value: any) => {
    const text = normalizeInputValue(value)
    setFormData(prev => ({
      ...prev,
      [field]: text
    }))

    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      showToastMessage('请检查输入信息')
      return
    }

    // Check if any changes were made
    const hasChanges = formData.contact !== (userInfo?.contact || '')

    if (!hasChanges) {
      showToastMessage('没有检测到任何更改')
      return
    }

    try {
      setLoading(true)

      const updateData: { contact?: string; openid?: string } = {}
      
      if (formData.contact !== (userInfo?.contact || '')) {
        updateData.contact = formData.contact.trim() || undefined
      }
      // Always include openid for backend update association
      if (openid || userInfo?.openid) {
        updateData.openid = openid || (userInfo?.openid as string)
      }

      const success = await updateUserInfo(updateData)

      if (success) {
        showToastMessage('联系信息更新成功')
        
        // Navigate back after a short delay
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        showToastMessage('更新失败，请重试')
      }
    } catch (error) {
      console.error('更新联系信息失败:', error)
      showToastMessage('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    Taro.navigateBack()
  }

  // Check if form has changes
  const hasChanges = formData.contact !== (userInfo?.contact || '')

  return (
    <View className='contact-info-container'>
      <ScrollView className='content' scrollY>
        {/* Header */}
        <View className='header-section'>
          <Text className='page-title'>联系信息</Text>
          <Text className='page-subtitle'>更新您的联系方式</Text>
        </View>

        {/* Form */}
        <View className='form-container'>
          <Form>
            {/* Current Info Display */}
            <View className='current-info-section'>
              <Text className='section-title'>当前信息</Text>
              
              <View className='info-item'>
                <Text className='info-label'>联系方式</Text>
                <Text className='info-value'>
                  {userInfo?.contact || '未设置'}
                </Text>
              </View>
            </View>

            {/* Update Form */}
            <View className='update-form-section'>
              <Text className='section-title'>更新信息</Text>

              {/* Contact */}
              <FormItem 
                // label="联系方式" 
                className={errors.contact ? 'form-item-error' : ''}
              >
                <Input
                  type="text"
                  placeholder="请输入联系方式（可选）"
                  value={formData.contact}
                  onChange={(value) => handleFieldChange('contact', value)}
                  clearable
                  disabled={loading}
                />
                {errors.contact && <Text className='error-text'>{errors.contact}</Text>}
              </FormItem>

              {/* Tips */}
              <View className='tips-section'>
                <Text className='tip-title'>提示：</Text>
                <Text className='tip-text'>• 联系方式是可选的，目前仅支持邮箱联系</Text>
                <Text className='tip-text'>• 联系信息将用于重要通知和账户安全</Text>
              </View>
            </View>
          </Form>
        </View>

        {/* Action Buttons */}
        <View className='action-buttons'>
          <Button 
            type="default" 
            className='cancel-button'
            onClick={handleCancel}
            disabled={loading}
          >
            取消
          </Button>
          <Button 
            type="primary" 
            className='submit-button'
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !hasChanges}
          >
            {loading ? '更新中...' : '保存更改'}
          </Button>
        </View>
      </ScrollView>

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

export default ContactInfo
