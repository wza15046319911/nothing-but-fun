import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'
import { secondhandApi, SecondhandCategory, SecondhandSubCategory, SecondhandProductStatus } from 'src/services/secondhand'
import { API_BASE_URL } from 'src/services/api'
import { useAuth } from 'src/context/auth'

import "@taroify/core/uploader/style"
import "@taroify/core/picker/style"
import "@taroify/core/popup/style"
import { Uploader, Picker, Popup } from "@taroify/core"

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

  // Category and product status state
  const [subCategories, setSubCategories] = useState<SecondhandSubCategory[]>([])
  const [categories, setCategories] = useState<SecondhandCategory[]>([])
  const [productStatuses, setProductStatuses] = useState<SecondhandProductStatus[]>([])
  const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = useState(0)
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0)
  const [selectedProductStatusIndex, setSelectedProductStatusIndex] = useState(0)
  const [subCategoryTouched, setSubCategoryTouched] = useState(false)
  const [categoryTouched, setCategoryTouched] = useState(false)
  const [productStatusTouched, setProductStatusTouched] = useState(false)

  // Picker popup states
  const [subCategoryPickerOpen, setSubCategoryPickerOpen] = useState(false)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const [productStatusPickerOpen, setProductStatusPickerOpen] = useState(false)
  
  const maxImages = 10
  
  // Calculate if form is valid
  const isFormValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    price.trim().length > 0 &&
    !Number.isNaN(parseFloat(price)) &&
    parseFloat(price) > 0 &&
    fileList.length > 0 &&
    subCategories.length > 0 &&
    categories.length > 0 &&
    productStatuses.length > 0

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

  // Handle file change
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
    let sanitized = value.replace(/[^\d.]/g, '')
    const parts = sanitized.split('.')
    if (parts.length > 2) sanitized = parts[0] + '.' + parts.slice(1).join('')
    const [i = '', d = ''] = sanitized.split('.')
    const intPart = i.replace(/^0+(?=\d)/, '')
    const decPart = d.slice(0, 2)
    setPrice(decPart.length ? `${intPart}.${decPart}` : intPart)
  }

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [subCategoriesData, statusesData] = await Promise.all([
          secondhandApi.getAllSubCategories(),
          secondhandApi.getProductStatuses()
        ])
        setSubCategories(subCategoriesData)
        setProductStatuses(statusesData)

        // 默认加载第一个子分类的分类
        if (subCategoriesData.length > 0) {
          const firstSubCategoryCategories = await secondhandApi.getCategoriesBySubCategory(subCategoriesData[0].id)
          setCategories(firstSubCategoryCategories)
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        Taro.showToast({ title: '加载数据失败', icon: 'none' })
      }
    }

    loadData()

    // 检查编辑模式
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

            if (item.categoryRid && subCategories.length > 0) {
              try {
                const allCategories = await secondhandApi.getAllCategories()
                const currentCategory = allCategories.find(cat => cat.id === item.categoryRid)
                if (currentCategory && currentCategory.subCategoryId) {
                  const subCategoryIndex = subCategories.findIndex(subCat => subCat.id === currentCategory.subCategoryId)
                  if (subCategoryIndex >= 0) {
                    setSelectedSubCategoryIndex(subCategoryIndex)
                    const subCategoryCategories = await secondhandApi.getCategoriesBySubCategory(currentCategory.subCategoryId)
                    setCategories(subCategoryCategories)
                  }
                }
              } catch (error) {
                console.error('加载分类信息失败:', error)
              }
            }
            if (item.categoryRid && categories.length > 0) {
              const categoryIndex = categories.findIndex(cat => cat.id === item.categoryRid)
              if (categoryIndex >= 0) setSelectedCategoryIndex(categoryIndex)
            }
            if (item.productStatusRid && productStatuses.length > 0) {
              const statusIndex = productStatuses.findIndex(status => status.id === item.productStatusRid)
              if (statusIndex >= 0) setSelectedProductStatusIndex(statusIndex)
            }
          } catch (e) {
            console.error('加载商品详情失败:', e)
            Taro.showToast({ title: '加载失败', icon: 'none' })
          }
        })()
      }
    }
  }, [])
  
  const handleSubCategoryChange = async (index: number) => {
    setSelectedSubCategoryIndex(index)
    setSelectedCategoryIndex(0) 
    setSubCategoryTouched(true)

    if (subCategories.length > 0) {
      try {
        const subCategoryCategories = await secondhandApi.getCategoriesBySubCategory(subCategories[index].id)
        setCategories(subCategoryCategories)
      } catch (error) {
        console.error('加载分类失败:', error)
        Taro.showToast({ title: '加载分类失败', icon: 'none' })
      }
    }
  }

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

    if (!state.userInfo?.wechat_id) {
      const res = await Taro.showModal({
        title: '完善联系方式',
        content: '您还未设置微信号，添加微信号可让买家更快联系您。是否现在添加？',
        confirmText: '去添加',
        cancelText: '暂不添加'
      })

      if (res.confirm) {
        Taro.navigateTo({ url: '/pages/contact-info/index' })
        return
      }
    }

    if (fileList.length === 0) {
      Taro.showToast({
        title: '请先选择商品图片',
        icon: 'none',
        duration: 2000
      })
      return
    }

    Taro.showLoading({
      title: isEditMode ? '保存中...' : '发布中...'
    })

    try {
      if (isEditMode && editingItemId) {
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
        if (categories.length > 0) {
          payload.categoryRid = categories[selectedCategoryIndex].id
        }
        if (productStatuses.length > 0) {
          payload.productStatusRid = productStatuses[selectedProductStatusIndex].id
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
          images: fileIds,
          categoryRid: categories.length > 0 ? categories[selectedCategoryIndex].id : undefined,
          productStatusRid: productStatuses.length > 0 ? productStatuses[selectedProductStatusIndex].id : undefined
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
    <View className='publish-page'>
      <ScrollView className='publish-page__scroll' scrollY style={{ height: '100vh', boxSizing: 'border-box' }}>
        <View className='publish-page__header'>
          <Text className='publish-page__title'>{isEditMode ? '编辑换换乐好物' : '发布换换乐好物'}</Text>
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
            <Text className='card__subtitle'>至少上传 1 张清晰照片，最多 {maxImages} 张</Text>
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
                <Text className='field__label'>标题</Text>
                <Input
                  className='field__input'
                  placeholder='如：95新 Nintendo Switch OLED 主机'
                  placeholderClass='field__placeholder'
                  value={title}
                  onInput={(e) => handleTitleInput(e.detail.value)}
                  onBlur={() => setTitleTouched(true)}
                  maxlength={30}
                />
                <Text className='field__hint'>{titleRemaining} 字符可用</Text>
              </View>

              <View className={`field field--textarea ${descTouched && description.trim() === '' ? 'field--error' : ''}`}>
                <Text className='field__label'>商品描述</Text>
                <Textarea
                  className='field__textarea'
                  placeholder='推荐写上入手渠道、使用情况、成色、配件等关键信息'
                  placeholderClass='field__placeholder'
                  value={description}
                  onInput={(e) => handleDescInput(e.detail.value)}
                  onBlur={() => setDescTouched(true)}
                  maxlength={500}
                />
                <Text className='field__hint'>{descRemaining} 字符可用</Text>
              </View>
            </View>
          </View>

          <View className='card'>
            <Text className='card__title'>分类信息</Text>
            <View className='card__content card__content--gap'>
              <View className={`field ${subCategoryTouched && subCategories.length === 0 ? 'field--error' : ''}`}>
                <Text className='field__label'>商品大类</Text>
                <View
                  className='field__picker'
                  onClick={() => setSubCategoryPickerOpen(true)}
                >
                  <Text className={subCategories.length === 0 ? 'field__placeholder' : ''}>
                    {subCategories.length > 0 ? subCategories[selectedSubCategoryIndex]?.name || '请选择大类' : '正在加载大类...'}
                  </Text>
                </View>

                <Popup open={subCategoryPickerOpen} placement="bottom" onClose={() => setSubCategoryPickerOpen(false)}>
                  <Picker
                    value={[selectedSubCategoryIndex.toString()]}
                    onConfirm={(values) => {
                      const index = parseInt(values[0] as string)
                      handleSubCategoryChange(index)
                      setSubCategoryPickerOpen(false)
                    }}
                    onCancel={() => setSubCategoryPickerOpen(false)}
                  >
                    <Picker.Toolbar>
                      <Picker.Button>取消</Picker.Button>
                      <Picker.Button>确认</Picker.Button>
                    </Picker.Toolbar>
                    <Picker.Column>
                      {subCategories.map((subCat, index) => (
                        <Picker.Option key={subCat.id} value={index.toString()}>
                          {subCat.name}
                        </Picker.Option>
                      ))}
                    </Picker.Column>
                  </Picker>
                </Popup>
              </View>

              <View className={`field ${categoryTouched && categories.length === 0 ? 'field--error' : ''}`}>
                <Text className='field__label'>商品细分类</Text>
                <View
                  className='field__picker'
                  onClick={() => setCategoryPickerOpen(true)}
                >
                  <Text className={categories.length === 0 ? 'field__placeholder' : ''}>
                    {categories.length > 0 ? categories[selectedCategoryIndex]?.name || '请选择细分类' : subCategories.length === 0 ? '请先选择大类' : '正在加载细分类...'}
                  </Text>
                </View>

                <Popup open={categoryPickerOpen} placement="bottom" onClose={() => setCategoryPickerOpen(false)}>
                  <Picker
                    value={[selectedCategoryIndex.toString()]}
                    onConfirm={(values) => {
                      const index = parseInt(values[0] as string)
                      setSelectedCategoryIndex(index)
                      setCategoryTouched(true)
                      setCategoryPickerOpen(false)
                    }}
                    onCancel={() => setCategoryPickerOpen(false)}
                  >
                    <Picker.Toolbar>
                      <Picker.Button>取消</Picker.Button>
                      <Picker.Button>确认</Picker.Button>
                    </Picker.Toolbar>
                    <Picker.Column>
                      {categories.map((cat, index) => (
                        <Picker.Option key={cat.id} value={index.toString()}>
                          {cat.name}
                        </Picker.Option>
                      ))}
                    </Picker.Column>
                  </Picker>
                </Popup>
              </View>

              <View className={`field ${productStatusTouched && productStatuses.length === 0 ? 'field--error' : ''}`}>
                <Text className='field__label'>商品状况</Text>
                <View
                  className='field__picker'
                  onClick={() => setProductStatusPickerOpen(true)}
                >
                  <Text className={productStatuses.length === 0 ? 'field__placeholder' : ''}>
                    {productStatuses.length > 0 ? productStatuses[selectedProductStatusIndex]?.name || '请选择状况' : '正在加载状况...'}
                  </Text>
                </View>

                <Popup open={productStatusPickerOpen} placement="bottom" onClose={() => setProductStatusPickerOpen(false)}>
                  <Picker
                    value={[selectedProductStatusIndex.toString()]}
                    onConfirm={(values) => {
                      const index = parseInt(values[0] as string)
                      setSelectedProductStatusIndex(index)
                      setProductStatusTouched(true)
                      setProductStatusPickerOpen(false)
                    }}
                    onCancel={() => setProductStatusPickerOpen(false)}
                  >
                    <Picker.Toolbar>
                      <Picker.Button>取消</Picker.Button>
                      <Picker.Button>确认</Picker.Button>
                    </Picker.Toolbar>
                    <Picker.Column>
                      {productStatuses.map((status, index) => (
                        <Picker.Option key={status.id} value={index.toString()}>
                          {status.name}
                        </Picker.Option>
                      ))}
                    </Picker.Column>
                  </Picker>
                </Popup>
              </View>
            </View>
          </View>

          <View className='card'>
            <Text className='card__title'>售价</Text>
            <View className='card__content card__content--gap'>
              <View className={`field ${priceTouched && (price.trim() === '' || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0) ? 'field--error' : ''}`}>
                <Text className='field__label'>标价 (AUD)</Text>
                <Input
                  className='field__input field__input--price'
                  placeholder='0.00'
                  placeholderClass='field__placeholder'
                  value={price}
                  onInput={(e) => handlePriceInput(e.detail.value)}
                  onBlur={() => setPriceTouched(true)}
                  type='digit'
                />
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
          
          {/* Spacer for bottom bar */}
          <View style={{ height: '200rpx' }} />
        </View>
      </ScrollView>

      <View className='submit-bar'>
        <View
          className={`submit-bar__button ${!isFormValid ? 'submit-bar__button--disabled' : ''}`}
          onClick={handleSubmit}
        >
          {isEditMode ? '保存修改' : '立即发布'}
        </View>
      </View>
    </View>
  )
}

export default SecondHandPublish
