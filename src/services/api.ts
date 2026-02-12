import Taro from '@tarojs/taro';

// API基础配置

const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.15.95:3000/api'
    : 'https://nothing-but-fun-backend-production.up.railway.app/api';

const requestInterceptor = (params) => {
  // 添加token到header
  const token = Taro.getStorageSync('token');
  if (token) {
    params.header = {
      ...params.header,
      Authorization: `Bearer ${token}`,
    };
  }

  // 添加默认header
  params.header = {
    'Content-Type': 'application/json',
    ...params.header,
  };

  console.log('请求参数:', params);
  return params;
};

// 响应拦截器
const responseInterceptor = (res) => {
  console.log('响应数据:', res);

  // 处理HTTP状态码
  if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
    return res.data;
  } else if (res.statusCode === 401) {
    // token过期，清除本地存储并跳转登录
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
    Taro.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
    });
    return Promise.reject(res);
  } else {
    Taro.showToast({
      title: res.data?.message || '请求失败',
      icon: 'none',
    });
    return Promise.reject(res);
  }
};

// 通用请求方法
const request = (options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}) => {
  const { url, method = 'GET', data, header } = options;

  // 构造请求参数
  const requestParams = {
    url: `${API_BASE_URL}${url}`,
    method,
    data,
    header,
    timeout: 60000,
  };

  // 应用请求拦截器
  const interceptedParams = requestInterceptor(requestParams);

  return Taro.request(interceptedParams)
    .then(responseInterceptor)
    .catch((error) => {
      console.error('请求错误:', error);
      throw error;
    });
};

export default request;
export { API_BASE_URL };
