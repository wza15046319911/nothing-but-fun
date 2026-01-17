import React from 'react';
import { View, Text } from '@tarojs/components';
import { Loading } from '@nutui/nutui-react-taro';
import './index.less';

interface GlobalLoadingProps {
  visible: boolean;
  text?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ visible, text = '加载中...' }) => {
  if (!visible) return null;

  return (
    <View className="global-loading-mask">
      <View className="loading-content">
        <Loading />
        <Text className="loading-text">{text}</Text>
      </View>
    </View>
  );
};

export default GlobalLoading;
