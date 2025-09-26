import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import { Button, Toast, Dialog } from "@nutui/nutui-react-taro";
import { Swiper } from "@taroify/core";
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { secondhandApi, SecondhandItem } from "../../../services/secondhand";
import "./index.less";

import "@taroify/core/swiper/style";

// Status display mapping
const statusMap = {
  available: { text: "可购买", color: "#52c41a" },
  sold: { text: "已售出", color: "#ff4d4f" },
  reserved: { text: "已预订", color: "#faad14" },
};

const SecondHandDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  // 分享给好友 / 群聊
  useShareAppMessage(() => {
    const title = item?.title ? `${item.title} · 布村换换乐` : "布村换换乐精选";
    const imageUrl = item?.imageUrls?.[0] || item?.image;
    const redirect = encodeURIComponent('/pages/second-hand/detail/index');
    const path = `/pages/loading/index?redirect=${redirect}&id=${id || ''}`;
    return { title, path, imageUrl };
  });

  // 朋友圈分享
  useShareTimeline(() => {
    const title = item?.title || "布村换换乐精选";
    const redirect = encodeURIComponent('/pages/second-hand/detail/index');
    return { title, query: `redirect=${redirect}&id=${id || ''}` };
  });

  // State management
  const [item, setItem] = useState<SecondhandItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load item details
  const loadItemDetail = async () => {
    if (!id) {
      Taro.showToast({
        title: "商品ID不存在",
        icon: "none",
      });
      Taro.navigateBack();
      return;
    }

    try {
      setLoading(true);
      const numericId = parseInt(id);
      const response = await secondhandApi.getItemById(numericId);

      // 若详情缺少 imageUrls，则尝试从列表接口补全
      if (!response.imageUrls || response.imageUrls.length === 0) {
        try {
          const list = await secondhandApi.getAllItems();
          const found = list.data.find((it) => it.id === numericId);
          if (found && found.imageUrls && found.imageUrls.length > 0) {
            response.imageUrls = found.imageUrls;
          }
        } catch {}
      }

      setItem(response);
    } catch (error) {
      console.error("Failed to load item detail:", error);
      showToastMessage("加载商品详情失败");
    } finally {
      setLoading(false);
    }
  };

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Handle contact seller
  const handleContactSeller = () => {
    if (!item) return;
    const contactChunks: string[] = []
    if (item.sellerContact) {
      contactChunks.push(`联系方式：${item.sellerContact}`)
    }
    if (item.sellerEmail) {
      contactChunks.push(`邮箱：${item.sellerEmail}`)
    }

    if (contactChunks.length === 0) {
      Taro.showToast({
        title: '卖家暂未提供联系方式',
        icon: 'none',
        duration: 1800
      })
      return
    }

    const clipboardText = contactChunks.join('\n')

    Taro.setClipboardData({ data: clipboardText })
      .then(() => {
        Taro.showModal({
          title: '联系卖家',
          content: '联系方式已复制，快去联系吧~',
          showCancel: false,
          confirmText: '好'
        })
      })
      .catch(() => {
        Taro.showToast({
          title: '复制失败，请稍后重试',
          icon: 'none',
          duration: 1800
        })
      })
  };



  // Confirm delete
  const confirmDelete = async () => {
    if (!item) return;

    try {
      await secondhandApi.deleteItem(item.id);
      showToastMessage("删除成功");
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error("Delete failed:", error);
      showToastMessage("删除失败，请稍后重试");
    }
    setShowDeleteDialog(false);
  };

  // Format time display - 更新以支持新的字段名
  const formatTime = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if current user is the seller
  const isOwner = () => {
    const userInfo = Taro.getStorageSync("userInfo");
    return userInfo && item && userInfo.id === item.sellerId;
  };

  const handleImagePreview = (startIndex: number) => {
    if (!item) return;
    const urls = (item.imageUrls && item.imageUrls.length > 0)
      ? item.imageUrls
      : (item.image ? [item.image] : []);
    if (!urls.length) return;
    Taro.previewImage({
      current: urls[Math.max(0, Math.min(startIndex, urls.length - 1))],
      urls,
    });
  };

  const handleSwiperChange = (
    value: number | { detail?: { current?: number } }
  ) => {
    if (typeof value === "number") {
      setCurrentImageIndex(value);
      return;
    }
    const next = value?.detail?.current;
    if (typeof next === "number") {
      setCurrentImageIndex(next);
    }
  };

  // const handleSwiperChange = (index: number) => {
  //   setCurrentImageIndex(index);
  // };

  useEffect(() => {
    loadItemDetail();
  }, [id]);

  if (loading) {
    return (
      <View className="detail-container">
        <View className="loading-container">
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="detail-container">
        <View className="error-container">
          <Text>商品不存在</Text>
          <Button size="small" onClick={() => Taro.navigateBack()}>
            返回
          </Button>
        </View>
      </View>
    );
  }


  return (
    <View className="detail-container">
      <ScrollView className="detail-content" scrollY>
        {/* 图片展示区域 */}
        <View className="image-section">
          {item?.imageUrls && item?.imageUrls.length > 0 ? (
            <Swiper
              className="image-swiper"
              lazyRender
              autoplay={1000}
              defaultValue={0}
              onChange={handleSwiperChange}
            >
              {item.imageUrls.map((imageUrl, index) => (
                <Swiper.Item key={index}>
                  <Image
                    className="detail-image"
                    src={imageUrl}
                    mode="aspectFill"
                    lazyLoad
                    onClick={() => handleImagePreview(index)}
                    onError={() => console.warn("图片加载失败:", imageUrl)}
                  />
                </Swiper.Item>
              ))}
            </Swiper>
          ) : (
            <View className="no-image">
              <Text>暂无图片</Text>
            </View>
          )}

          {/* 图片计数器 */}
          {item?.imageUrls && item.imageUrls.length > 1 && (
            <View className="image-counter">
              {currentImageIndex + 1} / {item.imageUrls.length}
            </View>
          )}
        </View>

        {/* 商品基本信息 */}
        <View className="info-card">
          <View className="title-section">
            <Text className="item-title">{item.title}</Text>
            <View className="price-status-row">
              <Text className="item-price">¥{item.price}</Text>
              <View
                className="status-tag"
                style={{ backgroundColor: statusMap[item.status || 'available'].color }}
              >
                <Text className="status-text">
                  {statusMap[item.status || 'available'].text}
                </Text>
              </View>
            </View>
          </View>

          {/* 商品详细信息 */}
          <View className="detail-info">
            {item.productStatusName && (
              <View className="info-row">
                <Text className="info-label">使用状况</Text>
                <Text className="info-value">{item.productStatusName}</Text>
              </View>
            )}

            {(item.subCategoryName || item.categoryName) && (
              <View className="info-row">
                <Text className="info-label">商品分类</Text>
                <Text className="info-value">
                  {item.subCategoryName && item.categoryName
                    ? `${item.subCategoryName} / ${item.categoryName}`
                    : item.categoryName || item.subCategoryName
                  }
                </Text>
              </View>
            )}

            <View className="info-row">
              <Text className="info-label">发布时间</Text>
              <Text className="info-value">
                {formatTime(item.dateCreated || item.createdAt || '')}
              </Text>
            </View>

            {item.sellerName && (
              <View className="info-row">
                <Text className="info-label">卖家</Text>
                <Text className="info-value">{item.sellerName}</Text>
              </View>
            )}
          </View>

          {/* 商品描述 */}
          {item.description && (
            <View className="description-section">
              <Text className="description-title">商品描述</Text>
              <Text className="description-text">{item.description}</Text>
            </View>
          )}
        </View>

        {/* 操作按钮区域 */}
        {!isOwner() && (
          <View className="action-section">
            <Button
              className="contact-btn"
              onClick={handleContactSeller}
              block
            >
              联系卖家
            </Button>
          </View>
        )}

        {/* 卖家操作 */}
        {isOwner() && (
          <View className="owner-actions">
            <Button
              className="delete-btn"
              onClick={() => setShowDeleteDialog(true)}
              block
            >
              删除商品
            </Button>
          </View>
        )}

        {/* 删除确认对话框 */}
        <Dialog
          visible={showDeleteDialog}
          title="确认删除"
          content="确定要删除这个商品吗？删除后无法恢复。"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />

        {/* Toast提示 */}
        <Toast
          content={toastMessage}
          visible={showToast}
          type="text"
          onClose={() => setShowToast(false)}
        />
      </ScrollView>
    </View>
  );
};

export default SecondHandDetail;
