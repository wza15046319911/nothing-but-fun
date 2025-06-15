import React, { useState } from 'react'
import { View, Text, Input, Textarea, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'
import { secondhandApi } from 'src/services/secondhand'
import { useAuth } from 'src/context/auth'


const SecondHandPublish: React.FC = () => {
  // Form state
  const [title, setTitle] = useState('Sample title')
  const [description, setDescription] = useState('Sample description')
  const [price, setPrice] = useState('60')
  const [image, setImage] = useState<string>('')
  const { state } = useAuth()
  
  // Calculate if form is valid
  const isFormValid = 
    title.trim() !== '' && 
    description.trim() !== '' && 
    price.trim() !== '' && 
    image !== ''
  
  // Handle image upload
  const handleUploadImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        // Get a local file path
        const tempFilePaths = res.tempFilePaths
        setImage(tempFilePaths[0])
      }
    })
  }
  
  // Handle image delete
  const handleDeleteImage = () => {
    setImage('')
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

    // Show loading state
    Taro.showLoading({
      title: '发布中...'
    })

    Taro.uploadFile({
      url: 'https://nothing-but-fun-backend.vercel.app/api/secondhand/upload',
      filePath: image,
      name: 'image',
      formData: {
        'user': 'test'
      },
      success: async (res) => {
        const data = JSON.parse(res.data)
        const url = data.data.url
        const res1 = await secondhandApi.createItem({
          sellerId: state.userInfo?.openid || "",
          title: title,
          description: description,
          price: price,
          image: url,
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
      },
      fail: () => {
        Taro.hideLoading()
        Taro.showToast({
          title: '发布失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
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
          <View className='upload-desc'>上传清晰的商品照片, 最多1张</View>
          <View className='upload-grid'>
            
              <View className='upload-item'>
                <View className='upload-inner'>
                  <Image 
                    className='uploaded-image'
                    src={image}
                    mode='aspectFill'
                  />
                  <View 
                    className='delete-icon'
                    onClick={() => handleDeleteImage()}
                  >
                    ×
                  </View>
                </View>
              </View>
              <View className='upload-item' onClick={handleUploadImage}>
                <View className='upload-inner'>
                  <Text className='upload-icon'>+</Text>
                </View>
              </View>
          </View>
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