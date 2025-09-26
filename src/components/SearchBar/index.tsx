import React, { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'

interface SearchBarProps {
  onSearch: (keyword: string) => void
  placeholder?: string
  value?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "搜索...",
  value = ""
}) => {
  const [keyword, setKeyword] = useState<string>(value)
  const [isFocused, setIsFocused] = useState(false)
  // const [isInitialized, setIsInitialized] = useState(false)

  // Only trigger search after initial load and when user actually changes the keyword
  // useEffect(() => {
  //   if (!isInitialized) {
  //     setIsInitialized(true)
  //     return
  //   }

  //   const timer = setTimeout(() => {
  //     onSearch(keyword)
  //   }, 300)

  //   return () => clearTimeout(timer)
  // }, [keyword])

  // Handle clear
  const handleClear = () => {
    setKeyword('')
    onSearch('')
  }

  return (
    <View className="px-4 mb-4">
      <View
        className={`relative flex items-center bg-white rounded-xl border transition-all duration-200 ${
          isFocused
            ? 'border-blue-400 shadow-md'
            : 'border-gray-200 shadow-sm'
        }`}
      >
        {/* Search Icon */}
        <View className="absolute left-4 z-10">
          <Text className="text-gray-400 text-lg">🔍</Text>
        </View>

        {/* Search Input */}
        <Input
          className="flex-1 px-12 py-4 text-sm bg-transparent focus:outline-none"
          placeholder={placeholder}
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Clear Button */}
        {keyword && (
          <View
            className="absolute right-4 w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full cursor-pointer"
            onClick={handleClear}
          >
            <Text className="text-gray-500 text-xs">✕</Text>
          </View>
        )}
      </View>

      {/* Search Status */}
      {keyword && (
        <View className="flex items-center justify-between mt-2 px-2">
          <Text className="text-xs text-gray-500">
            正在搜索: "{keyword}"
          </Text>
          <View
            className="cursor-pointer"
            onClick={handleClear}
          >
            <Text className="text-xs text-blue-500">清除</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default SearchBar