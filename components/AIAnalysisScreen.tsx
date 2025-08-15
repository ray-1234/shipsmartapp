// components/AIAnalysisScreen.tsx - デバッグ版
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ProductInfo, ShippingOption } from '../types/shipping';
import { runAIAnalysis, AIAnalysisResult, AnalysisType } from '../utils/aiAnalysisService';

interface AIAnalysisScreenProps {
  productInfo: ProductInfo;
  shippingOptions: ShippingOption[];
  onClose: () => void;
}

type ActiveTab = 'summary' | 'profit' | 'risk' | 'packaging' | 'market';

export default function AIAnalysisScreen({ 
  productInfo, 
  shippingOptions, 
  onClose 
}: AIAnalysisScreenProps) {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);

  const handleRunAnalysis = async (analysisType: AnalysisType = 'comprehensive') => {
    console.log('🎯 AI分析開始:', analysisType);
    setIsAnalyzing(true);
    
    try {
      const result = await runAIAnalysis({
        productInfo,
        shippingOptions,
        userPreferences: {
          prioritizeCost: true,
          riskTolerance: 'medium'
        }
      }, analysisType);
      
      console.log('✅ 分析結果受信:', result);
      setAnalysisResult(result);
      setHasRunAnalysis(true);
      setActiveTab('summary');
      
    } catch (error) {
      console.error('❌ 分析エラー:', error);
      Alert.alert('エラー', `AI分析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderTabButton = (tabId: ActiveTab, title: string, icon: string) => {
    console.log(`🔍 タブボタン ${tabId}: hasRunAnalysis=${hasRunAnalysis}, activeTab=${activeTab}`);
    
    return (
      <TouchableOpacity
        key={tabId}
        style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
        onPress={() => {
          console.log(`📱 タブクリック: ${tabId}`);
          setActiveTab(tabId);
        }}
        disabled={!hasRunAnalysis}
      >
        <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>
          {icon} {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSummaryView = () => {
    console.log('📊 サマリー表示:', analysisResult?.summary);
    
    // まず最小構成でテスト
    try {
      return (
        <View style={styles.testContainer}>
          <Text style={styles.testText}>🤖 AI分析結果</Text>
          <Text style={styles.testText}>サマリー: {analysisResult?.summary}</Text>
          <Text style={styles.testText}>信頼度: {Math.round((analysisResult?.confidence || 0) * 100)}%</Text>
          <Text style={styles.testText}>節約額: ¥{analysisResult?.profitAnalysis?.costSavings}</Text>
          <Text style={styles.testText}>リスク: {analysisResult?.riskAssessment?.overallRisk}/10</Text>
        </View>
      );
    } catch (error) {
      console.error('❌ サマリー描画エラー:', error);
      return (
        <View style={styles.testContainer}>
          <Text style={styles.testText}>描画エラーが発生しました</Text>
        </View>
      );
    }
  };

  const renderContent = () => {
    console.log('🖼️ コンテンツレンダリング:', { hasRunAnalysis, activeTab, analysisResult: !!analysisResult });
    
    if (!hasRunAnalysis) {
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
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>🧠 AI総合分析開始</Text>
                <Text style={styles.primaryButtonSubtext}>利益・リスク・梱包・市場を一括分析</Text>
              </>
            )}
          </TouchableOpacity>

          {/* デバッグ情報 */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              分析状態: {isAnalyzing ? '実行中' : '待機中'}
            </Text>
            <Text style={styles.debugText}>
              結果: {hasRunAnalysis ? 'あり' : 'なし'}
            </Text>
          </View>
        </View>
      );
    }

    // 分析結果がある場合
    return renderSummaryView();
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
          <Text style={styles.headerSubtitle}>フリマ利益最大化コンサルタント</Text>
        </View>
      </View>

      {/* タブナビゲーション - 常に表示（デバッグのため） */}
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

      {/* デバッグ状態表示 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          状態: {hasRunAnalysis ? '分析完了' : '未実行'} | 
          タブ: {activeTab} | 
          データ: {analysisResult ? 'あり' : 'なし'}
        </Text>
      </View>

      {/* メインコンテンツ */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* 再分析ボタン */}
      {hasRunAnalysis && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.reAnalysisButton}
            onPress={() => handleRunAnalysis('comprehensive')}
            disabled={isAnalyzing}
          >
            <Text style={styles.reAnalysisButtonText}>
              {isAnalyzing ? '分析中...' : '🔄 再分析'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  statusBar: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  statusText: {
    fontSize: 10,
    color: '#1976d2',
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
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
    marginBottom: 16,
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
  debugInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
  testContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  testText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 8,
    fontWeight: '500',
  },
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
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  reAnalysisButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reAnalysisButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});