import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useAuth } from "../../context/auth";
import "./index.less";

const Loading: React.FC = () => {
  const { checkLoginStatus } = useAuth();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const redirectRef = useRef<string | null>(null);

  // 模拟加载进度
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // 随机增加进度，模拟真实感
        return prev + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const initializeApp = async () => {
    const MIN_SPLASH_MS = 2000;
    const start = Date.now();

    try {
      await checkLoginStatus();
    } catch (e) {
      console.error("Auth check failed", e);
    }

    const elapsed = Date.now() - start;
    const remain = Math.max(0, MIN_SPLASH_MS - elapsed);

    if (remain > 0) {
      await new Promise((resolve) => setTimeout(resolve, remain));
    }

    // 确保进度条走完
    setProgress(100);
    setTimeout(() => {
      navigateToTarget();
    }, 300);
  };

  const navigateToTarget = () => {
    const candidate = redirectRef.current ?? redirectUrl;
    const url =
      candidate && candidate.startsWith("/pages/")
        ? candidate
        : "/pages/index/index";
    
    Taro.reLaunch({ url }).catch((error) => {
      console.error("跳转失败:", error);
      if (url !== "/pages/index/index") {
        Taro.reLaunch({ url: "/pages/index/index" });
      }
    });
  };

  useLoad((options) => {
    try {
      const redirect = options?.redirect
        ? decodeURIComponent(options.redirect as string)
        : "";
      let finalUrl: string | null = null;
      if (redirect) {
        const otherParams: Record<string, string> = {};
        Object.keys(options || {}).forEach((key) => {
          if (
            key !== "redirect" &&
            options[key] !== undefined &&
            options[key] !== null
          ) {
            otherParams[key] = String(options[key]);
          }
        });

        const queryPairs = Object.keys(otherParams).map(
          (k) => `${encodeURIComponent(k)}=${encodeURIComponent(otherParams[k])}`
        );
        const hasQuery = redirect.includes("?");
        const queryString = queryPairs.length
          ? `${hasQuery ? "&" : "?"}${queryPairs.join("&")}`
          : "";
        finalUrl = `${redirect}${queryString}`;
      }

      redirectRef.current = finalUrl;
      setRedirectUrl(finalUrl);
    } catch (err) {
      console.warn("解析 redirect 参数失败:", err);
    } finally {
      initializeApp();
    }
  });

  return (
    <View className="loading-screen">
      <View className="decorative-circle c1" />
      <View className="decorative-circle c2" />
      
      <View className="content-wrapper">
        <View className="logo-area">
          <Text className="logo-text-en">NOTHING BUT FUN</Text>
          <Text className="logo-text-zh">布好玩</Text>
        </View>

        <View className="slogan-area">
          <Text className="slogan">探索城市 • 发现精彩</Text>
        </View>
      </View>

      <View className="footer-area">
        <View className="progress-container">
          <View 
            className="progress-bar" 
            style={{ width: `${Math.min(progress, 100)}%` }} 
          />
        </View>
        <Text className="version-text">v1.0.0</Text>
      </View>
    </View>
  );
};

export default Loading;
