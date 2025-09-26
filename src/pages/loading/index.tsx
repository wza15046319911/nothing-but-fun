import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useAuth } from '../../context/auth';
import './index.less';

const Loading: React.FC = () => {
  const { checkLoginStatus } = useAuth();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [variantClass, setVariantClass] = useState<'compact' | 'regular' | 'spacious'>('regular');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const redirectRef = useRef<string | null>(null);

  const tips = useMemo(
    () => [
      '上滑探索布玩新鲜事',
      '餐厅点评，真实可依',
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

    // 初始化流程将由 useLoad 在解析完成后触发，避免竞态

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

    navigateToTarget();
  };

  const navigateToTarget = () => {
    const candidate = redirectRef.current ?? redirectUrl;
    const url = candidate && candidate.startsWith('/pages/')
      ? candidate
      : '/pages/index/index';
    console.log('redirectUrl', url);
    Taro.reLaunch({ url }).catch((error) => {
      console.error('跳转失败:', error);
    });
  };

  useLoad((options) => {
    // 解析 redirect 及其余参数，生成最终跳转地址
    try {
      const redirect = options?.redirect ? decodeURIComponent(options.redirect as string) : '';
      let finalUrl: string | null = null;
      if (redirect) {
        const otherParams: Record<string, string> = {};
        Object.keys(options || {}).forEach((key) => {
          if (key !== 'redirect' && options[key] !== undefined && options[key] !== null) {
            otherParams[key] = String(options[key]);
          }
        });

        const queryPairs = Object.keys(otherParams).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(otherParams[k])}`);
        const hasQuery = redirect.includes('?');
        const queryString = queryPairs.length ? `${hasQuery ? '&' : '?'}${queryPairs.join('&')}` : '';
        finalUrl = `${redirect}${queryString}`;
      }

      redirectRef.current = finalUrl;
      setRedirectUrl(finalUrl);
    } catch (err) {
      console.warn('解析 redirect 参数失败:', err);
      redirectRef.current = null;
      setRedirectUrl(null);
    } finally {
      // 解析完成后再开始初始化流程
      initializeApp();
    }
  });


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
