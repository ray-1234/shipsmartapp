// hooks/usePWASetup.ts - 手動PWA設定
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const usePWASetup = () => {
  const [isManifestLoaded, setIsManifestLoaded] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const setupPWA = async () => {
      try {
        // 1. HTMLヘッダーにPWA用タグを追加
        addPWAMetaTags();
        
        // 2. Service Worker を登録
        await registerServiceWorker();
        
        // 3. インストールプロンプトの監視
        setupInstallPrompt();
        
        // 4. マニフェストの読み込み確認
        await checkManifestLoaded();
        
        console.log('✅ PWA setup completed');
      } catch (error) {
        console.error('❌ PWA setup failed:', error);
      }
    };

    setupPWA();
  }, []);

  const addPWAMetaTags = () => {
    const head = document.head;
    
    // マニフェストリンクタグ
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    manifestLink.onload = () => {
      console.log('✅ Manifest link added');
      setIsManifestLoaded(true);
    };
    manifestLink.onerror = () => {
      console.error('❌ Manifest link failed');
    };
    head.appendChild(manifestLink);

    // テーマカラー
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#1E88E5';
    head.appendChild(themeColorMeta);

    // Apple Mobile Web App
    const appleMobileCapable = document.createElement('meta');
    appleMobileCapable.name = 'apple-mobile-web-app-capable';
    appleMobileCapable.content = 'yes';
    head.appendChild(appleMobileCapable);

    const appleMobileTitle = document.createElement('meta');
    appleMobileTitle.name = 'apple-mobile-web-app-title';
    appleMobileTitle.content = 'ShipSmart';
    head.appendChild(appleMobileTitle);

    const appleMobileStatusBar = document.createElement('meta');
    appleMobileStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    appleMobileStatusBar.content = 'default';
    head.appendChild(appleMobileStatusBar);

    // Apple Touch Icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = '/icons/icon-152x152.png';
    head.appendChild(appleTouchIcon);

    // Viewport
    let viewport = head.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=no');
    }

    console.log('✅ PWA meta tags added');
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        throw error;
      }
    } else {
      console.log('⚠️ Service Worker not supported');
    }
  };

  const setupInstallPrompt = () => {
    // beforeinstallprompt イベントの監視
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('✅ Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    // インストール完了の監視
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed');
      setIsInstallable(false);
      setDeferredPrompt(null);
    });
  };

  const checkManifestLoaded = async () => {
    try {
      const response = await fetch('/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        console.log('✅ Manifest loaded:', manifest.name);
        setIsManifestLoaded(true);
        return true;
      } else {
        console.error('❌ Manifest not found');
        return false;
      }
    } catch (error) {
      console.error('❌ Manifest load error:', error);
      return false;
    }
  };

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('⚠️ Install prompt not available');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      console.log('Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    }
  };

  return {
    isManifestLoaded,
    isInstallable,
    promptInstall,
    // デバッグ情報
    debug: {
      deferredPrompt: !!deferredPrompt,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      platform: Platform.OS
    }
  };
};