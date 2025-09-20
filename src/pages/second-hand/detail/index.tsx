import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import {
  Button,
  Toast,
  ActionSheet,
  Dialog,
  Swiper,
} from "@nutui/nutui-react-taro";
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { secondhandApi, SecondhandItem } from "../../../services/secondhand";
import "./index.less";

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
    const title = item?.title ? `${item.title} - 二手好物` : "二手好物精选";
    const imageUrl = item?.imageUrls?.[0] || item?.image;
    const redirect = encodeURIComponent('/pages/second-hand/detail/index');
    const path = `/pages/loading/index?redirect=${redirect}&id=${id || ''}`;
    return { title, path, imageUrl };
  });

  // 朋友圈分享
  useShareTimeline(() => {
    const title = item?.title || "二手好物精选";
    // 朋友圈落地默认到 loading，再由 loading 跳详情
    const redirect = encodeURIComponent('/pages/second-hand/detail/index');
    return { title, query: `redirect=${redirect}&id=${id || ''}` };
  });


  // State management
  const [item, setItem] = useState<SecondhandItem | null>(null);
  const [loading, setLoading] = useState(true);
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showActionSheet, setShowActionSheet] = useState(false);
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
    Taro.setClipboardData({
      data: item.sellerContact,
      
    });
    Taro.showModal({
      title: "联系卖家",
      content: `卖家联系方式已拷贝`,
      showCancel: false,
      confirmText: "好",
    });
  };


  // Handle more actions
  const handleMoreActions = () => {
    setShowActionSheet(true);
  };

  // Handle report
  const handleReport = () => {
    setShowActionSheet(false);
    Taro.showToast({
      title: "举报功能开发中",
      icon: "none",
    });
  };

  // Handle delete (only for item owner)
  const handleDelete = () => {
    setShowActionSheet(false);
    setShowDeleteDialog(true);
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

  const actionSheetOptions = isOwner()
    ? [
        { name: "删除商品", value: "delete" },
        { name: "取消", value: "cancel" },
      ]
    : [
        { name: "举报商品", value: "report" },
        { name: "取消", value: "cancel" },
      ];

  return (
    <View className="enhanced-item-detail-container">
      <ScrollView className="enhanced-content" scrollY>
        <View className="enhanced-header-image-section">
          <View className="image-hero-container">
            {item?.imageUrls && item?.imageUrls.length > 1 ? (
              <View className="enhanced-swiper-container">
                <Swiper
                  defaultValue={0}
                  indicator
                  autoplay
                  width={500}
                  height={500}
                >
                  {item?.imageUrls.map((imageUrl, index) => (
                    <Swiper.Item key={imageUrl}>
                        <Image
                          className="enhanced-item-main-image"
                          src={imageUrl}
                          mode="aspectFill"
                          onClick={() => handleImagePreview(index)}
                        />
                    </Swiper.Item>
                  ))}
                </Swiper>
              </View>
            ) : (
              <View className="enhanced-single-image-container">
                <Image
                  className="enhanced-item-main-image"
                  src={item?.imageUrls?.[0] || item?.image}
                  mode="aspectFill"
                  onClick={() => handleImagePreview(0)}
                />
                <View className="image-overlay"></View>
              </View>
            )}
          </View>
        </View>

        {/* Basic info card */}
        <View className="enhanced-basic-info-card">
          <View className="info-header">
            <View className="name-section">
              <Text className="enhanced-item-name">{item.title}</Text>
              <View className="item-badges">
                <View className="price-badge">
                  <Text className="badge-icon">💰</Text>
                  <Text className="badge-text">¥{typeof item.price === 'number' ? item.price : item.price}</Text>
                </View>
                <View
                  className="status-badge-chip"
                  style={{ backgroundColor: statusMap[item.status || 'available'].color }}
                >
                  <Text className="badge-text">
                    {statusMap[item.status || 'available'].text}
                  </Text>
                </View>
              </View>
            </View>
            <View className="more-button" onClick={handleMoreActions}>
              ⋯
            </View>
          </View>

          <View className="meta-section-enhanced">
            <View className="meta-row">
              <Text className="meta-icon">🕒</Text>
              <Text className="meta-text">
                发布于 {formatTime(item.dateCreated || item.createdAt || '')}
              </Text>
            </View>
          </View>

          {item.description && (
            <View className="enhanced-description-section">
              <Text className="section-title">商品描述</Text>
              <Text className="enhanced-description-text">
                {item.description}
              </Text>
            </View>
          )}

          <View className="quick-actions">
            <View
              className="action-item"
              onClick={() =>
                Taro.showToast({ title: "收藏功能开发中", icon: "none" })
              }
            >
              <Text className="action-icon">❤️</Text>
              <Text className="action-text">收藏</Text>
            </View>
            <View
              className="action-item"
              onClick={() =>
                Taro.showToast({ title: "分享功能开发中", icon: "none" })
              }
            >
              <Text className="action-icon">📤</Text>
              <Text className="action-text">分享</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!isOwner() && (
          <View className="action-section">
            <Button className="contact-button" onClick={handleContactSeller}>
              联系卖家
            </Button>
          </View>
        )}

        {/* Action Sheet */}
        <ActionSheet
          visible={showActionSheet}
          options={actionSheetOptions}
          onSelect={(item) => {
            if (item.value === "delete") {
              handleDelete();
            } else if (item.value === "report") {
              handleReport();
            } else {
              setShowActionSheet(false);
            }
          }}
          onCancel={() => setShowActionSheet(false)}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          visible={showDeleteDialog}
          title="确认删除"
          content="确定要删除这个商品吗？删除后无法恢复。"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />

        {/* Toast */}
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
