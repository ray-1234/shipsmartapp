// utils/pwa.ts - Push通知エラー修正版
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

  // Service Worker の登録
  async registerServiceWorker(): Promise<boolean> {
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
        // 新しいバージョンが利用可能
        this.showUpdateAvailable();
      }
    });
  }

  // アップデート通知
  private showUpdateAvailable(): void {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('新しいバージョンが利用可能です。更新しますか？')) {
        this.updateApp();
      }
    }
  }

  // アプリ更新
  updateApp(): void {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // インストールプロンプトの設定
  setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt event received');
      // デフォルトの表示を防ぐ
      e.preventDefault();
      this.deferredPrompt = e;
      
      // カスタムインストールボタンを表示
      this.showInstallButton();
    });

    // インストール完了後
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.deferredPrompt = null;
      this.hideInstallButton();
    });
  }

  // インストールボタンの表示
  private showInstallButton(): void {
    const event = new CustomEvent('pwa-install-available');
    window.dispatchEvent(event);
    console.log('PWA: Install button should be visible now');
  }

  // インストールボタンの非表示
  private hideInstallButton(): void {
    const event = new CustomEvent('pwa-install-completed');
    window.dispatchEvent(event);
  }

  // アプリインストール実行
  async promptInstall(): Promise<boolean> {
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
    if (this.registration && 'sync' in this.registration) {
      try {
        await this.registration.sync.register('diagnosis-backup');
        console.log('PWA: Background sync registered');
      } catch (error) {
        console.error('PWA: Background sync registration failed:', error);
      }
    }
  }

  // プッシュ通知の設定（エラー修正版）
  async setupPushNotifications(): Promise<boolean> {
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

      // VAPIDキーは後で設定するため、今はスキップ
      console.log('PWA: Notification permission granted, VAPID setup skipped for now');
      return true;
      
      // TODO: VAPIDキー設定後に以下のコメントアウトを解除
      /*
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(
          'YOUR_VAPID_PUBLIC_KEY_HERE' // 実際のVAPIDキーに置き換え
        )
      });

      await this.sendSubscriptionToServer(subscription);
      console.log('PWA: Push notification setup completed');
      return true;
      */
    } catch (error) {
      console.error('PWA: Push notification setup failed:', error);
      return false;
    }
  }

  // VAPID key conversion helper（現在は使用しない）
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // サーバーに購読情報を送信（現在は使用しない）
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('PWA: Failed to send subscription to server:', error);
    }
  }

  // アプリの状態確認
  getAppStatus(): {
    isOnline: boolean;
    isInstalled: boolean;
    hasServiceWorker: boolean;
    hasNotificationPermission: boolean;
  } {
    return {
      isOnline: navigator.onLine,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      hasServiceWorker: !!this.registration,
      hasNotificationPermission: Notification.permission === 'granted'
    };
  }
}

// React Native コンポーネント用のhook
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [pwaManager] = useState(() => PWAManager.getInstance());
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA初期化
    const initPWA = async () => {
      console.log('PWA: Initializing...');
      
      await pwaManager.registerServiceWorker();
      pwaManager.setupInstallPrompt();
      pwaManager.setupOfflineDetection();
      
      // 初期状態の設定
      const status = pwaManager.getAppStatus();
      setIsInstalled(status.isInstalled);
      
      console.log('PWA: Initialization complete');
    };

    initPWA();

    // イベントリスナーの設定
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
  }, [pwaManager]);

  const promptInstall = async () => {
    const result = await pwaManager.promptInstall();
    if (result) {
      setIsInstallable(false);
      setIsInstalled(true);
    }
    return result;
  };

  const setupNotifications = () => {
    return pwaManager.setupPushNotifications();
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    setupNotifications,
    getAppStatus: pwaManager.getAppStatus.bind(pwaManager)
  };
};