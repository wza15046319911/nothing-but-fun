import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'
import { secondhandApi } from 'src/services/secondhand'
import { API_BASE_URL } from 'src/services/api'
import { useAuth } from 'src/context/auth'

import "@taroify/core/uploader/style"
import { Uploader } from "@taroify/core"

const SecondHandPublish: React.FC = () => {
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [fileList, setFileList] = useState<Uploader.File[]>([])
  const [titleTouched, setTitleTouched] = useState(false)
  const [descTouched, setDescTouched] = useState(false)
  const [priceTouched, setPriceTouched] = useState(false)
  const { state } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  
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

  const handleUpload = () => {
    Taro.chooseImage({
      count: maxImages - fileList.length,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
    }).then(({ tempFiles }) => {
      setFileList([
        ...fileList,
        ...tempFiles.map(({ path, type, originalFileObj }) => ({
          type,
          url: path,
          name: originalFileObj?.name,
        })),
      ])
    })

  }

  // Handle file change - 当用户选择文件时
  const handleFileChange = (files: Uploader.File[]) => {
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

  // 初始化：判断是否为编辑模式并预加载数据
  useEffect(() => {
    const params = Taro.getCurrentInstance()?.router?.params || {}
    const mode = params.mode
    const idStr = params.id
    if (mode === 'edit' && idStr) {
      const id = parseInt(idStr)
      if (!Number.isNaN(id)) {
        setIsEditMode(true)
        setEditingItemId(id)
        ;(async () => {
          try {
            const item = await secondhandApi.getItemById(id)
            setTitle(item.title || '')
            setDescription(item.description || '')
            setPrice(item.price ? String(item.price) : '')
            const existingImages = (item.imageUrls || [])
              .filter(Boolean)
              .map((url) => ({ url } as Uploader.File))
            setFileList(existingImages)
          } catch (e) {
            console.error('加载商品详情失败:', e)
            Taro.showToast({ title: '加载失败', icon: 'none' })
          }
        })()
      }
    }
  }, [])
  
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
      title: isEditMode ? '保存中...' : '发布中...'
    })

    try {
      if (isEditMode && editingItemId) {
        // 仅上传新增的本地图片（有 path 的）
        const newLocalFiles = fileList.filter(f => (f as any).path)
        let fileIds: string[] | undefined = undefined
        if (newLocalFiles.length > 0) {
          fileIds = await Promise.all(newLocalFiles.map(async (file) => {
            const res = await Taro.uploadFile({
              url: `${API_BASE_URL}/file`,
              filePath: (file as any).path || file.url || '',
              name: 'image',
            })
            const data = JSON.parse(res.data)
            return data.data.id
          }))
        }

        const payload: any = {
          title: title.trim(),
          description: description.trim(),
          price: price.trim(),
        }
        if (fileIds && fileIds.length > 0) {
          payload.images = fileIds
        }

        await secondhandApi.updateUserItem(
          state.userInfo.openid,
          editingItemId,
          payload
        )

        Taro.hideLoading()
        Taro.showToast({ title: '修改成功！', icon: 'success', duration: 2000 })
        Taro.navigateBack()
      } else {
        // 新建
        console.log('开始发布商品...')
        const fileIds: string[] = await Promise.all(fileList.map(async (file) => {
          const res = await Taro.uploadFile({
            url: `${API_BASE_URL}/file`,
            filePath: (file as any).path || file.url || '',
            name: 'image',
          })
          const data = JSON.parse(res.data)
          return data.data.id
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
          Taro.showToast({ title: '发布成功！', icon: 'success', duration: 2000 })
          setTitle('')
          setDescription('')
          setPrice('')
          setFileList([])
          Taro.navigateBack()
        }
      }
    } catch (error) {
      console.error('发布失败:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: (error as any).message || '操作失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  return (
    <ScrollView className='publish-page' scrollY>
      <View className='publish-page__header'>
        <Text className='publish-page__title'>{isEditMode ? '编辑二手商品' : '发布二手商品'}</Text>
        <Text className='publish-page__subtitle'>完善标题、描述与图片，能让好物更快找到买家</Text>
        <View className='publish-page__stats'>
          <View className='publish-page__stats-item'>
            <Text className='publish-page__stats-value'>{fileList.length}</Text>
            <Text className='publish-page__stats-label'>已选图片</Text>
          </View>
          <View className='publish-page__stats-divider' />
          <View className='publish-page__stats-item'>
            <Text className='publish-page__stats-value'>{Math.max(0, maxImages - fileList.length)}</Text>
            <Text className='publish-page__stats-label'>可再添加</Text>
          </View>
        </View>
      </View>

      <View className='publish-page__body'>
        <View className='card'>
          <Text className='card__title'>商品图片</Text>
          <Text className='card__subtitle'>至少上传 1 张清晰照片，最多 {maxImages} 张，支持相册或拍照</Text>
          <View className='card__content card__content--uploader'>
            <Uploader
              value={fileList}
              onUpload={handleUpload}
              onChange={handleFileChange}
              multiple
              maxFiles={maxImages}
              removable
            />
          </View>
        </View>

        <View className='card'>
          <Text className='card__title'>基本信息</Text>
          <View className='card__content card__content--gap'>
            <View className={`field ${titleTouched && title.trim() === '' ? 'field--error' : ''}`}>
              <View className='field__label'>标题</View>
              <Input
                className='field__input'
                placeholder='如：95新 Nintendo Switch OLED 主机'
                placeholderClass='field__placeholder'
                value={title}
                onInput={(e) => handleTitleInput(e.detail.value)}
                onBlur={() => setTitleTouched(true)}
                maxlength={30}
              />
              <View className='field__hint'>还可输入 {Math.max(0, titleRemaining)} 个字符</View>
              {titleTouched && title.trim() === '' && (
                <View className='field__error'>请填写标题</View>
              )}
            </View>

            <View className={`field field--textarea ${descTouched && description.trim() === '' ? 'field--error' : ''}`}>
              <View className='field__label'>商品描述</View>
              <Textarea
                className='field__textarea'
                placeholder='推荐写上入手渠道、使用情况、成色、配件等关键信息'
                placeholderClass='field__placeholder'
                value={description}
                onInput={(e) => handleDescInput(e.detail.value)}
                onBlur={() => setDescTouched(true)}
                maxlength={500}
              />
              <View className='field__hint'>剩余 {Math.max(0, descRemaining)} 个字符</View>
              {descTouched && description.trim() === '' && (
                <View className='field__error'>请填写商品描述</View>
              )}
            </View>
          </View>
        </View>

        <View className='card'>
          <Text className='card__title'>售价</Text>
          <View className='card__content card__content--gap'>
            <View className={`field ${priceTouched && (price.trim() === '' || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0) ? 'field--error' : ''}`}>
              <View className='field__label'>标价 (AUD)</View>
              <Input
                className='field__input field__input--price'
                placeholder='0.00'
                placeholderClass='field__placeholder'
                value={price}
                onInput={(e) => handlePriceInput(e.detail.value)}
                onBlur={() => setPriceTouched(true)}
                type='digit'
              />
              {priceTouched && (price.trim() === '' || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0) && (
                <View className='field__error'>请输入有效的价格（大于 0）</View>
              )}
            </View>
          </View>
        </View>

        <View className='card card--tips'>
          <Text className='card__title'>发布须知</Text>
          <View className='tips'>
            <View className='tips__item'>
              <View className='tips__dot' />
              <Text className='tips__text'>请确认商品为个人闲置物品，严禁发布虚假或违规内容</Text>
            </View>
            <View className='tips__item'>
              <View className='tips__dot' />
              <Text className='tips__text'>请如实描述商品成色与缺陷，上传清晰照片保障双方权益</Text>
            </View>
            <View className='tips__item'>
              <View className='tips__dot' />
              <Text className='tips__text'>若涉及邮寄，请提前说明邮费、发货时间等信息</Text>
            </View>
            <View className='tips__item'>
              <View className='tips__dot' />
              <Text className='tips__text'>发布后图片会同步上传，审核期间请耐心等待通知</Text>
            </View>
          </View>
        </View>
      </View>

      <View className='submit-bar'>
        <View
          className={`submit-bar__button ${!isFormValid ? 'submit-bar__button--disabled' : ''}`}
          onClick={handleSubmit}
        >
          {isEditMode ? '保存修改' : '立即发布'}
        </View>
      </View>
    </ScrollView>
  )
}

export default SecondHandPublish 
