import { useLoading } from '../context/loading';

// 高阶函数，用于包装异步操作并显示加载状态
export const withLoading = async <T>(
  asyncFn: () => Promise<T>,
  loadingText: string = '加载中...',
  showLoading: (text: string) => void,
  hideLoading: () => void
): Promise<T> => {
  try {
    showLoading(loadingText);
    const result = await asyncFn();
    return result;
  } finally {
    hideLoading();
  }
};

// Hook版本的withLoading
export const useWithLoading = () => {
  const { showLoading, hideLoading } = useLoading();

  return {
    withLoading: async <T>(
      asyncFn: () => Promise<T>,
      loadingText: string = '加载中...'
    ): Promise<T> => {
      return withLoading(asyncFn, loadingText, showLoading, hideLoading);
    },
    showLoading,
    hideLoading,
  };
};
