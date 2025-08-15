// components/AIAnalysisScreen.tsx - ローディング・ポーリング対応版
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { ProductInfo, ShippingOption } from '../types/shipping';
import { runAIAnalysis, AIAnalysisResult, AnalysisType } from '../utils/aiAnalysisService';

interface AIAnalysisScreenProps {
  productInfo: ProductInfo;
  shippingOptions: ShippingOption[];
  onClose: () => void;
}

type ActiveTab = 'summary' | 'profit' | 'risk' | 'packaging' | 'market';
type AnalysisState = 'idle' | 'analyzing' | 'completed' | 'error';

export default function AIAnalysisScreen({ 
  productInfo, 
  shippingOptions, 
  onClose 
}: AIAnalysisScreenProps) {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));

  // 分析開始時のローディングアニメーション
  const startLoadingAnimation = () => {
    animatedValue.setValue(0);
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  // 段階的なローディングメッセージ
  const updateProgressMessages = () => {
    const messages = [
      '🤖 AI分析を開始しています...',
      '📊 商品データを解析中...',
      '💰 利益最適化を計算中...',
      '⚠️ リスク要因を評価中...',
      '📦 最適な梱包方法を検討中...',
      '📈 市場動向を分析中...',
      '✨ 分析結果をまとめています...',
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < messages.length && analysisState === 'analyzing') {
        setStatusMessage(messages[currentIndex]);
        setProgress(((currentIndex + 1) / messages.length) * 100);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return interval;
  };

  const handleRunAnalysis = async (analysisType: AnalysisType = 'comprehensive') => {
    setAnalysisState('analyzing');
    setProgress(0);
    setStatusMessage('🤖 AI分析を開始しています...');
    startLoadingAnimation();

    // プログレスメッセージの更新開始
    const progressInterval = updateProgressMessages();

    try {
      const result = await runAIAnalysis({
        productInfo,
        shippingOptions,
        userPreferences: {
          prioritizeCost: true,
          riskTolerance: 'medium'
        }
      }, analysisType);
      
      // 分析完了時の処理
      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage('✅ 分析完了！');
      
      // 少し遅延してから結果を表示
      setTimeout(() => {
        setAnalysisResult(result);
        setAnalysisState('completed');
        setActiveTab('summary');
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      console.error('AI分析エラー:', error);
      setAnalysisState('error');
      setStatusMessage('❌ 分析に失敗しました');
      
      Alert.alert(
        'AI分析エラー', 
        '分析に失敗しました。ネットワーク接続を確認して再試行してください。',
        [
          { text: 'キャンセル', onPress: () => setAnalysisState('idle') },
          { text: '再試行', onPress: () => handleRunAnalysis(analysisType) }
        ]
      );
    }
  };

  const renderTabButton = (tabId: ActiveTab, title: string, icon: string) => (
    <TouchableOpacity
      key={tabId}
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}
      disabled={analysisState !== 'completed'}
    >
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );

  // ローディング画面
  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.loadingIcon,
          {
            transform: [
              {
                rotate: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.loadingEmoji}>🤖</Text>
      </Animated.View>

      <Text style={styles.loadingTitle}>AI分析中</Text>
      <Text style={styles.loadingMessage}>{statusMessage}</Text>

      {/* プログレスバー */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* 分析中のヒント */}
      <View style={styles.hintsContainer}>
        <Text style={styles.hintsTitle}>💡 分析中にできること</Text>
        <Text style={styles.hintText}>• 商品の写真を追加で撮影</Text>
        <Text style={styles.hintText}>• 配送先住所の再確認</Text>
        <Text style={styles.hintText}>• 梱包材の準備</Text>
      </View>

      {/* キャンセルボタン */}
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => {
          setAnalysisState('idle');
          onClose();
        }}
      >
        <Text style={styles.cancelButtonText}>キャンセル</Text>
      </TouchableOpacity>
    </View>
  );

  // エラー画面
  const renderErrorScreen = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>😞</Text>
      <Text style={styles.errorTitle}>分析に失敗しました</Text>
      <Text style={styles.errorMessage}>
        AI分析中にエラーが発生しました。{'\n'}
        ネットワーク接続を確認して再試行してください。
      </Text>
      
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => handleRunAnalysis('comprehensive')}
      >
        <Text style={styles.retryButtonText}>🔄 再試行</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onClose}
      >
        <Text style={styles.backButtonText}>戻る</Text>
      </TouchableOpacity>
    </View>
  );

  // サマリー表示（簡略版）
  const renderSummaryView = () => (
    <View style={styles.analysisSection}>
      <Text style={styles.sectionTitle}>🤖 AI分析結果</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{analysisResult?.summary}</Text>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceText}>
            分析信頼度: {Math.round((analysisResult?.confidence || 0) * 100)}%
          </Text>
        </View>
      </View>

      {/* クイック指標 */}
      <View style={styles.quickMetrics}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            ¥{analysisResult?.profitAnalysis.costSavings || 0}
          </Text>
          <Text style={styles.metricLabel}>節約可能額</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {analysisResult?.riskAssessment.overallRisk || 0}/10
          </Text>
          <Text style={styles.metricLabel}>リスクスコア</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {analysisResult?.packagingAdvice.budgetBreakdown.length || 0}
          </Text>
          <Text style={styles.metricLabel}>梱包提案</Text>
        </View>
      </View>

      {/* 主要なアドバイス */}
      <View style={styles.keyAdviceSection}>
        <Text style={styles.keyAdviceTitle}>🎯 主要なアドバイス</Text>
        {analysisResult?.profitAnalysis.improvements.slice(0, 3).map((improvement, index) => (
          <View key={index} style={styles.adviceItem}>
            <Text style={styles.adviceText}>• {improvement}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (analysisState) {
      case 'analyzing':
        return renderLoadingScreen();
      case 'error':
        return renderErrorScreen();
      case 'completed':
        return renderSummaryView();
      default:
        return (
          <View style={styles.startContainer}>
            <View style={styles.productSummary}>
              <Text style={styles.productTitle}>📊 分析対象</Text>
              <Text style={styles.productDetails}>
                {productInfo.category} | {productInfo.length}×{productInfo.width}×{productInfo.thickness}cm | {productInfo.weight}g
              </Text>
              <Text style={styles.productDestination}>
                配送先: {productInfo.destination}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.primaryAnalysisButton}
              onPress={() => handleRunAnalysis('comprehensive')}
            >
              <Text style={styles.primaryButtonText}>🧠 AI総合分析開始</Text>
              <Text style={styles.primaryButtonSubtext}>利益・リスク・梱包・市場を一括分析</Text>
            </TouchableOpacity>

            <View style={styles.featureHighlights}>
              <Text style={styles.highlightsTitle}>🎯 AI分析でわかること</Text>
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>💰 隠れた利益改善ポイント</Text>
              </View>
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>⚠️ 配送リスクと予防策</Text>
              </View>
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>📦 最適な梱包材と節約術</Text>
              </View>
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>📈 売れる価格設定戦略</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🤖 AI配送分析</Text>
          <Text style={styles.headerSubtitle}>
            {analysisState === 'analyzing' ? 'AI分析中...' : 'フリマ利益最大化コンサルタント'}
          </Text>
        </View>
      </View>

      {/* タブナビゲーション（完了時のみ表示） */}
      {analysisState === 'completed' && (
        <ScrollView 
          horizontal 
          style={styles.tabContainer}
          showsHorizontalScrollIndicator={false}
        >
          {renderTabButton('summary', 'サマリー', '📊')}
          {renderTabButton('profit', '利益', '💰')}
          {renderTabButton('risk', 'リスク', '⚠️')}
          {renderTabButton('packaging', '梱包', '📦')}
          {renderTabButton('market', '市場', '📈')}
        </ScrollView>
      )}

      {/* メインコンテンツ */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    marginRight: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  activeTabButton: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // ローディング関連のスタイル
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  hintsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  hintsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // エラー関連のスタイル
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  backButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  // 初期画面のスタイル
  startContainer: {
    alignItems: 'center',
  },
  productSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  productDestination: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  primaryAnalysisButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  primaryButtonSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  featureHighlights: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#555',
  },
  // 分析結果のスタイル（簡略版）
  analysisSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  quickMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  keyAdviceSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  keyAdviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  adviceItem: {
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});