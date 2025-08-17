// utils/pwa.ts - React Native環境対応修正版
import { Platform } from 'react-native';

export class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  // Web環境チェック
  private isWebEnvironment(): boolean {
    return Platform.OS === 'web' && typeof window !== 'undefined';
  }

  // PWA初期化メソッド
  static init(): void {
    const instance = PWAManager.getInstance();
    
    if (!instance.isWebEnvironment()) {
      console.log('PWA: Not in web environment, skipping initialization');
      return;
    }

    console.log('PWA: Initializing...');
    instance.initializeForWeb();
  }

  private async initializeForWeb(): Promise<void> {
    if (!this.isWebEnvironment()) return;

    try {
      await this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupOfflineDetection();
      console.log('PWA: Initialization complete');
    } catch (error) {
      console.error('PWA: Initialization failed:', error);
    }
  }

  // Service Worker の登録
  async registerServiceWorker(): Promise<boolean> {
    if (!this.isWebEnvironment()) {
      console.log('PWA: Service Worker not available in this environment');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('PWA: Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('PWA: Service Worker registered successfully');

      // 更新チェック
      this.registration.addEventListener('updatefound', () => {
        this.handleServiceWorkerUpdate();
      });

      return true;
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
      return false;
    }
  }

  // Service Worker 更新処理
  private handleServiceWorkerUpdate(): void {
    if (!this.registration || !this.registration.installing) return;

    const newWorker = this.registration.installing;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.showUpdateAvailable();
      }
    });
  }

  // アップデート通知
  private showUpdateAvailable(): void {
    if (this.isWebEnvironment() && window.confirm) {
      if (window.confirm('新しいバージョンが利用可能です。更新しますか？')) {
        this.updateApp();
      }
    }
  }

  // アプリ更新
  updateApp(): void {
    if (!this.isWebEnvironment()) return;

    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // インストールプロンプトの設定
  setupInstallPrompt(): void {
    if (!this.isWebEnvironment()) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt event received');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.deferredPrompt = null;
      this.hideInstallButton();
    });
  }

  // インストールボタンの表示
  private showInstallButton(): void {
    if (!this.isWebEnvironment()) return;

    const event = new CustomEvent('pwa-install-available');
    window.dispatchEvent(event);
    console.log('PWA: Install button should be visible now');
  }

  // インストールボタンの非表示
  private hideInstallButton(): void {
    if (!this.isWebEnvironment()) return;

    const event = new CustomEvent('pwa-install-completed');
    window.dispatchEvent(event);
  }

  // アプリインストール実行
  async promptInstall(): Promise<boolean> {
    if (!this.isWebEnvironment()) {
      console.log('PWA: Install not available in this environment');
      return false;
    }

    if (!this.deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      
      console.log('PWA: Install prompt result:', result.outcome);
      
      this.deferredPrompt = null;
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install prompt failed:', error);
      return false;
    }
  }

  // オフライン状態の監視
  setupOfflineDetection(): void {
    if (!this.isWebEnvironment()) return;

    window.addEventListener('online', () => {
      console.log('PWA: Back online');
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      console.log('PWA: Gone offline');
    });
  }

  // オンライン復帰時の同期
  private async syncWhenOnline(): Promise<void> {
    if (!this.isWebEnvironment()) return;

    if (this.registration && 'sync' in this.registration) {
      try {
        await this.registration.sync.register('diagnosis-backup');
        console.log('PWA: Background sync registered');
      } catch (error) {
        console.error('PWA: Background sync registration failed:', error);
      }
    }
  }

  // プッシュ通知の設定（React Native環境対応）
  async setupPushNotifications(): Promise<boolean> {
    if (!this.isWebEnvironment()) {
      console.log('PWA: Push notifications not available in this environment');
      return false;
    }

    console.log('PWA: Setting up push notifications...');
    
    if (!this.registration || !('PushManager' in window)) {
      console.log('PWA: Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('PWA: Notification permission denied');
        return false;
      }

      console.log('PWA: Notification permission granted, VAPID setup skipped for now');
      return true;
      
    } catch (error) {
      console.error('PWA: Push notification setup failed:', error);
      return false;
    }
  }

  // アプリの状態確認（React Native環境対応）
  getAppStatus(): {
    isOnline: boolean;
    isInstalled: boolean;
    hasServiceWorker: boolean;
    hasNotificationPermission: boolean;
  } {
    if (!this.isWebEnvironment()) {
      return {
        isOnline: false,
        isInstalled: false,
        hasServiceWorker: false,
        hasNotificationPermission: false
      };
    }

    return {
      isOnline: navigator.onLine,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      hasServiceWorker: !!this.registration,
      hasNotificationPermission: typeof Notification !== 'undefined' && Notification.permission === 'granted'
    };
  }
}

// React Hook（Web環境でのみ動作）
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [pwaManager] = useState(() => PWAManager.getInstance());
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Web環境でのみPWA初期化
    if (Platform.OS !== 'web') {
      console.log('PWA: usePWA hook disabled in native environment');
      return;
    }

    const initPWA = async () => {
      console.log('PWA: Hook initializing...');
      
      await pwaManager.registerServiceWorker();
      pwaManager.setupInstallPrompt();
      pwaManager.setupOfflineDetection();
      
      const status = pwaManager.getAppStatus();
      setIsInstalled(status.isInstalled);
      
      console.log('PWA: Hook initialization complete');
    };

    initPWA();

    // Web環境でのみイベントリスナー設定
    if (typeof window !== 'undefined') {
      const handleInstallAvailable = () => {
        console.log('PWA: Install available event received');
        setIsInstallable(true);
      };
      
      const handleInstallCompleted = () => {
        console.log('PWA: Install completed event received');
        setIsInstallable(false);
        setIsInstalled(true);
      };

      window.addEventListener('pwa-install-available', handleInstallAvailable);
      window.addEventListener('pwa-install-completed', handleInstallCompleted);

      return () => {
        window.removeEventListener('pwa-install-available', handleInstallAvailable);
        window.removeEventListener('pwa-install-completed', handleInstallCompleted);
      };
    }
  }, [pwaManager]);

  const promptInstall = async () => {
    if (Platform.OS !== 'web') {
      console.log('PWA: Install not available in native environment');
      return false;
    }

    const result = await pwaManager.promptInstall();
    if (result) {
      setIsInstallable(false);
      setIsInstalled(true);
    }
    return result;
  };

  const setupNotifications = () => {
    if (Platform.OS !== 'web') {
      console.log('PWA: Notifications not available in native environment');
      return Promise.resolve(false);
    }
    return pwaManager.setupPushNotifications();
  };

  return {
    isInstallable: Platform.OS === 'web' ? isInstallable : false,
    isInstalled: Platform.OS === 'web' ? isInstalled : false,
    promptInstall,
    setupNotifications,
    getAppStatus: pwaManager.getAppStatus.bind(pwaManager)
  };
};