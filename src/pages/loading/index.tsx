import React, { useEffect, useMemo, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import './index.less';

const Loading: React.FC = () => {
  const { checkLoginStatus } = useAuth();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [variantClass, setVariantClass] = useState<'compact' | 'regular' | 'spacious'>('regular');

  const tips = useMemo(
    () => [
      '上滑探索最近活动',
      '二手好物，发布更方便',
      '餐厅点评，真实可依',
      '拼车信息，安全优先',
      // '课程评价，帮你做选择'
    ],
    []
  );

  useEffect(() => {
    // decide layout variant by viewport height
    try {
      const info = Taro.getSystemInfoSync();
      const h = info.windowHeight || 0;
      if (h && h < 640) setVariantClass('compact');
      else if (h && h > 820) setVariantClass('spacious');
      else setVariantClass('regular');
    } catch {}

    initializeApp();

    const tipTimer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 2200);

    return () => {
      clearInterval(tipTimer);
    };
  }, []);


  const initializeApp = async () => {
    const MIN_SPLASH_MS = 900;
    const start = Date.now();

    await checkLoginStatus();

    const elapsed = Date.now() - start;
    const remain = Math.max(0, MIN_SPLASH_MS - elapsed);

    if (remain > 0) {
      await new Promise((resolve) => setTimeout(resolve, remain));
    }

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
    <View className={`launch-container ${variantClass}`}>
      <View className="launch-bg" />

      <View className="brand">
        <Text className="brand-title">Nothing But Fun</Text>
        <Text className="brand-subtitle">玩乐不设限</Text>
      </View>

      <View className="loader">
        <View className="spinner" />
        <Text className="loading-text">正在为你加载精彩...</Text>
      </View>

      <View className="tips">
        <Text className="tips-label">小贴士</Text>
        <Text className="tips-text">{tips[currentTipIndex]}</Text>
      </View>
    </View>
  );
};

export default Loading;
