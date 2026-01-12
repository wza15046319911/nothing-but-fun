import Taro from '@tarojs/taro'
import request from './api'

// 用户信息类型定义
export interface UserInfo {
  id: string
  openid: string
  nickname?: string
  avatarUrl?: string
  email?: string | null
  phone?: string | null
  gender?: string
  city?: string
  province?: string
  country?: string
  language?: string
  isActive?: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
  contact?: string | null
  wechat_id?: string | null
}

// 微信登录请求类型
export interface WechatLoginRequest {
  code: string
  userInfo?: Partial<UserInfo>
}

// 微信登录响应类型
export interface WechatLoginResponse {
  success: boolean
  message: string
  data: {
    openid: string
    token?: string
    userInfo?: UserInfo
  }
}

// 获取用户信息响应类型
export interface GetUserInfoResponse {
  success: boolean
  data: UserInfo
}

// 更新用户资料请求类型
export interface UpdateProfileRequest {
  nickname?: string
  avatarUrl?: string
  email?: string | null
  phone?: string | null
  gender?: string
  city?: string
  province?: string
  country?: string
  language?: string
  contact?: string | null
  wechat_id?: string | null
}

// 更新用户资料响应类型
export interface UpdateProfileResponse {
  success: boolean
  message: string
  data: UserInfo
}

// Token验证响应类型
export interface VerifyTokenResponse {
  success: boolean
  message: string
  data: {
    openid: string
    userId: number
  }
}

// Token刷新响应类型
export interface RefreshTokenResponse {
  success: boolean
  message: string
  data: {
    token: string
  }
}

// 微信认证API服务
export const authApi = {
  // 微信小程序登录
  wechatLogin: (data: WechatLoginRequest): Promise<WechatLoginResponse> => {
    return request({
      url: '/login',
      method: 'POST',
      data
    })
  },

  // 根据OpenID获取用户信息
  getUserByOpenId: (openid: string): Promise<GetUserInfoResponse> => {
    return request({
      url: `/user/${openid}`,
      method: 'GET'
    })
  },

  // 更新用户资料
  updateProfile: (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    return request({
      url: '/profile',
      method: 'PUT',
      data
    })
  },

  createUser: (data: any): Promise<any> => {
    return request({
      url: '/user',
      method: 'POST',
      data
    })
  }
}

// 本地存储管理工具
export const storageUtils = {
  // 保存用户数据
  saveUserData: (token: string, userInfo: UserInfo): void => {
    try {
      Taro.setStorageSync('token', token)
      Taro.setStorageSync('userInfo', userInfo)
      console.log('用户数据已保存到本地存储')
    } catch (error) {
      console.error('保存用户数据失败:', error)
    }
  },

  // 获取用户数据
  getUserData: (): { token: string | null; userInfo: UserInfo | null } => {
    try {
      const token = Taro.getStorageSync('token')
      const userInfo = Taro.getStorageSync('userInfo')
      return { token, userInfo }
    } catch (error) {
      console.error('获取本地用户数据失败:', error)
      return { token: null, userInfo: null }
    }
  },

  // 清除用户数据
  clearUserData: (): void => {
    try {
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
      console.log('用户数据已清除')
    } catch (error) {
      console.error('清除用户数据失败:', error)
    }
  }
}

  // 认证状态检查工具
export const authUtils = {
  // 检查本地登录状态
  checkLocalLoginStatus: (): boolean => {
    const { token, userInfo } = storageUtils.getUserData()
    return !!(token && userInfo)
  },

  // 自动登录检查
  autoLoginCheck: async (): Promise<{
    isLoggedIn: boolean
    userInfo: UserInfo | null
    openid: string | null
  }> => {
    try {
      const loginRes = await Taro.login()
      
      if (!loginRes.code) {
        throw new Error('获取微信登录code失败')
      }
      
      console.log('获取到微信code:', loginRes.code)
      
      const response = await authApi.wechatLogin({ code: loginRes.code })
      
      if (response.success && response.data) {
        const { openid, userInfo, token } = response.data
        
        if (userInfo && token) {
          storageUtils.saveUserData(token, userInfo)
          return {
            isLoggedIn: true,
            userInfo,
            openid
          }
        } else {
          return {
            isLoggedIn: false,
            userInfo: null,
            openid
          }
        }
      } else {
        throw new Error(response.message || '登录检查失败')
      }
    } catch (error) {
      console.error('自动登录检查失败:', error)
      return {
        isLoggedIn: false,
        userInfo: null,
        openid: null
      }
    }
  },

  // 完成用户注册
  completeUserRegistration: async (
    code: string, 
    userInfo: Partial<UserInfo>
  ): Promise<{
    success: boolean
    userInfo: UserInfo | null
    token: string | null
    message: string
  }> => {
    try {
      const response = await authApi.wechatLogin({ code, userInfo })
      
      if (response.success && response.data.userInfo && response.data.token) {
        storageUtils.saveUserData(response.data.token, response.data.userInfo)
        
        return {
          success: true,
          userInfo: response.data.userInfo,
          token: response.data.token,
          message: response.message || '注册登录成功'
        }
      } else {
        return {
          success: false,
          userInfo: null,
          token: null,
          message: response.message || '注册登录失败'
        }
      }
    } catch (error) {
      console.error('完成用户注册失败:', error)
      return {
        success: false,
        userInfo: null,
        token: null,
        message: error.message || '注册登录失败'
      }
    }
  },

  // 退出登录
  logout: (): void => {
    storageUtils.clearUserData()
    console.log('用户已退出登录')
  }
}

// 兼容性导出（保持向后兼容）
export const wechatLogin = authApi.wechatLogin
export const getUserInfoByOpenId = authApi.getUserByOpenId
export const updateProfile = authApi.updateProfile
export const createUser = authApi.createUser
export const saveUserData = storageUtils.saveUserData
export const getUserData = storageUtils.getUserData
export const clearUserData = storageUtils.clearUserData
export const checkLocalLoginStatus = authUtils.checkLocalLoginStatus
export const autoLoginCheck = authUtils.autoLoginCheck
export const completeUserRegistration = authUtils.completeUserRegistration
export const logout = authUtils.logout 
