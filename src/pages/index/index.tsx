import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Grid, GridItem } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.less'

// Entry points data
const firstRowEntries = [
  { id: 1, title: '以往活动', iconName: 'calendar-check', path: '/pages/past-activities/index' },
  { id: 2, title: '最近活动', iconName: 'flag', path: '/pages/recent-activities/index' },
  { id: 3, title: '二手闲置', iconName: 'shopping-bag', path: '/pages/second-hand/index' },
  { id: 4, title: '布好玩周边', iconName: 'gift', path: '/pages/gift/index' },
  // { id: 4, title: '拼拼车', iconName: 'car', path: '/pages/carpool/index' },
  // { id: 5, title: '上门按摩', iconName: 'hand-sparkles' }
]

const secondRowEntries = [
  // { id: 6, title: '布好玩周边', iconName: 'gift' },
  { id: 5, title: '租赁', iconName: 'key', path: '/pages/rental/index' },
  { id: 6, title: '我们的车', iconName: 'truck', path: '/pages/car-rental/index' },
  { id: 7, title: '定制游', iconName: 'map-marked', path: '/pages/custom-tour/index' },
  { id: 8, title: '联系我', iconName: 'phone-alt', path: '/pages/contact-us/index' }
]

// Sample recommended images (in a real app, these would be loaded from API)
const recommendedImages = [
  'https://images.unsplash.com/photo-1745874864678-f464940bb513',
  'https://images.unsplash.com/photo-1749731630653-d9b3f00573ed',
  'https://images.unsplash.com/photo-1749215763709-c057dbb60cf3',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'
]

// Function to get random images
const getRandomImages = (images, count) => {
  const shuffled = [...images].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const Index: React.FC = () => {
  // Get two random images for "Guess You Like" section
  const randomImages = getRandomImages(recommendedImages, 4)

  // Handle entry click
  const handleEntryClick = (entry) => {
    if (entry.path) {
      Taro.navigateTo({
        url: entry.path
      })
    } else {
      Taro.showToast({
        title: `${entry.title}功能正在开发中`,
        icon: 'none',
        duration: 2000
      })
    }
  }

  return (
    <ScrollView className='index-container' scrollY>
      {/* Entry points section */}
      <View className='entry-section'>
        {/* First row of entries */}
        <Grid columns={4} className='entry-grid'>
          {firstRowEntries.map(entry => (
            <GridItem 
              key={entry.id}
              className='entry-item'
              onClick={() => handleEntryClick(entry)}
            >
              <View className='grid-item-content'>
                <View className={`custom-icon ${entry.iconName}`} />
                <Text className='entry-text'>{entry.title}</Text>
              </View>
            </GridItem>
          ))}
        </Grid>
        
        {/* Second row of entries */}
        <Grid columns={4} className='entry-grid'>
          {secondRowEntries.map(entry => (
            <GridItem 
              key={entry.id}
              className='entry-item'
              onClick={() => handleEntryClick(entry)}
            >
              <View className='grid-item-content'>
                <View className={`custom-icon ${entry.iconName}`} />
                <Text className='entry-text'>{entry.title}</Text>
              </View>
            </GridItem>
          ))}
        </Grid>
      </View>

      {/* Guess You Like section */}
      <View className='recommended-section'>
        <View className='section-title'>猜你喜欢</View>
        <View className='recommended-items'>
          {randomImages.map((imgSrc, index) => (
            <View key={index} className='recommended-item'>
              <Image
                src={imgSrc}
                mode='aspectFill'
                className='recommended-image'
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default Index
