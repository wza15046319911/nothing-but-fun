import React from 'react';
import { ScrollView, View, Text, Image, Button } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import './index.less';

type ServiceItem = {
  title: string;
  desc: string;
};

const PROFILE_AVATAR_URL =
  'https://res.cloudinary.com/davy7cgyi/image/upload/v1770783252/Weixin_Image_20260211150922_222_21_ucj8tj.jpg';
const PROFILE_QR_URL =
  'https://res.cloudinary.com/davy7cgyi/image/upload/v1770783253/Weixin_Image_20260211150921_221_21_ug1fbu.jpg';

const PROFILE_DATA = {
  pageTitle: 'About Developer',
  pageSubtitle: 'Expert Guidance for UQ EECS Students',
  name: 'Lewis Wang',
  aliases: '同学们常叫：李哥 / le哥 / 李老师',
  tagLine: '前字节研发 | Senior Backend Dev',
  experience: '8年 UQ EECS 辅导经验',
  courseTitle: '核心课程',
  courses: ['CSSE1001', 'COMP3506', 'INFS3202'],
  summary: '精通 EECS 体系，覆盖课程重难点与作业思路，目标是帮助你更稳地冲击高分。',
  principles: ['不灌水，只讲关键', '按个人基础制定计划', '课后可持续答疑'],
  services: [
    { title: '⚡ 选课指导', desc: '按基础和目标定制选课路径，避开常见踩坑。' },
    { title: '🎓 课程辅导', desc: '结合课程要求拆解重点，补齐知识短板。' },
    { title: '🏝️ 校园答疑', desc: '学习规划、课程节奏、资源使用都可以咨询。' },
  ] as ServiceItem[],
  qrHint: '扫码添加微信',
};

const isAlbumPermissionError = (error: unknown) => {
  const msg = String((error as any)?.errMsg || (error as any)?.message || '').toLowerCase();
  return (
    msg.includes('auth deny') ||
    msg.includes('auth denied') ||
    msg.includes('authorize') ||
    msg.includes('permission')
  );
};

const ProfilePage: React.FC = () => {
  useShareAppMessage(() => ({
    title: '关于开发者 | UQ EECS 8年骨灰级学长',
    path: '/pages/profile/index?fromShare=1',
    imageUrl: PROFILE_AVATAR_URL,
  }));

  useShareTimeline(() => ({
    title: '关于开发者 | UQ EECS 8年骨灰级学长',
    query: 'fromShare=1',
    imageUrl: PROFILE_AVATAR_URL,
  }));

  const handlePreviewQr = () => {
    Taro.previewImage({
      current: PROFILE_QR_URL,
      urls: [PROFILE_QR_URL],
    });
  };

  const handleSaveQrToAlbum = async () => {
    Taro.showLoading({
      title: '保存中...',
      mask: true,
    });

    try {
      const downloadRes = await Taro.downloadFile({ url: PROFILE_QR_URL });

      if (downloadRes.statusCode && downloadRes.statusCode !== 200) {
        throw new Error('二维码下载失败');
      }

      if (!downloadRes.tempFilePath) {
        throw new Error('二维码下载失败');
      }

      await Taro.saveImageToPhotosAlbum({
        filePath: downloadRes.tempFilePath,
      });

      Taro.showToast({
        title: '已保存到相册',
        icon: 'success',
      });
    } catch (error) {
      if (isAlbumPermissionError(error)) {
        const modalRes = await Taro.showModal({
          title: '需要相册权限',
          content: '请在设置中开启“保存到相册”权限后重试。',
          confirmText: '去设置',
          cancelText: '取消',
        });

        if (modalRes.confirm) {
          await Taro.openSetting();
        }
      } else {
        Taro.showToast({
          title: '保存失败，请稍后重试',
          icon: 'none',
        });
      }
    } finally {
      Taro.hideLoading();
    }
  };

  return (
    <ScrollView className="profile-page" scrollY>
      <View className="hero-panel">
        <View className="hero-badge">FOR STUDENTS</View>

        <View className="hero-profile">
          <Image className="avatar" src={PROFILE_AVATAR_URL} mode="aspectFill" />
          <View className="header-text">
            <Text className="name">{PROFILE_DATA.name}</Text>
            <Text className="aliases">{PROFILE_DATA.aliases}</Text>
            <Text className="tagline">{PROFILE_DATA.tagLine}</Text>
          </View>
        </View>

        <View className="hero-stats">
          <View className="stat-item">
            <Text className="stat-num">8年</Text>
            <Text className="stat-label">教学经验</Text>
          </View>
          <View className="stat-divider" />
          <View className="stat-item">
            <Text className="stat-num">3门</Text>
            <Text className="stat-label">核心课</Text>
          </View>
        </View>
      </View>

      <View className="card section-card capability-card">
        <View className="section-head">
          <Text className="section-title">经验与方法</Text>
          <Text className="section-badge">稳定提分</Text>
        </View>
        <Text className="experience">{PROFILE_DATA.summary}</Text>
        <View className="principle-list">
          {PROFILE_DATA.principles.map((item) => (
            <View key={item} className="principle-chip">
              {item}
            </View>
          ))}
        </View>
      </View>

      <View className="card section-card">
        <View className="section-head">
          <Text className="section-title">{PROFILE_DATA.courseTitle}</Text>
        </View>
        <View className="course-tags">
          {PROFILE_DATA.courses.map((course) => (
            <View key={course} className="course-tag">
              <Text className="course-prefix">#</Text>
              {course}
            </View>
          ))}
        </View>
      </View>

      <View className="card section-card">
        <Text className="section-title">你可以获得的支持</Text>
        <View className="service-grid">
          {PROFILE_DATA.services.map((service) => (
            <View key={service.title} className="service-item">
              <Text className="service-title">{service.title}</Text>
              <Text className="service-desc">{service.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="card section-card">
        <Text className="section-title">联系开发者</Text>
        <Text className="qr-hint">{PROFILE_DATA.qrHint}</Text>
        <View className="qr-wrapper">
          <Image
            className="qr-image"
            src={PROFILE_QR_URL}
            mode="aspectFill"
            onClick={handlePreviewQr}
          />
        </View>
        <View className="qr-actions">
          <View className="action-btn secondary" onClick={handlePreviewQr}>
            预览二维码
          </View>
          <View className="action-btn primary" onClick={handleSaveQrToAlbum}>
            保存到相册
          </View>
          <Button className="action-btn share" openType="share">
            分享名片
          </Button>
        </View>
      </View>

      <View className="bottom-spacing" />
    </ScrollView>
  );
};

export default ProfilePage;
