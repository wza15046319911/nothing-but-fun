import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.less'

// 定制游项目数据
const tourData = [
  {
    id: 1,
    title: '钓鱼出海三小时',
    subtitle: '深海垂钓 • 专业指导',
    price: 120,
    originalPrice: 150,
    duration: '3小时',
    groupSize: '4-8人',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    highlights: ['专业钓鱼设备', '经验丰富船长', '新鲜海鲜带回', '安全保障'],
    description: '体验真正的深海垂钓乐趣，在专业船长的指导下，享受宁静的海上时光，收获新鲜海鲜',
    includes: [
      '往返接送服务',
      '专业钓鱼装备',
      '钓鱼许可证',
      '安全救生设备',
      '简单茶点饮料',
      '钓获海鲜处理'
    ],
    schedule: [
      { time: '08:00', activity: '酒店接送出发' },
      { time: '08:30', activity: '到达码头，安全讲解' },
      { time: '09:00', activity: '出海开始钓鱼' },
      { time: '11:30', activity: '海上休息，享用茶点' },
      { time: '12:00', activity: '返回码头，处理渔获' },
      { time: '12:30', activity: '送回酒店' }
    ],
    tips: [
      '建议穿着舒适防滑鞋',
      '携带防晒霜和帽子',
      '可能会有轻微晃动，晕船者慎选',
      '天气恶劣时可能取消行程'
    ]
  },
  {
    id: 2,
    title: '黄金海岸一日游',
    subtitle: '海滩天堂 • 主题乐园',
    price: 180,
    originalPrice: 220,
    duration: '8小时',
    groupSize: '6-12人',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    highlights: ['冲浪者天堂', 'SkyPoint观景台', '主题公园选择', '海滩自由时间'],
    description: '探索澳洲最著名的度假胜地，从壮观的海岸线到刺激的主题公园，一天体验黄金海岸精华',
    includes: [
      '豪华巴士接送',
      'SkyPoint观景台门票',
      '专业中文导游',
      '海滩活动时间',
      '午餐（海鲜自助）',
      '购物时间安排'
    ],
    schedule: [
      { time: '07:30', activity: '酒店接送集合' },
      { time: '09:00', activity: '抵达冲浪者天堂海滩' },
      { time: '10:30', activity: 'SkyPoint观景台游览' },
      { time: '12:00', activity: '海鲜自助午餐' },
      { time: '14:00', activity: '主题公园游玩（可选）' },
      { time: '16:00', activity: '海滩自由活动时间' },
      { time: '17:30', activity: '购物中心参观' },
      { time: '18:30', activity: '返回布里斯班' }
    ],
    tips: [
      '携带泳衣和防晒用品',
      '穿着舒适的步行鞋',
      '主题公园门票需额外购买',
      '建议携带相机记录美景'
    ]
  }
]

