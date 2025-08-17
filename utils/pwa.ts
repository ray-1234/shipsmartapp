// utils/pwa.ts - 文字化け修正版
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

  private isWebEnvironment(): boolean {
    return Platform.OS === 'web' && typeof window !== 'undefined';
  }

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
      return true;
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
      return false;
    }
  }

  setupInstallPrompt(): void {
    if (!this.isWebEnvironment()) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt event received');
      e.preventDefault();
      this.deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.deferredPrompt = null;
    });
  }

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

  setupOfflineDetection(): void {
    if (!this.isWebEnvironment()) return;

    window.addEventListener('online', () => {
      console.log('PWA: Back online');
    });

    window.addEventListener('offline', () => {
      console.log('PWA: Gone offline');
    });
  }

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

      console.log('PWA: Notification permission granted');
      return true;
      
    } catch (error) {
      console.error('PWA: Push notification setup failed:', error);
      return false;
    }
  }

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

import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [pwaManager] = useState(() => PWAManager.getInstance());
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
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