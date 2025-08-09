import React, { useMemo, useState } from 'react'
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Uploader, type FileItem } from '@nutui/nutui-react-taro'
import './index.less'
import { secondhandApi } from 'src/services/secondhand'
import { useAuth } from 'src/context/auth'

const SecondHandPublish: React.FC = () => {
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [fileList, setFileList] = useState<FileItem[]>([])
  const [titleTouched, setTitleTouched] = useState(false)
  const [descTouched, setDescTouched] = useState(false)
  const [priceTouched, setPriceTouched] = useState(false)
  const { state } = useAuth()
  
  const maxImages = 10
  
  // Calculate if form is valid
  const isFormValid = 
    title.trim().length > 0 && 
    description.trim().length > 0 && 
    price.trim().length > 0 && 
    !Number.isNaN(parseFloat(price)) &&
    parseFloat(price) > 0 &&
    fileList.length > 0

  const titleRemaining = useMemo(() => 30 - title.length, [title])
  const descRemaining = useMemo(() => 500 - description.length, [description])

  // Handle file operations - 只做本地预览，不上传
  const onDelete = (file: FileItem, files: FileItem[]) => {
    console.log('删除文件:', file)
    setFileList(files)
  }

  // 由于不使用自动上传，这些回调不会被触发，但保留以防需要
  const onSuccess = (param: { responseText: any; option: any; files: FileItem[] }) => {
    console.log('图片选择成功:', param)
    // 不需要处理上传，只更新本地文件列表
  }

  const onFailure = (param: { responseText: string; option: any; files: FileItem[] }) => {
    console.log('图片选择失败:', param)
  }

  // Handle file change - 当用户选择文件时
  const handleFileChange = (files: FileItem[]) => {
    console.log('文件列表更新:', files)
    setFileList(files)
  }

  const handleTitleInput = (value: string) => {
    setTitle(value)
  }

  const handleDescInput = (value: string) => {
    setDescription(value)
  }

  const handlePriceInput = (value: string) => {
    // 只允许数字和一个小数点，限制两位小数
    let sanitized = value.replace(/[^\d.]/g, '')
    const parts = sanitized.split('.')
    if (parts.length > 2) sanitized = parts[0] + '.' + parts.slice(1).join('')
    const [i = '', d = ''] = sanitized.split('.')
    const intPart = i.replace(/^0+(?=\d)/, '')
    const decPart = d.slice(0, 2)
    setPrice(decPart.length ? `${intPart}.${decPart}` : intPart)
  }
  
  // Handle form submission
  const handleSubmit = async() => {
    if (!isFormValid) {
      Taro.showToast({
        title: '请完善商品信息',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!state.userInfo?.id) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 检查是否有图片
    if (fileList.length === 0) {
      Taro.showToast({
        title: '请先选择商品图片',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // Show loading state
    Taro.showLoading({
      title: '发布中...'
    })

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://192.168.3.1:3000/api' 
        : 'https://nothing-but-fun-backend-production.up.railway.app/api'

      console.log('开始发布商品...')
      console.log('商品信息:', {
        sellerId: parseInt(state.userInfo.id),
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        status: 'available',
        imageCount: fileList.length
      })

      const fileIds: string[] = await Promise.all(fileList.map(async (file) => {
        const res = await Taro.uploadFile({
          url: `${API_BASE_URL}/file`,
          filePath: file.path || file.url || '',
          name: 'image',
        })
        const data = JSON.parse(res.data);
        return data.data.id;
      }))
      
      const res = await secondhandApi.createItem({
        sellerId: parseInt(state.userInfo.id),
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        status: 'available',
        images: fileIds
      })
      if (res.id) {
        Taro.hideLoading()
        Taro.showToast({
          title: '发布成功！',
          icon: 'success',
          duration: 2000
        })
        setTitle('')
        setDescription('')
        setPrice('')
        setFileList([])
        Taro.navigateBack()
      }
    } catch (error) {
      console.error('发布失败:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: error.message || '发布失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  return (
    <ScrollView className='publish-container' scrollY>
      {/* Hero */}
      <View className='publish-hero'>
        <Text className='hero-title'>发布二手好物</Text>
        <Text className='hero-subtitle'>清晰描述 + 优质图片，更快成交</Text>
        <View className='hero-stats'>
          <View className='stat'><Text className='stat-number'>{fileList.length}</Text><Text className='stat-label'>已选图片</Text></View>
          <View className='divider' />
          <View className='stat'><Text className='stat-number'>{Math.max(0, maxImages - fileList.length)}</Text><Text className='stat-label'>剩余可选</Text></View>
        </View>
      </View>
      {/* Basic Info Section */}
      <View className='form-section'>
        <View className='form-title'>基本信息</View>
        
        {/* Title */}
        <View className={`form-item ${titleTouched && title.trim() === '' ? 'error' : ''}`}>
          <Input 
            className='form-input'
            placeholder='标题（建议30字以内）'
            placeholderClass='form-placeholder'
            value={title}
            onInput={e => handleTitleInput(e.detail.value)}
            onBlur={() => setTitleTouched(true)}
            maxlength={30}
          />
          <View className='field-hint'>剩余 {Math.max(0, titleRemaining)} 字</View>
          {titleTouched && title.trim() === '' && (
            <View className='error-text'>请填写标题</View>
          )}
        </View>
        
        {/* Description */}
        <View className={`form-item ${descTouched && description.trim() === '' ? 'error' : ''}`}>
          <Textarea 
            className='form-textarea'
            placeholder='描述一下你的商品，例如：入手渠道、使用感受、新旧程度等'
            placeholderClass='form-placeholder'
            value={description}
            onInput={e => handleDescInput(e.detail.value)}
            onBlur={() => setDescTouched(true)}
            maxlength={500}
          />
          <View className='field-hint'>剩余 {Math.max(0, descRemaining)} 字</View>
          {descTouched && description.trim() === '' && (
            <View className='error-text'>请填写商品描述</View>
          )}
        </View>
      </View>
      
      {/* Image Upload Section */}
      <View className='form-section'>
        <View className='form-title'>上传图片</View>
        <View className='upload-section'>
          <View className='upload-desc'>选择清晰的商品照片（{fileList.length}/{maxImages} 张，支持拖动排序）</View>
          <Uploader
            value={fileList}
            onChange={handleFileChange}
            multiple
            maxCount={maxImages}
            onDelete={onDelete}
            onSuccess={onSuccess}
            onFailure={onFailure}
            accept="image/*"
            deletable
            preview
            autoUpload={false}
          />
        </View>
      </View>
      
      {/* Price & Condition Section */}
      <View className='form-section'>
        <View className='form-title'>价格</View>
        
        {/* Price */}
        <View className={`form-item ${priceTouched && (price.trim() === '' || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0) ? 'error' : ''}`}>
          <View className='form-item-row'>
            <View className='form-label'>售价</View>
            <Input 
              className='price-input'
              placeholder='0'
              placeholderClass='form-placeholder'
              value={price}
              onInput={e => handlePriceInput(e.detail.value)}
              onBlur={() => setPriceTouched(true)}
              type='digit'
            />
            <Text style={{ marginLeft: '4px' }}>AUD</Text>
          </View>
          {priceTouched && (price.trim() === '' || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0) && (
            <View className='error-text'>请输入有效的价格（大于 0）</View>
          )}
        </View>
      </View>
      
      {/* Tips Section */}
      <View className='tips-section'>
        <View className='tips-title'>发布提示</View>
        <View className='tips-list'>
          <View className='tips-item'>
            <Text className='tips-dot'>•</Text>
            <Text className='tips-text'>请确保所发布物品为您个人闲置，严禁发布虚假信息</Text>
          </View>
          <View className='tips-item'>
            <Text className='tips-dot'>•</Text>
            <Text className='tips-text'>严禁发布违禁物品，包括但不限于管制刀具、仿真枪等</Text>
          </View>
          <View className='tips-item'>
            <Text className='tips-dot'>•</Text>
            <Text className='tips-text'>请如实描述物品状况，提供清晰照片，保障买卖双方权益</Text>
          </View>
          <View className='tips-item'>
            <Text className='tips-dot'>•</Text>
            <Text className='tips-text'>图片将在发布时上传，发布后请耐心等待审核</Text>
          </View>
        </View>
      </View>
      
      {/* Submit Button */}
      <View className='submit-bar'>
        <View 
          className={`submit-button ${!isFormValid ? 'disabled' : ''}`}
          onClick={handleSubmit}
        >
          立即发布
        </View>
      </View>
    </ScrollView>
  )
}

export default SecondHandPublish 