import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Swiper, SwiperItem, Popup, Rate, Button as NutButton } from '@nutui/nutui-react-taro'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { restaurantApi, Restaurant } from '../../../services/restaurant'
import './index.less'

const RestaurantDetail: React.FC = () => {
  const router = useRouter()
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [restaurantId, setRestaurantId] = useState<number>(0)
  
  // Review Sheet State
  const [showReviewSheet, setShowReviewSheet] = useState(false)
  const [reviewForm, setReviewForm] = useState({
      overall: 5,
      taste: 5,
      service: 5,
      environment: 5,
      price: 5,
      content: ''
  })

  // Load Detail
  const loadRestaurantDetail = async (id: number) => {
    try {
      setLoading(true)
      const data = await restaurantApi.getRestaurantById(id)
      setRestaurant(data)
    } catch (error) {
      console.error(error)
      Taro.showToast({ title: 'Unable to load details', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const paramsId = router.params.id || Taro.getCurrentInstance().router?.params.id
    if (paramsId) {
        setRestaurantId(parseInt(paramsId))
    }
  }, [])
  
  useEffect(() => {
      if (restaurantId > 0) {
          loadRestaurantDetail(restaurantId)
      }
  }, [restaurantId])

  const getAllImages = () => {
    if (!restaurant) return []
    if (restaurant.imageUrls && restaurant.imageUrls.length > 0) return restaurant.imageUrls
    return restaurant.image ? [restaurant.image] : []
  }
  
  const handlePreview = (index: number) => {
      const images = getAllImages()
      Taro.previewImage({
          current: images[index],
          urls: images
      })
  }

  const handleReviewSubmit = async () => {
      Taro.showLoading({ title: 'Submitting...' })
      // Simulate API call
      setTimeout(() => {
          Taro.hideLoading()
          Taro.showToast({ title: 'Review Submitted', icon: 'success' })
          setShowReviewSheet(false)
          // Reset form?
      }, 1000)
  }

  // Share
  useShareAppMessage(() => ({
      title: restaurant?.name || 'Explore Fine Dining',
      path: `/pages/restaurant/detail/index?id=${restaurantId}`
  }))
  
  if (loading) return (
    <View className='premium-loading'>
        <View className='loader'>
            <View className='dot'></View>
            <View className='dot'></View>
            <View className='dot'></View>
        </View>
    </View>
  )

  if (!restaurant) return (
      <View className='premium-error'>
          <Text>Restaurant not found</Text>
          <View className='btn-back' onClick={() => Taro.navigateBack()}>Go Back</View>
      </View>
  )

  const images = getAllImages()

   const copyToClipboard = (text: string, label: string) => {
       if (!text || text === 'Not Available') {
           Taro.showToast({ title: `${label} not available`, icon: 'none' })
           return
       }
       Taro.setClipboardData({
           data: text,
           success: () => {
               // Taro.setClipboardData automatically shows a success toast on WeChat
               // but we can add one for other platforms or a custom message
           }
       })
   }

   return (
     <View className='premium-detail-page'>
        <ScrollView className='scroller' scrollY>
            {/* Hero Section */}
            <View className='hero-section'>
                <Swiper
                    className='hero-swiper'
                    defaultValue={0}
                    onChange={(e) => setCurrentImageIndex(e.detail.current)}
                    indicatorDots={false}
                    autoPlay
                    interval={5000}
                    style={{ height: '55vh' }}
                >
                    {images.map((url, idx) => (
                        <SwiperItem key={idx}>
                            <Image
                                className='hero-image'
                                src={url}
                                mode='aspectFill'
                                onClick={() => handlePreview(idx)}
                            />
                            <View className='hero-gradient'></View>
                        </SwiperItem>
                    ))}
                </Swiper>
                {/* Hero Content (Overlaid) */}
                <View className='hero-content'>
                    <View className='image-counter'>
                        <Text>{currentImageIndex + 1} / {images.length}</Text>
                    </View>
                    
                    <Text className='restaurant-name'>{restaurant.name}</Text>
                    
                    <View className='hero-meta'>
                         <View className='meta-item'>
                             <Text className='icon'>📍</Text>
                             <Text>{restaurant.suburb}</Text>
                         </View>
                         <View className='divider'></View>
                         <View className='meta-item'>
                              <Text className='icon'>💲</Text>
                              <Text>{restaurant.pricingDetails || 'Price on request'}</Text>
                         </View>
                    </View>
                </View>
            </View>
            
            {/* Content Sheet */}
            <View className='content-sheet'>
                {/* Rating Highlights */}
                <View className='rating-highlights'>
                    <View className='main-score'>
                        <Text className='score-val'>{restaurant.overallRating}</Text>
                        <View className='stars'>
                            {[1,2,3,4,5].map(i => (
                                <Text key={i} className={`star ${i <= Math.round(parseFloat(restaurant.overallRating)) ? 'filled' : ''}`}>★</Text>
                            ))}
                        </View>
                        <Text className='review-count'>{restaurant.totalReviews} Reviews</Text>
                    </View>
                    
                    {restaurant.aspectRatings && (
                         <View className='aspect-scores'>
                             <View className='score-item'>
                                 <Text className='label'>Taste</Text>
                                 <View className='bar-bg'><View className='bar-fill' style={{width: `${(parseFloat(restaurant.aspectRatings.taste.average) / 5) * 100}%`}}></View></View>
                                 <Text className='val'>{restaurant.aspectRatings.taste.average}</Text>
                             </View>
                             <View className='score-item'>
                                 <Text className='label'>Service</Text>
                                 <View className='bar-bg'><View className='bar-fill' style={{width: `${(parseFloat(restaurant.aspectRatings.service.average) / 5) * 100}%`}}></View></View>
                                 <Text className='val'>{restaurant.aspectRatings.service.average}</Text>
                             </View>
                             <View className='score-item'>
                                 <Text className='label'>Env</Text>
                                 <View className='bar-bg'><View className='bar-fill' style={{width: `${(parseFloat(restaurant.aspectRatings.environment.average) / 5) * 100}%`}}></View></View>
                                 <Text className='val'>{restaurant.aspectRatings.environment.average}</Text>
                             </View>
                         </View>
                    )}
                </View>

                {/* Description */}
                <View className='section description-section'>
                    <Text className='section-header'>The Experience</Text>
                    <Text className='body-text'>
                        {restaurant.description || 'No description available for this venue.'}
                    </Text>
                </View>

                {/* Info Grid */}
                <View className='section info-section'>
                    <Text className='section-header'>Information</Text>
                    <View className='info-row' onClick={() => copyToClipboard(`${restaurant.streetAddress}, ${restaurant.suburb} ${restaurant.state} ${restaurant.postcode}`, 'Address')}>
                        <View className='icon-box'><Text>📍</Text></View>
                        <View className='info-content'>
                            <Text className='label'>Address</Text>
                            <Text className='value'>{restaurant.streetAddress}, {restaurant.suburb} {restaurant.state} {restaurant.postcode}</Text>
                        </View>
                        <Text className='arrow'>→</Text>
                    </View>
                </View>
               
               <View className='safe-area-spacer'></View>
           </View>
       </ScrollView>
       
       {/* Bottom Floating Bar */}
       <View className='premium-action-bar'>
           <View className='action-btn primary' onClick={() => setShowReviewSheet(true)}>
               <Text>Write a Review</Text>
           </View>
       </View>

       {/* Review Popup Chart */}
       <Popup 
          visible={showReviewSheet} 
          position="bottom" 
          round 
          closeable
          onClose={() => setShowReviewSheet(false)}
          className='review-popup'
       >
          <View className='review-sheet-content'>
              <Text className='sheet-title'>Rate Your Experience</Text>
              
              <View className='overall-rating-input'>
                  <Rate 
                    modelValue={reviewForm.overall} 
                    onChange={(val) => setReviewForm({...reviewForm, overall: val})} 
                    iconSize='32'
                    voidIcon='star' 
                    icon='star-fill'
                   />
                  <Text className='rating-label-text'>Overall</Text>
              </View>

              <View className='dimensions-input'>
                  <View className='dim-item'>
                      <Text className='dim-label'>Taste</Text>
                      <Rate modelValue={reviewForm.taste} count={5} onChange={(val) => setReviewForm({...reviewForm, taste: val})} />
                  </View>
                  <View className='dim-item'>
                      <Text className='dim-label'>Service</Text>
                      <Rate modelValue={reviewForm.service} count={5} onChange={(val) => setReviewForm({...reviewForm, service: val})} />
                  </View>
                  <View className='dim-item'>
                      <Text className='dim-label'>Environment</Text>
                      <Rate modelValue={reviewForm.environment} count={5} onChange={(val) => setReviewForm({...reviewForm, environment: val})} />
                  </View>
                  <View className='dim-item'>
                      <Text className='dim-label'>Value</Text>
                      <Rate modelValue={reviewForm.price} count={5} onChange={(val) => setReviewForm({...reviewForm, price: val})} />
                  </View>
              </View>
              

              <NutButton block type="primary" className='submit-btn' onClick={handleReviewSubmit}>
                  Submit Review
              </NutButton>
          </View>
       </Popup>
    </View>
  )
}

export default RestaurantDetail
