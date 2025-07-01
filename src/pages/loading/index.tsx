import React, { useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import './index.less';
import loadingGif from '../../assets/Dog Spinning GIF.gif';

const Loading: React.FC = () => {
  const { checkLoginStatus } = useAuth();

  useEffect(() => {
    initializeApp();
  }, []);


  const initializeApp = async () => {
    await checkLoginStatus();
    navigateToIndex();
  };

  const navigateToIndex = () => {
    Taro.reLaunch({
      url: '/pages/index/index',
    }).catch((error) => {
      console.error('跳转失败:', error);
    });
  };


  return (
    <View className="loading-container">
      <View className="loading-content">
        <Text className="app-logo">Nothing But Fun</Text>
        <Image src={loadingGif} className="loading-image" />
      </View>
    </View>
  );
};

export default Loading;
