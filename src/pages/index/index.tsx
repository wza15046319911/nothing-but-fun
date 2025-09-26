import React from "react";
import { View, Text, ScrollView, Image } from "@tarojs/components";
import Taro, {
  useShareAppMessage,
  useShareTimeline,
  useLoad,
} from "@tarojs/taro";
import "./index.less";

// SVG图标引入
import BagIcon from "../../assets/icons/bag-svgrepo-com.svg";
import BalloonIcon from "../../assets/icons/hot-air-balloon-svgrepo-com.svg";
import TentIcon from "../../assets/icons/tent-svgrepo-com.svg";
import BbqIcon from "../../assets/icons/bbq-svgrepo-com.svg";
import GlassesIcon from "../../assets/icons/glasses-svgrepo-com.svg";
import DivingIcon from "../../assets/icons/diving-goggles-svgrepo-com.svg";
import MapIcon from "../../assets/icons/map-svgrepo-com.svg";

// 主要功能 - 7个功能入口，按顺序排列
const mainFeatures = [
  {
    id: 1,
    title: "布村换换乐",
    subtitle: "闲置宝贝轻松上新",
    description: "精选好物随心换，环保又实惠",
    icon: BagIcon,
    iconType: "svg",
    path: "/pages/second-hand/index",
    gradient: "linear-gradient(135deg, #4ecdc4 0%, #6ee7dd 100%)",
    bgColor: "#f0fffe",
  },
  {
    id: 2,
    title: "布玩新鲜事",
    subtitle: "每周活动一览",
    description: "最新活动日历，玩乐全掌握",
    icon: BalloonIcon,
    iconType: "svg",
    path: "/pages/recent-activities/index",
    gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
    bgColor: "#fff4ed",
  },
  {
    id: 3,
    title: "精彩回放站",
    subtitle: "重温高光瞬间",
    description: "活动花絮随时回看",
    icon: TentIcon,
    iconType: "svg",
    path: "/pages/past-activities/index",
    gradient: "linear-gradient(135deg, #96ceb4 0%, #b3d9c7 100%)",
    bgColor: "#f0fdf4",
  },
  {
    id: 4,
    title: "布村好吃榜",
    subtitle: "发现周边美味餐厅",
    description: "真点评·布里斯班美食",
    icon: BbqIcon,
    iconType: "svg",
    path: "/pages/restaurant/index",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)",
    bgColor: "#fff5f5",
  },
  {
    id: 5,
    title: "布玩好物铺",
    subtitle: "精选周边伴手礼",
    description: "文创好物随手带回家",
    icon: MapIcon,
    iconType: "svg",
    path: "/pages/gift/index",
    gradient: "linear-gradient(135deg, #45b7d1 0%, #6cc5e0 100%)",
    bgColor: "#f0f9ff",
  },
  // {
  //   id: 6,
  //   title: "课程评价",
  //   subtitle: "分享学习体验",
  //   description: "查看和分享课程评价",
  //   icon: GlassesIcon,
  //   iconType: "svg",
  //   path: "/pages/course/index",
  //   gradient: "linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)",
  //   bgColor: "#faf5ff",
  // },
  {
    id: 7,
    title: "布玩小秘书",
    subtitle: "贴心客服随时待命",
    description: "活动报名、问题反馈一站解决",
    icon: DivingIcon,
    iconType: "svg",
    path: "/pages/contact-us/index",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)",
    bgColor: "#fffbeb",
  },
];

// 类型定义
interface FeatureEntry {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  iconType?: "svg" | "emoji";
  path: string;
  gradient?: string;
  bgColor?: string;
}

const Index: React.FC = () => {
  // 分享给好友：落地到 loading 页面
  useShareAppMessage(() => ({
    title: "Nothing But Fun | 布好玩",
    path: "/pages/loading/index",
  }));

  // 朋友圈分享：附带标记参数，进入首页后跳转 loading
  useShareTimeline(() => ({
    title: "Nothing But Fun | 布好玩",
    query: "fromShare=1",
  }));

  // 处理从分享进入首页的场景，先跳转到 loading
  useLoad((options) => {
    if (options && options.fromShare === "1") {
      Taro.reLaunch({ url: "/pages/loading/index" });
    }
  });

  // 处理功能点击
  const handleEntryClick = (entry: FeatureEntry) => {
    const upcomingPaths = ["/pages/course/index"];
    if (upcomingPaths.includes(entry.path)) {
      Taro.showToast({
        title: `${entry.title}功能正在开发中`,
        icon: "none",
        duration: 2000,
      });
      return;
    }
    if (entry.path) {
      Taro.navigateTo({
        url: entry.path,
      });
    } else {
      Taro.showToast({
        title: `${entry.title}功能正在开发中`,
        icon: "none",
        duration: 2000,
      });
    }
  };

  return (
    <ScrollView className="index-container" scrollY>
      {/* 页面头部 */}
      <View className="header-section">
        <View className="header-content">
          <Text className="app-title">Nothing But Fun</Text>
          <Text className="app-subtitle">布好玩 - 布村好玩的尽在掌握</Text>
        </View>
      </View>

      {/* 主要功能区域 - 7个功能入口，上下排列 */}
      <View className="main-features-section">
        <Text className="section-title">服务功能</Text>
        <View className="main-features-vertical">
          {mainFeatures.map((feature) => (
            <View
              key={feature.id}
              className="main-feature-card-vertical"
              onClick={() => handleEntryClick(feature)}
              style={{ backgroundColor: feature.bgColor }}
            >
              <View className="feature-header">
                <View
                  className="feature-icon-container"
                >
                  {feature.iconType === "svg" ? (
                    <Image
                      className="feature-icon-svg"
                      src={feature.icon}
                      mode="aspectFit"
                    />
                  ) : (
                    <Text className="feature-icon">{feature.icon}</Text>
                  )}
                </View>
              </View>
              <View className="feature-content">
                <Text className="feature-title">{feature.title}</Text>
                <Text className="feature-subtitle">{feature.subtitle}</Text>
                <Text className="feature-description">
                  {feature.description}
                </Text>
              </View>
              <View className="feature-arrow">
                <Text className="arrow-icon">→</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Index;
