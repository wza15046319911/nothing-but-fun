import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, ScrollView, Video } from "@tarojs/components";
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { Swiper, SwiperItem } from "@tarojs/components"; // Standard swiper
import { eventsApi, Event } from "../../../services/events";
import { useEventTypes } from "../../../hooks/useTypes";
import "./index.less";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&h=600&fit=crop";

const getVideoSrc = (videoUrl?: string) => {
  if (!videoUrl) return "";
  if (videoUrl.includes("player.cloudinary.com")) {
    try {
      const url = new URL(videoUrl);
      const cloudName = url.searchParams.get("cloud_name");
      const publicId = url.searchParams.get("public_id");
      if (cloudName && publicId) {
        const cleanPublicId = publicId.replace(/\.(mp4|webm|mov|avi)$/i, "");
        return `https://res.cloudinary.com/${cloudName}/video/upload/${cleanPublicId}.mp4`;
      }
    } catch (e) {
      console.error("Failed to parse Cloudinary embed URL:", e);
    }
  }
  if (!videoUrl.startsWith("http") && !videoUrl.startsWith("/")) {
    const cloudName = "ds9attzj6";
    const cleanPublicId = videoUrl.replace(/\.(mp4|webm|mov|avi)$/i, "");
    return `https://res.cloudinary.com/${cloudName}/video/upload/${cleanPublicId}.mp4`;
  }
  if (videoUrl.includes("res.cloudinary.com") && videoUrl.includes("/video/upload/")) {
    if (!videoUrl.match(/\.(mp4|webm|mov|avi)$/i)) {
      return `${videoUrl}.mp4`;
    }
    return videoUrl;
  }
  return videoUrl;
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "待定";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "待定";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const formatPrice = (event: Event | null) => {
  if (!event) return "待定";
  if (event.free) return "免费";
  if (event.priceFrom !== undefined && event.priceFrom !== null) {
    if (event.priceTo !== undefined && event.priceTo !== null && event.priceTo !== event.priceFrom) {
      return `$${event.priceFrom}-${event.priceTo}`;
    }
    return `$${event.priceFrom}`;
  }
  if (event.price !== undefined && event.price !== null) {
    return `$${event.price}`;
  }
  return "待定";
};

const EventDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;
  const { getEventTypeName } = useEventTypes();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!event) return [FALLBACK_IMAGE];
    if (event.imageUrls && event.imageUrls.length > 0) return event.imageUrls;
    if (event.image) return [event.image];
    return [FALLBACK_IMAGE];
  }, [event]);
  
  const isPastEvent = useMemo(() => {
      if (!event || !event.endTime) return false;
      return new Date(event.endTime).getTime() < Date.now();
  }, [event]);

  useEffect(() => {
    const loadData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await eventsApi.getEventById(parseInt(id));
            setEvent(data);
        } catch (e) {
            console.error(e);
            Taro.showToast({ title: '加载失败', icon: 'none' });
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [id]);

  const handleSwiperChange = (e: any) => {
    setActiveImageIndex(e.detail.current);
  };
  
  const handlePreview = (idx: number) => {
      Taro.previewImage({
          current: images[idx],
          urls: images
      });
  };

  const handleBack = () => Taro.navigateBack();
  const handleShare = () => Taro.showShareMenu({ withShareTicket: true });

  // Share config
  useShareAppMessage(() => ({
      title: event?.title || '精彩活动',
      path: `/pages/events/detail/index?id=${id}`,
      imageUrl: images[0]
  }));

  if (loading) return <View className="event-detail-page loading-state"><Text>正在加载...</Text></View>;
  if (!event) return <View className="event-detail-page error-state"><Text>未找到活动</Text></View>;

  const priceText = formatPrice(event);

  return (
    <View className="event-detail-page">
      <ScrollView className="event-detail-scroll" scrollY>
        {/* Immersive Header */}
        <View className="media-section">
             <View className="carousel-wrapper">
                 <Swiper 
                    circular 
                    autoplay={images.length > 1} 
                    style={{height: '100%'}} 
                    onChange={handleSwiperChange}
                 >
                    {images.map((url, idx) => (
                        <SwiperItem key={idx}>
                            <Image 
                                className="carousel-image" 
                                src={url} 
                                mode="aspectFill" 
                                onClick={() => handlePreview(idx)}
                            />
                        </SwiperItem>
                    ))}
                 </Swiper>
                 <View className="image-count-badge">
                   <Text>{activeImageIndex + 1}/{images.length}</Text>
                 </View>
             </View>
        </View>

        <View className="content-wrapper">
            {/* Primary Info */}
            <View className="detail-card primary-card">
                <View className="title-row">
                    <Text className="event-title">{event.title}</Text>
                    {event.eventTypeRid && (
                        <View className="event-type-tag">
                            <Text className="type-text">{getEventTypeName(event.eventTypeRid)}</Text>
                        </View>
                    )}
                </View>
                <Text className="event-subtitle">{event.description || '暂无简介'}</Text>
                
                <View className="price-row">
                    <Text className="price-label">价格</Text>
                    <Text className={`price-value ${event.free ? 'free' : ''}`}>{priceText}</Text>
                </View>
            </View>

            {/* Info Grid */}
            <View className="detail-card info-card">
                <Text className="section-title">活动信息</Text>
                <View className="info-grid">
                    <View className="info-item">
                        <Text className="info-label">开始时间</Text>
                        <Text className="info-value">{formatDateTime(event.startTime)}</Text>
                    </View>
                    <View className="info-item">
                        <Text className="info-label">结束时间</Text>
                        <Text className="info-value">{formatDateTime(event.endTime)}</Text>
                    </View>
                    <View className="info-item">
                        <Text className="info-label">地点</Text>
                        <Text className="info-value">{event.location || '待定'}</Text>
                    </View>
                    <View className="info-item">
                        <Text className="info-label">人数</Text>
                        <Text className="info-value">{event.capacity ? `${event.capacity}人` : '不限'}</Text>
                    </View>
                </View>
            </View>

            {/* Video */}
            {event.video && (
                <View className="detail-card video-card">
                    <Text className="section-title">活动视频</Text>
                    <Video
                        className="event-video"
                        src={getVideoSrc(event.video)}
                        controls
                        objectFit="contain"
                    />
                </View>
            )}
            
            {/* Description */}
            <View className="detail-card description-card">
                <Text className="section-title">详细介绍</Text>
                <Text className="description-text">
                    {event.description || '暂无更多详细介绍。'}
                </Text>
            </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View className="floating-action-bar">
          <View className="action-btn share-btn" onClick={handleShare}>
              📤
          </View>
          {!isPastEvent && (
            <View className="action-btn primary-btn" onClick={() => {}}>
                {event.free ? '免费报名' : '立即报名'}
            </View>
          )}
          {isPastEvent && (
            <View className="action-btn disabled-btn" style={{ background: '#ccc', color: '#fff' }}>
                活动已结束
            </View>
          )}
      </View>
    </View>
  );
};

export default EventDetail;
