import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { PullToRefresh, Loading, Empty, Rate, SearchBar } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { courseApi, Course, CourseQueryParams } from '../../services/course'
import './index.less'

const CourseList: React.FC = () => {
  // 状态管理
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searching, setSearching] = useState(false)

  // 加载课程数据
  const loadCourses = async (showLoading = true, searchKeyword = '') => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      const params: CourseQueryParams = {
        page: 1,
        limit: 50,
        sortBy: 'courseCode',
        sortOrder: 'asc'
      }

      // 如果有搜索关键词，添加搜索参数
      if (searchKeyword.trim()) {
        params.courseCode = searchKeyword.trim().toUpperCase()
      }
      
      const response = await courseApi.getAllCourses(params)
      setCourses(response.data || [])
    } catch (error) {
      console.error('加载课程失败:', error)
      Taro.showToast({
        title: '加载失败，请稍后重试',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
      setSearching(false)
    }
  }

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCourses(false, searchValue)
  }

  // 搜索处理
  const handleSearch = async (value: string) => {
    setSearchValue(value)
    setSearching(true)
    await loadCourses(false, value)
  }

  // 清空搜索
  const handleClearSearch = async () => {
    setSearchValue('')
    setSearching(true)
    await loadCourses(false, '')
  }

  // 跳转到课程详情页面
  const handleCourseClick = (course: Course) => {
    Taro.navigateTo({
      url: `/pages/course/reviews/index?id=${course.id}&courseCode=${encodeURIComponent(course.courseCode)}&courseName=${encodeURIComponent(course.courseName)}`
    })
  }

  // 获取评分颜色
  const getRatingColor = (rating: string) => {
    const ratingNum = parseFloat(rating)
    if (ratingNum >= 4.5) return '#52c41a'
    if (ratingNum >= 4.0) return '#faad14'
    if (ratingNum >= 3.5) return '#fa8c16'
    if (ratingNum >= 3.0) return '#ff7875'
    return '#ff4d4f'
  }

  // 获取院系标识
  const getDepartmentTag = (courseCode: string) => {
    const prefix = courseCode.substring(0, 4)
    const departmentMap: { [key: string]: string } = {
      'COMP': '计算机',
      'MATH': '数学',
      'PHYS': '物理',
      'CHEM': '化学',
      'BIOL': '生物',
      'ECON': '经济',
      'PSYC': '心理',
      'ENGL': '英语'
    }
    return departmentMap[prefix] || '其他'
  }

  // 获取课程级别
  const getCourseLevel = (courseCode: string) => {
    const level = courseCode.charAt(4)
    if (level === '1' || level === '2') return '基础课程'
    if (level === '3') return '专业课程'
    if (level === '4') return '高级课程'
    if (level === '7' || level === '8' || level === '9') return '研究生课程'
    return '其他课程'
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadCourses()
  }, [])

  return (
    <View className='course-list-container'>
      {/* 页面头部 */}
      <View className='header'>
        <View className='header-content'>
          <Text className='title'>UQ课程评价</Text>
          <Text className='subtitle'>University of Queensland Course Reviews</Text>
        </View>
      </View>


      {/* 课程列表 */}
      <PullToRefresh
        onRefresh={handleRefresh}
        // loading={refreshing}
        pullingText='下拉刷新'
        canReleaseText='释放刷新'
        refreshingText='刷新中...'
        completeText='刷新完成'
      >
        <ScrollView className='course-list' scrollY>
          {loading ? (
            <View className='loading-container'>
              <Loading />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : courses.length === 0 ? (
            <Empty 
              description={searchValue ? `未找到包含 "${searchValue}" 的课程` : '暂无课程数据'}
              imageSize={80}
            />
          ) : (
            <View className='courses-grid'>
              {courses.map((course) => (
                <View
                  key={course.id}
                  className='course-card'
                  onClick={() => handleCourseClick(course)}
                >
                  <View className='course-info'>
                    <View className='course-header'>
                      <View className='course-code-section'>
                        <Text className='course-code'>{course.courseCode}</Text>
                        <View className='course-tags'>
                          <Text className='department-tag'>{getDepartmentTag(course.courseCode)}</Text>
                          <Text className='level-tag'>{getCourseLevel(course.courseCode)}</Text>
                        </View>
                      </View>
                      <View className='rating-section'>
                        <Text 
                          className='rating-score'
                          style={{ color: getRatingColor(course.overallRating) }}
                        >
                          {course.overallRating}
                        </Text>
                        <Rate 
                          value={parseFloat(course.overallRating)} 
                          readOnly={true}
                        />
                      </View>
                    </View>
                    
                    <Text className='course-name'>{course.courseName}</Text>
                    
                    <View className='course-footer'>
                      <View className='review-info'>
                        <Text className='review-count'>📝 {course.totalReviews} 条评价</Text>
                      </View>
                      <View className='action-hint'>
                        <Text className='hint-text'>查看详情 →</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </PullToRefresh>
    </View>
  )
}

export default CourseList 