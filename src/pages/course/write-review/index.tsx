import React, { useState } from "react";
import { View, Text, Textarea } from "@tarojs/components";
import { Rate, Button, Dialog } from "@nutui/nutui-react-taro";
import Taro, { useRouter } from "@tarojs/taro";
import { courseReviewApi } from "../../../services/course";
import "./index.less";

const WriteReview: React.FC = () => {
  const router = useRouter();
  const { id, courseCode, courseName } = router.params;

  // 状态管理
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // 评分描述
  const ratingDescriptions = {
    1: "非常不满意",
    2: "不满意",
    3: "一般",
    4: "满意",
    5: "非常满意",
  };

  // 获取评分颜色
  const getRatingColor = (rating: number) => {
    if (rating >= 5) return "#52c41a";
    if (rating >= 4) return "#faad14";
    if (rating >= 3) return "#fa8c16";
    return "#ff4d4f";
  };

  // 获取字符计数颜色
  const getCharCountColor = (count: number) => {
    if (count < 10) return "#ff4d4f";
    if (count < 50) return "#fa8c16";
    if (count > 500) return "#ff4d4f";
    return "#52c41a";
  };

  // 表单验证
  const validateForm = () => {
    if (!rating || rating < 1 || rating > 5) {
      Taro.showToast({
        title: "请选择评分",
        icon: "error",
        duration: 2000,
      });
      return false;
    }

    if (!content.trim()) {
      Taro.showToast({
        title: "请输入评价内容",
        icon: "error",
        duration: 2000,
      });
      return false;
    }

    if (content.trim().length < 10) {
      Taro.showToast({
        title: "评价内容至少需要10个字符",
        icon: "error",
        duration: 2000,
      });
      return false;
    }

    if (content.trim().length > 500) {
      Taro.showToast({
        title: "评价内容不能超过500个字符",
        icon: "error",
        duration: 2000,
      });
      return false;
    }

    return true;
  };

  // 提交评价
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // 模拟用户信息（实际应用中应该从用户登录状态获取）
      const mockUser = {
        userId: Math.floor(Math.random() * 1000) + 100,
        username: `student_${Math.floor(Math.random() * 1000)}`,
      };

      const reviewData = {
        courseId: Number(id),
        userId: mockUser.userId,
        username: mockUser.username,
        rating: rating,
        content: content.trim(),
      };

      await courseReviewApi.createReview(reviewData);

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("提交评价失败:", error);

      // 检查是否是重复评价错误
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as any).message;
        if (
          errorMessage.includes("已经评价过") ||
          errorMessage.includes("duplicate")
        ) {
          Taro.showToast({
            title: "您已经评价过这门课程了",
            icon: "error",
            duration: 3000,
          });
          return;
        }
      }

      Taro.showToast({
        title: "提交失败，请稍后重试",
        icon: "error",
        duration: 2000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 成功对话框确认
  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    // 返回到课程评价页面
    Taro.navigateBack();
  };

  return (
    <View className="write-review-container">
      {/* 页面头部 */}
      <View className="header">
        <View className="header-content">
          <Text className="course-code">
            {decodeURIComponent(courseCode || "")}
          </Text>
          <Text className="course-name">
            {decodeURIComponent(courseName || "")}
          </Text>
          <Text className="subtitle">撰写评价</Text>
        </View>
      </View>

      {/* 评价表单 */}
      <View className="form-container">
        <View className="form-content">
          {/* 评分选择 */}
          <View className="form-section">
            <Text className="section-title">课程评分</Text>
            <View className="rating-section">
              <Rate
                value={rating}
                onChange={setRating}
                // size={32}
                // activeColor={getRatingColor(rating)}
                allowHalf={false}
              />
              <Text
                className="rating-description"
                style={{ color: getRatingColor(rating) }}
              >
                {ratingDescriptions[rating as keyof typeof ratingDescriptions]}
              </Text>
            </View>
          </View>

          {/* 评价内容 */}
          <View className="form-section">
            <Text className="section-title">评价内容</Text>
            <View className="content-section">
              <View className="content-input-container">
                <Textarea
                  className="content-input"
                  placeholder="请详细描述您对这门课程的看法，包括教学质量、课程内容、作业难度等方面..."
                  value={content}
                  onInput={(e) => setContent(e.detail.value)}
                  maxlength={500}
                  showConfirmBar={false}
                  adjustPosition={false}
                />
              </View>

              <View className="char-count">
                <Text
                  className="count-text"
                  style={{ color: getCharCountColor(content.length) }}
                >
                  {content.length}/500
                </Text>
                {content.length < 10 && (
                  <Text className="min-length-tip">至少需要10个字符</Text>
                )}
              </View>
            </View>
          </View>

          {/* 审核提示 */}
          <View className="notice-section">
            <Text className="notice-title">📋 评价须知</Text>
            <Text className="notice-content">
              • 您的评价将在提交后进入审核流程{"\n"}•
              审核通过后将公开显示并计入课程评分{"\n"}•
              请确保评价内容客观真实，避免恶意评价{"\n"}•
              每门课程只能评价一次，请谨慎填写
            </Text>
          </View>

          {/* 提交按钮 */}
          <Button
            className="submit-btn"
            type="primary"
            size="large"
            loading={submitting}
            disabled={submitting || !content.trim() || content.length < 10}
            onClick={handleSubmit}
          >
            {submitting ? "提交中..." : "提交评价"}
          </Button>
        </View>
      </View>

      {/* 成功对话框 */}
      <Dialog
        visible={showSuccessDialog}
        title="评价提交成功"
        content={
          <View className="success-dialog-content">
            <Text className="success-message">
              感谢您的评价！您的评价已提交成功，正在等待审核。
            </Text>
            <Text className="review-info">
              审核通过后，您的评价将会公开显示并计入课程的整体评分。
            </Text>
          </View>
        }
        onConfirm={handleSuccessConfirm}
        confirmText="确定"
        hideCancelButton
      />
    </View>
  );
};

export default WriteReview;
