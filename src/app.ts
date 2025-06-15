import React, { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { AuthProvider } from './context/auth'
// 全局样式
import './app.less'

interface AppProps {
  children: React.ReactNode
}

function App(props: AppProps) {
  // 可以使用所有的 React Hooks
  useEffect(() => {})

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})

  return React.createElement(
    AuthProvider,
    null,
    props.children
  )
}

export default App
