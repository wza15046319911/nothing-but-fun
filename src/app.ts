import React, { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { AuthProvider } from './context/auth'
import { LoadingProvider, useLoading } from './context/loading'
import GlobalLoading from './components/GlobalLoading'
// 全局样式
import './app.less'

interface AppProps {
  children: React.ReactNode
}

// 内部组件，用于访问Loading Context
const AppContent: React.FC<AppProps> = (props) => {
  const { isLoading, loadingText } = useLoading()

  return React.createElement(
    React.Fragment,
    null,
    [
      props.children,
      React.createElement(GlobalLoading, {
        key: 'global-loading',
        visible: isLoading,
        text: loadingText
      })
    ]
  )
}

function App(props: AppProps) {
  // 可以使用所有的 React Hooks
  useEffect(() => {})

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})

  // 重新组织Provider顺序：LoadingProvider在外层，AuthProvider在内层
  return React.createElement(
    LoadingProvider,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(AppContent, props)
    )
  )
}

export default App
