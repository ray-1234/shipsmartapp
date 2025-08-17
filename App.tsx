// App.tsx - デバッグ強化版
import React, { useState, useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import EnhancedInputScreen from './components/EnhancedInputScreen';
import ResultScreen from './components/ResultScreen';
import AIAnalysisScreen from './components/AIAnalysisScreen';
import { calculateRealShipping } from './utils/realCalculator';
import { ProductInfo, ShippingResult } from './types/shipping';

// PWA機能のインポート
import { usePWA } from './utils/pwa';

type Screen = 'input' | 'result' | 'ai-analysis';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('input');
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  // PWA機能のフック
  const { isInstallable, isInstalled, promptInstall, setupNotifications } = usePWA();
  
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    category: '衣類',
    length: '25',
    width: '18',
    thickness: '2.8',
    weight: '450',
    destination: '大阪府',
  });

  // PWA初期化（Web環境のみ）
  useEffect(() => {
    if (Platform.OS === 'web') {
      initializePWA();
    }
  }, []);

  const initializePWA = async () => {
    console.log('PWA初期化開始');
    
    // HTMLヘッダーの設定
    setupHTMLHeaders();
    
    // Manifestの確認
    await checkManifest();
    
    // プッシュ通知の設定（エラー修正済み）
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await setupNotifications();
          console.log('プッシュ通知設定完了');
        }
      }
    } catch (error) {
      console.log('プッシュ通知設定をスキップ:', error);
    }

    // Service Worker更新の監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker更新検出');
      });
    }
  };

  const setupHTMLHeaders = () => {
    const head = document.head;
    
    // 既存のmanifest linkを削除（重複回避）
    const existingManifest = head.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }
    
    // PWA Manifest
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    manifestLink.onload = () => console.log('✅ Manifest link loaded');
    manifestLink.onerror = () => console.error('❌ Manifest link failed');
    head.appendChild(manifestLink);
    
    // Theme Color
    let themeColorMeta = head.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', '#1E88E5');
    
    console.log('✅ HTML headers setup complete');
  };

  const checkManifest = async () => {
    try {
      console.log('🔍 Checking manifest.json...');
      const response = await fetch('/manifest.json');
      
      if (response.ok) {
        const manifest = await response.json();
        console.log('✅ Manifest loaded successfully:', manifest);
        console.log('Manifest details:', {
          name: manifest.name,
          shortName: manifest.short_name,
          startUrl: manifest.start_url,
          display: manifest.display,
          icons: manifest.icons?.length || 0
        });
      } else {
        console.error('❌ Manifest response error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Manifest fetch error:', error);
    }
  };

  // デバッグ情報の表示
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('🔍 PWA Debug Info:', {
        isInstallable,
        isInstalled,
        userAgent: navigator.userAgent,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        serviceWorkerSupported: 'serviceWorker' in navigator
      });
    }
  }, [isInstallable, isInstalled]);

  const handleDiagnosis = () => {
    console.log('診断開始:', productInfo);
    
    const result = calculateRealShipping(productInfo);
    setShippingResult(result);
    setCurrentScreen('result');
  };

  const handleBackToInput = () => {
    setCurrentScreen('input');
    setShowAIAnalysis(false);
  };

  const handleProductInfoChange = (newProductInfo: ProductInfo) => {
    setProductInfo(newProductInfo);
  };

  const handleShowAIAnalysis = () => {
    setShowAIAnalysis(true);
    setCurrentScreen('ai-analysis');
  };

  const handleCloseAI = () => {
    setShowAIAnalysis(false);
    setCurrentScreen('result');
  };

  const handleInstallApp = async () => {
    console.log('🔄 Install app triggered');
    if (Platform.OS === 'web' && isInstallable) {
      const success = await promptInstall();
      if (success) {
        console.log('✅ PWAインストール成功');
      } else {
        console.log('❌ PWAインストール失敗またはキャンセル');
      }
    } else {
      console.log('⚠️ Install not available:', { platform: Platform.OS, installable: isInstallable });
    }
  };

  // AI分析画面
  if (showAIAnalysis && shippingResult) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
        <AIAnalysisScreen
          productInfo={productInfo}
          shippingOptions={shippingResult.options}
          onClose={handleCloseAI}
        />
      </>
    );
  }

  // 診断結果画面
  if (currentScreen === 'result' && shippingResult) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
        <ResultScreen 
          result={shippingResult} 
          onBackToInput={handleBackToInput}
          productInfo={productInfo}
          onShowAIAnalysis={handleShowAIAnalysis}
          pwaFeatures={{
            isInstallable,
            isInstalled,
            onInstall: handleInstallApp
          }}
        />
      </>
    );
  }

  // メイン入力画面
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
      <EnhancedInputScreen
        productInfo={productInfo}
        onProductInfoChange={handleProductInfoChange}
        onDiagnosis={handleDiagnosis}
        pwaFeatures={{
          isInstallable,
          isInstalled,
          onInstall: handleInstallApp
        }}
      />
    </>
  );
}