// metro.config.js - 修正版
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// PWA用の設定追加
config.resolver.alias = {
  ...config.resolver.alias,
  // PWA関連のエイリアス
  '@/pwa': path.resolve(__dirname, 'utils/pwa.ts'),
  '@/sw': path.resolve(__dirname, 'public/sw.js'),
};

// Service Worker用のアセット処理
config.resolver.assetExts = [...config.resolver.assetExts, 'txt', 'xml'];

// Web用の追加設定
if (process.env.EXPO_TARGET === 'web') {
  config.resolver.alias = {
    ...config.resolver.alias,
    'react-native$': 'react-native-web',
  };
}

module.exports = config;