// webpack.config.js - Expo Web用PWA設定
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    // PWA機能を有効化
    pwa: true,
    // Service Workerを有効化
    offline: true
  }, argv);

  // PWA用のWebpack設定をカスタマイズ
  if (env.mode === 'production') {
    // Service Workerの設定
    config.plugins = config.plugins || [];
    
    // PWA Manifest Pluginの設定を追加
    const { WebpackPwaManifest } = require('webpack-pwa-manifest');
    
    config.plugins.push(
      new WebpackPwaManifest({
        filename: 'manifest.json',
        name: 'ShipSmart - フリマ発送診断アプリ',
        short_name: 'ShipSmart',
        description: 'フリマ出品者向けの最安・最適な発送方法診断アプリ',
        background_color: '#1E88E5',
        theme_color: '#1E88E5',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'ja',
        icons: [
          {
            src: 'assets/icon.png',
            sizes: [72, 96, 128, 144, 152, 192, 384, 512],
            destination: 'icons',
            ios: true
          }
        ],
        ios: {
          'apple-mobile-web-app-capable': 'yes',
          'apple-mobile-web-app-status-bar-style': 'default',
          'apple-mobile-web-app-title': 'ShipSmart'
        }
      })
    );
  }

  return config;
};

// ================================================

// app.json - PWA設定を追加
{
  "expo": {
    "name": "ShipSmart",
    "slug": "shipsmart",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E88E5"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.shipsmart"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E88E5"
      },
      "package": "com.yourcompany.shipsmart"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      // PWA設定
      "lang": "ja",
      "scope": "/",
      "themeColor": "#1E88E5",
      "backgroundColor": "#1E88E5",
      "orientation": "portrait-primary",
      "display": "standalone",
      "startUrl": "/",
      "shortName": "ShipSmart",
      "description": "フリマ出品者向けの最安・最適な発送方法診断アプリ",
      // PWAマニフェストの設定
      "manifest": {
        "name": "ShipSmart - フリマ発送診断アプリ",
        "short_name": "ShipSmart",
        "description": "フリマ出品者向けの最安・最適な発送方法診断アプリ",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#1E88E5",
        "theme_color": "#1E88E5",
        "orientation": "portrait-primary",
        "scope": "/",
        "lang": "ja",
        "categories": ["productivity", "utilities", "business"],
        "shortcuts": [
          {
            "name": "発送診断",
            "url": "/",
            "description": "商品の発送方法を診断する"
          }
        ]
      },
      // Service Worker設定
      "serviceWorker": {
        "src": "/sw.js"
      }
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ]
  }
}

// ================================================

// metro.config.js - 既存ファイルの更新版
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