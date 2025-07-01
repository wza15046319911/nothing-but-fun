import React, { useState } from 'react'
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Uploader, type FileItem } from '@nutui/nutui-react-taro'
import './index.less'
import { secondhandApi } from 'src/services/secondhand'
import { useAuth } from 'src/context/auth'

const SecondHandPublish: React.FC = () => {
  // Form state
  const [title, setTitle] = useState('Sample title')
  const [description, setDescription] = useState('Sample description')
  const [price, setPrice] = useState('60')
  const [fileList, setFileList] = useState<FileItem[]>([])
  const [fileIds, setFileIds] = useState<string[]>([])
  const { state } = useAuth()
  
  const maxImages = 6 // 最多支持6张图片
  
  // Calculate if form is valid
  const isFormValid = 
    title.trim() !== '' && 
    description.trim() !== '' && 
    price.trim() !== '' && 
    fileList.length > 0

  // Handle file operations
  const onDelete = (file: FileItem, files: FileItem[]) => {
    // console.log('delete file', file)
    setFileList(files)
    // 根据删除后的文件数量来调整 fileIds
    // 由于无法确定删除的是哪个具体文件，我们按照剩余文件数量来截取 fileIds
    setFileIds(prev => prev.slice(0, files.length))
  }

  const onSuccess = (param: { responseText: any; option: any; files: FileItem[] }) => {
    // console.log('upload success', param)
    try {
      const response = JSON.parse(param.responseText.data)
      const imageUrl = `https://res.cloudinary.com/ds9attzj6/image/upload/v1751287215/${response.data.filename_disk}`
      setFileIds(prev => [...prev, response.data.id])
      // console.log('File ID added:', response.data.id)
      
      // 由于 NutUI 的 bug，files 数组可能是空的，我们需要手动构建文件对象
      const newFile: FileItem = {
        uid: `upload_${Date.now()}`,
        name: `image_${fileIds.length + 1}`,
        url: imageUrl,
        status: 'success',
        type: 'image',
        message: ''
      }
      
      // 手动更新文件列表
      setFileList(prev => [...prev, newFile])
    } catch (error) {
      console.error('Upload response parsing error:', error)
    }
  }

  const onFailure = (param: { responseText: string; option: any; files: FileItem[] }) => {
    console.log('upload failure', param)
    Taro.showToast({
      title: '图片上传失败',
      icon: 'none',
      duration: 2000
    })
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

    // 检查所有图片是否上传成功
    if (fileIds.length === 0) {
      Taro.showToast({
        title: '请先上传商品图片',
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
      // Create item with first image as main image and all images in array
      const res1 = await secondhandApi.createItem({
        sellerId: state.userInfo?.openid || "",
        title: title,
        description: description,
        price: price,
        image: fileIds[0], // Use first image as main image
        images: fileIds, // Store all images
        status: 'available'
      })
      
      if (res1.id) {
        Taro.hideLoading()
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 2000)
      } else {
        Taro.hideLoading()
        Taro.showToast({
          title: '发布失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({
        title: '发布失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  return (
    <ScrollView className='publish-container' scrollY>
      {/* Basic Info Section */}
      <View className='form-section'>
        <View className='form-title'>基本信息</View>
        
        {/* Title */}
        <View className='form-item'>
          <Input 
            className='form-input'
            placeholder='标题（建议30字以内）'
            placeholderClass='form-placeholder'
            value={title}
            onInput={e => setTitle(e.detail.value)}
            maxlength={30}
          />
        </View>
        
        {/* Description */}
        <View className='form-item'>
          <Textarea 
            className='form-textarea'
            placeholder='描述一下你的商品，例如：入手渠道、使用感受、新旧程度等'
            placeholderClass='form-placeholder'
            value={description}
            onInput={e => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>
      </View>
      
      {/* Image Upload Section */}
      <View className='form-section'>
        <View className='form-title'>上传图片</View>
        <View className='upload-section'>
          <View className='upload-desc'>上传清晰的商品照片, 最多{maxImages}张 ({fileList.length}/{maxImages})</View>
          <Uploader
            url="https://nothing-but-fun-backend-production.up.railway.app/api/file"
            value={fileList}
            onChange={setFileList}
            multiple
            maxCount={maxImages}
            onDelete={onDelete}
            onSuccess={onSuccess}
            onFailure={onFailure}
            name="image"
            data={{ user: 'test' }}
            accept="image/*"
            deletable
            preview
          />
        </View>
      </View>
      
      {/* Price & Condition Section */}
      <View className='form-section'>
        <View className='form-title'>价格</View>
        
        {/* Price */}
        <View className='form-item'>
          <View className='form-item-row'>
            <View className='form-label'>售价</View>
            <Input 
              className='price-input'
              placeholder='0'
              placeholderClass='form-placeholder'
              value={price}
              onInput={e => setPrice(e.detail.value)}
              type='digit'
            />
            <Text style={{ marginLeft: '4px' }}>AUD</Text>
          </View>
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
            <Text className='tips-text'>发布后，请耐心等待审核，审核通过后，商品将显示在二手市场</Text>
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