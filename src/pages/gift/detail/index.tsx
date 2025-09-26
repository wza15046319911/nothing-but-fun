import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, View, Text, Image } from '@tarojs/components'
import { Swiper } from '@taroify/core'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { peripheralsApi, PeripheralItem } from '../../../services/peripherals'
import './index.less'
import '@taroify/core/swiper/style'

const merchantWechatLabel = '微信号：dorimifa_55'
const fallbackImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80'

const formatStock = (stock: number) => {
  if (stock > 100) {
    return '库存充足'
  }
  if (stock > 10) {
    return `剩余${stock}件`
  }
  if (stock > 0) {
    return `仅剩${stock}件`
  }
  return '暂时缺货'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPrice = (price: number | string) => {
  const priceStr = typeof price === 'number' ? price.toString() : price
  return priceStr.startsWith('¥') ? priceStr : `¥${priceStr}`
}

const GiftDetail: React.FC = () => {
  const router = useRouter()
  const { id } = router.params

  const [item, setItem] = useState<PeripheralItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const loadItemDetail = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await peripheralsApi.getItemById(parseInt(id))
        setItem(response)
      } catch (error) {
        console.error('加载商品详情失败:', error)
        Taro.showToast({ title: '加载失败，请稍后重试', icon: 'none', duration: 1800 })
        setItem(null)
      } finally {
        setLoading(false)
      }
    }

    loadItemDetail()
  }, [id])

  const images = useMemo(() => {
    if (!item) return []
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls
    }
    if (item.image) {
      return [item.image]
    }
    return []
  }, [item])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [images])

  const imageList = images.length > 0 ? images : [fallbackImage]

  const resolveShareId = (): string | undefined => {
    if (item?.id) return item.id.toString()
    if (id) {
      const parsed = Number(id)
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed.toString()
      }
      return id
    }
    return undefined
  }

  useShareAppMessage(() => {
    const shareId = resolveShareId()
    const redirect = encodeURIComponent('/pages/gift/detail/index')
    const basePath = `/pages/loading/index?redirect=${redirect}`
    const title = item?.name ? `${item.name} · 布玩好物铺` : '布玩好物精选'
    const imageUrl = imageList[0]

    return {
      title,
      path: `${basePath}${shareId ? `&id=${shareId}` : ''}`,
      imageUrl
    }
  })

  useShareTimeline(() => {
    const shareId = resolveShareId()
    const redirect = encodeURIComponent('/pages/gift/detail/index')
    const title = item?.name ? `${item.name} · 布玩好物铺` : '布玩好物精选'
    const queryParts = [`redirect=${redirect}`]
    if (shareId) {
      queryParts.push(`id=${shareId}`)
    }

    return {
      title,
      query: queryParts.join('&')
    }
  })

  const handleImagePreview = (index: number) => {
    Taro.previewImage({
      current: imageList[Math.max(0, Math.min(index, imageList.length - 1))],
      urls: imageList
    })
  }

  const handleSwiperChange = (value: number | { detail?: { current?: number } }) => {
    if (typeof value === 'number') {
      setActiveImageIndex(value)
      return
    }
    const next = value?.detail?.current
    if (typeof next === 'number') {
      setActiveImageIndex(next)
    }
  }

  const handleContactMerchant = () => {
    Taro.setClipboardData({ data: merchantWechatLabel })
      .then(() => {
        Taro.showToast({ title: '微信号已复制', icon: 'success', duration: 1500 })
      })
      .catch(() => {
        Taro.showToast({ title: '复制失败，请稍后重试', icon: 'none', duration: 1500 })
      })
  }

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true })
    Taro.showToast({ title: '分享面板已打开', icon: 'none', duration: 1500 })
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  if (loading) {
    return (
      <View className='flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500'>
        <Text>正在加载好物详情...</Text>
      </View>
    )
  }

  if (!item) {
    return (
      <View className='flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 px-8 text-center text-slate-500'>
        <Text className='text-4xl'>📦</Text>
        <View>
          <Text className='block text-lg text-slate-900'>没有找到这个好物</Text>
          <Text className='mt-2 block text-sm text-slate-500'>可能已经下架或暂时不可用</Text>
        </View>
        <View
          className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600 shadow-sm active:scale-95'
          onClick={handleBack}
        >
          <Text>返回列表</Text>
        </View>
      </View>
    )
  }

  const stockSummary = formatStock(item.stock)
  const statusText = item.stock > 0 ? '现货发售' : '暂时缺货'
  const statusType = item.stock > 0 ? 'available' : 'soldout'
  const priceDisplay = formatPrice(item.price)

  const tags = (() => {
    const list = ['布玩好物']
    if (item.categoryName) list.push(item.categoryName)
    list.push(stockSummary)
    return list
  })()

  const specs = [
    { label: '商品编号', value: `NBF-${item.id.toString().padStart(4, '0')}` },
    { label: '商品分类', value: item.categoryName ?? '布玩好物' },
    { label: '上架时间', value: formatTime(item.dateCreated || item.createdAt || new Date().toISOString()) },
    { label: '当前库存', value: item.stock > 0 ? `${item.stock} 件` : '暂时缺货' }
  ]

  return (
    <ScrollView className='peripheral-detail-page' scrollY>
      <View className='detail-wrapper'>
        <View className='top-bar'>
          <View className='top-bar__button' onClick={handleBack}>
            <Text className='top-bar__icon'>←</Text>
            <Text>返回</Text>
          </View>
          <View className='top-bar__button' onClick={handleShare}>
            <Text>分享</Text>
          </View>
        </View>

        <View className='media-section'>
          <Swiper
            className='media-section__swiper'
            circular
            indicator={imageList.length > 1}
            autoplay={imageList.length > 1 ? 4000 : false}
            defaultValue={0}
            onChange={handleSwiperChange}
          >
            {imageList.map((imageUrl, index) => (
              <Swiper.Item key={`${imageUrl}-${index}`}>
                <Image
                  className='media-section__image'
                  src={imageUrl}
                  mode='aspectFill'
                  lazyLoad
                  onClick={() => handleImagePreview(index)}
                  onError={() => console.warn('图片加载失败:', imageUrl)}
                />
              </Swiper.Item>
            ))}
          </Swiper>
          <View className='media-section__counter'>
            <Text>{activeImageIndex + 1} / {imageList.length}</Text>
          </View>
        </View>

        <View className='info-card'>
          <View className='info-card__header'>
            <View className={`info-card__status info-card__status--${statusType}`}>
              <Text>{statusText}</Text>
            </View>
            <Text className='info-card__price'>{priceDisplay}</Text>
          </View>

          <Text className='info-card__title'>{item.name}</Text>
          {item.description && (
            <Text className='info-card__subtitle'>{item.description}</Text>
          )}

          <View className='info-card__chips'>
            {tags.map((tag) => (
              <View className='info-card__chip' key={tag}>
                <Text>{tag}</Text>
              </View>
            ))}
          </View>

          <View className='info-card__meta'>
            <Text>上架时间：{formatTime(item.dateCreated || item.createdAt || new Date().toISOString())}</Text>
            <Text>{stockSummary}</Text>
          </View>
        </View>

        <View className='spec-card'>
          <Text className='section-title'>商品信息</Text>
          <View className='spec-grid'>
            {specs.map((spec) => (
              <View className='spec-item' key={spec.label}>
                <Text className='spec-item__label'>{spec.label}</Text>
                <Text className='spec-item__value'>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {item.description && (
          <View className='description-card'>
            <Text className='section-title'>商品描述</Text>
            <Text className='description-card__text'>{item.description}</Text>
          </View>
        )}

        <View className='contact-card'>
          <Text className='section-title'>联系商家</Text>
          <Text className='contact-card__hint'>团购、定制或合作咨询请联系 Nothing But Fun 团队，我们会在 1 个工作日内回复。</Text>
          <View className='contact-card__info'>
            <Text>{merchantWechatLabel}</Text>
          </View>
          <View className='contact-card__button' onClick={handleContactMerchant}>
            <Text>复制微信号联系商家</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default GiftDetail
