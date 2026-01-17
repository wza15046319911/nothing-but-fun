import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { Button, Input } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import { useWithLoading } from '../../utils/loading';
import './index.less';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { withLoading } = useWithLoading();

  // 模拟登录API
  const loginApi = async (username: string, password: string) => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (username === 'admin' && password === '123456') {
      return { success: true, token: 'mock-token' };
    } else {
      throw new Error('用户名或密码错误');
    }
  };

  // 处理登录
  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({
        title: '请输入用户名和密码',
        icon: 'error',
      });
      return;
    }

    try {
      // 使用withLoading包装登录请求，自动显示加载蒙版
      const result = await withLoading(() => loginApi(username, password), '正在登录...');

      if (result.success) {
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
        });

        // 跳转到首页
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/index/index',
          });
        }, 1000);
      }
    } catch (error) {
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'error',
      });
    }
  };

  return (
    <View className="login-container">
      <View className="login-form">
        <Text className="login-title">用户登录</Text>

        <View className="form-item">
          <Input
            placeholder="请输入用户名"
            value={username}
            onChange={(value) => setUsername(value)}
          />
        </View>

        <View className="form-item">
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(value) => setPassword(value)}
          />
        </View>

        <Button type="primary" className="login-btn" onClick={handleLogin}>
          登录
        </Button>

        <View className="login-tip">
          <Text>测试账号: admin / 123456</Text>
        </View>
      </View>
    </View>
  );
};

export default Login;