const CustomTour: React.FC = () => {
  // 立即预订
  const handleBookNow = (tour) => {
    Taro.showModal({
      title: `预订 ${tour.title}`,
      content: `价格：$${tour.price} AUD/人\n时长：${tour.duration}\n团队：${tour.groupSize}\n\n请联系我们预订：\n电话：+61 400 789 123\n微信：nbf-customtour`,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // 查看详情
  const handleViewDetails = (tour) => {
    const includesText = tour.includes.join('\n• ')
    Taro.showModal({
      title: `${tour.title} 详情`,
      content: `${tour.description}\n\n包含服务：\n• ${includesText}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // 查看行程
  const handleViewSchedule = (tour) => {
    const scheduleText = tour.schedule.map(item => `${item.time} ${item.activity}`).join('\n')
    Taro.showModal({
      title: `${tour.title} 行程安排`,
      content: scheduleText,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  return (
    <View className='custom-tour-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>定制游</Text>
          <Text className='subtitle'>专属体验 • 精心安排</Text>
        </View>
        <View className='header-decoration'>
          <Text className='tour-emoji'>🏖️</Text>
        </View>
      </View>

      {/* 特色说明 */}
      <View className='features-banner'>
        <View className='feature-item'>
          <Text className='feature-icon'>👥</Text>
          <Text className='feature-text'>小团出行</Text>
        </View>
        <View className='feature-item'>
          <Text className='feature-icon'>🎯</Text>
          <Text className='feature-text'>精选路线</Text>
        </View>
        <View className='feature-item'>
          <Text className='feature-icon'>🚌</Text>
          <Text className='feature-text'>接送服务</Text>
        </View>
        <View className='feature-item'>
          <Text className='feature-icon'>💬</Text>
          <Text className='feature-text'>中文导游</Text>
        </View>
      </View>

      {/* 项目列表 */}
      <ScrollView className='content' scrollY>
        <View className='tours-list'>
          {tourData.map(tour => (
            <View key={tour.id} className='tour-card'>
              {/* 项目图片 */}
              <View className='tour-image-container'>
                <Image 
                  className='tour-image'
                  src={tour.image}
                  mode='aspectFill'
                  lazyLoad
                />
                {/* 价格标签 */}
                <View className='price-badge'>
                  <Text className='price-currency'>$</Text>
                  <Text className='price-amount'>{tour.price}</Text>
                  <Text className='price-unit'>AUD/人</Text>
                </View>
                {/* 折扣标签 */}
                <View className='discount-badge'>
                  <Text className='original-price'>${tour.originalPrice}</Text>
                  <Text className='discount-text'>特价</Text>
                </View>
              </View>

              {/* 项目信息 */}
              <View className='tour-info'>
                <View className='tour-header'>
                  <View className='title-section'>
                    <Text className='tour-title'>{tour.title}</Text>
                    <Text className='tour-subtitle'>{tour.subtitle}</Text>
                  </View>
                </View>
                
                <Text className='tour-description'>{tour.description}</Text>
                
                {/* 基本信息 */}
                <View className='tour-basics'>
                  <View className='basic-item'>
                    <Text className='basic-icon'>⏰</Text>
                    <Text className='basic-text'>{tour.duration}</Text>
                  </View>
                  <View className='basic-item'>
                    <Text className='basic-icon'>👥</Text>
                    <Text className='basic-text'>{tour.groupSize}</Text>
                  </View>
                </View>

                {/* 项目亮点 */}
                <View className='tour-highlights'>
                  <Text className='highlights-title'>项目亮点</Text>
                  <View className='highlights-list'>
                    {tour.highlights.map((highlight, index) => (
                      <View key={index} className='highlight-item'>
                        <Text className='highlight-dot'>•</Text>
                        <Text className='highlight-text'>{highlight}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 操作按钮 */}
                <View className='tour-actions'>
                  <Button 
                    className='details-btn'
                    onClick={() => handleViewDetails(tour)}
                  >
                    查看详情
                  </Button>
                  <Button 
                    className='schedule-btn'
                    onClick={() => handleViewSchedule(tour)}
                  >
                    行程安排
                  </Button>
                  <Button 
                    className='book-btn'
                    type="primary"
                    onClick={() => handleBookNow(tour)}
                  >
                    立即预订
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 预订须知 */}
        <View className='booking-notice'>
          <Text className='notice-title'>预订须知</Text>
          <View className='notice-list'>
            <Text className='notice-item'>• 提前24小时预订，确保位置</Text>
            <Text className='notice-item'>• 天气原因可能调整或取消行程</Text>
            <Text className='notice-item'>• 儿童价格请咨询客服</Text>
            <Text className='notice-item'>• 包含基础保险，安全保障</Text>
            <Text className='notice-item'>• 支持团体定制，价格优惠</Text>
            <Text className='notice-item'>• 取消政策：出发前48小时免费取消</Text>
          </View>
        </View>

        {/* 联系方式 */}
        <View className='contact-section'>
          <Text className='contact-title'>联系预订</Text>
          <View className='contact-info'>
            <View className='contact-item'>
              <Text className='contact-icon'>📞</Text>
              <Text className='contact-text'>+61 400 789 123</Text>
            </View>
            <View className='contact-item'>
              <Text className='contact-icon'>💬</Text>
              <Text className='contact-text'>微信：nbf-customtour</Text>
            </View>
            <View className='contact-item'>
              <Text className='contact-icon'>📧</Text>
              <Text className='contact-text'>tour@nbf.com</Text>
            </View>
            <View className='contact-item'>
              <Text className='contact-icon'>🕒</Text>
              <Text className='contact-text'>服务时间：9:00-18:00</Text>
            </View>
          </View>
        </View>

        {/* 底部占位 */}
        <View className='bottom-placeholder' />
      </ScrollView>
    </View>
  )
}

export default CustomTour 