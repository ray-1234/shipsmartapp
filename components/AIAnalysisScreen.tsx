// components/AIAnalysisScreen.tsx
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
      
      setAnalysisResult(result);
      setHasRunAnalysis(true);
      setActiveTab('summary');
    } catch (error) {
      Alert.alert('エラー', 'AI分析に失敗しました。しばらく待ってから再試行してください。');
      console.error('AI分析エラー:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderTabButton = (tabId: ActiveTab, title: string, icon: string) => (
    <TouchableOpacity
      key={tabId}
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}
      disabled={!hasRunAnalysis}
    >
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );

  const renderSummaryView = () => (
    <View style={styles.analysisSection}>
      <Text style={styles.sectionTitle}>🤖 AI分析サマリー</Text>
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
    </View>
  );

  const renderProfitView = () => (
    <View style={styles.analysisSection}>
      <Text style={styles.sectionTitle}>💰 利益最大化分析</Text>
      
      <View style={styles.profitComparison}>
        <View style={styles.profitCard}>
          <Text style={styles.profitLabel}>現在の予想利益</Text>
          <Text style={styles.profitValue}>¥{analysisResult?.profitAnalysis.currentProfit}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
        <View style={[styles.profitCard, styles.optimizedCard]}>
          <Text style={styles.profitLabel}>最適化後利益</Text>
          <Text style={styles.optimizedValue}>¥{analysisResult?.profitAnalysis.optimizedProfit}</Text>
        </View>
      </View>

      <View style={styles.improvementSection}>
        <Text style={styles.subsectionTitle}>💡 改善提案</Text>
        {analysisResult?.profitAnalysis.improvements.map((improvement, index) => (
          <View key={index} style={styles.improvementItem}>
            <Text style={styles.improvementText}>• {improvement}</Text>
          </View>
        ))}
      </View>

      <View style={styles.recommendationSection}>
        <Text style={styles.subsectionTitle}>🎯 価格戦略</Text>
        <Text style={styles.recommendationText}>
          {analysisResult?.profitAnalysis.priceRecommendation}
        </Text>
      </View>
    </View>
  );

  const renderRiskView = () => (
    <View style={styles.analysisSection}>
      <Text style={styles.sectionTitle}>⚠️ 配送リスク分析</Text>
      
      <View style={styles.riskOverview}>
        <View style={styles.riskScoreCard}>
          <Text style={styles.riskScoreValue}>
            {analysisResult?.riskAssessment.overallRisk}/10
          </Text>
          <Text style={styles.riskScoreLabel}>総合リスクスコア</Text>
          <Text style={styles.riskLevel}>
            {(analysisResult?.riskAssessment.overallRisk || 0) <= 3 ? '低リスク' :
             (analysisResult?.riskAssessment.overallRisk || 0) <= 6 ? '中リスク' : '高リスク'}
          </Text>
        </View>
      </View>

      <View style={styles.riskDetails}>
        <View style={styles.riskItem}>
          <Text style={styles.riskItemTitle}>💥 破損リスク</Text>
          <Text style={styles.riskItemValue}>{analysisResult?.riskAssessment.damageRisk}/10</Text>
        </View>
        <View style={styles.riskItem}>
          <Text style={styles.riskItemTitle}>⏰ 遅延リスク</Text>
          <Text style={styles.riskItemValue}>{analysisResult?.riskAssessment.delayRisk}/10</Text>
        </View>
        <View style={styles.riskItem}>
          <Text style={styles.riskItemTitle}>🔍 紛失リスク</Text>
          <Text style={styles.riskItemValue}>{analysisResult?.riskAssessment.lossRisk}/10</Text>
        </View>
      </View>

      <View style={styles.preventionSection}>
        <Text style={styles.subsectionTitle}>🛡️ 予防策</Text>
        {analysisResult?.riskAssessment.preventionTips.map((tip, index) => (
          <View key={index} style={styles.preventionItem}>
            <Text style={styles.preventionText}>• {tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPackagingView = () => (
    <View style={styles.analysisSection}>
      <Text style={styles.sectionTitle}>📦 最適梱包提案</Text>
      
      <View style={styles.packagingSection}>
        <Text style={styles.subsectionTitle}>🎯 推奨梱包材</Text>
        {analysisResult?.packagingAdvice.recommendedMaterials.map((material, index) => (
          <View key={index} style={styles.packagingItem}>
            <Text style={styles.packagingText}>• {material}</Text>
          </View>
        ))}
      </View>

      <View style={styles.budgetSection}>
        <Text style={styles.subsectionTitle}>💰 梱包材コスト</Text>
        {analysisResult?.packagingAdvice.budgetBreakdown.map((item, index) => (
          <View key={index} style={styles.budgetItem}>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetMaterial}>{item.material}</Text>
              <Text style={styles.budgetDurability}>{item.durability}耐久性</Text>
            </View>
            <Text style={styles.budgetCost}>¥{item.cost}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.subsectionTitle}>💡 コスト削減のコツ</Text>
        {analysisResult?.packagingAdvice.costEffectiveSolutions.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipText}>• {tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMarketView = () => (
    <View style={styles.analysisSection}>
      <Text style={styles.sectionTitle}>📈 市場戦略分析</Text>
      
      <View style={styles.marketSection}>
        <Text style={styles.subsectionTitle}>🎯 競合優位性</Text>
        <Text style={styles.marketText}>
          {analysisResult?.marketInsights.competitiveAdvantage}
        </Text>
      </View>

      <View style={styles.marketSection}>
        <Text style={styles.subsectionTitle}>💰 価格戦略</Text>
        <Text style={styles.marketText}>
          {analysisResult?.marketInsights.pricingStrategy}
        </Text>
      </View>

      <View style={styles.marketSection}>
        <Text style={styles.subsectionTitle}>⏰ タイミング戦略</Text>
        <Text style={styles.marketText}>
          {analysisResult?.marketInsights.timingAdvice}
        </Text>
      </View>

      <View style={styles.marketSection}>
        <Text style={styles.subsectionTitle}>📊 購買行動分析</Text>
        <Text style={styles.marketText}>
          {analysisResult?.marketInsights.buyerBehavior}
        </Text>
      </View>

      <View style={styles.marketSection}>
        <Text style={styles.subsectionTitle}>🔮 需要予測</Text>
        <Text style={styles.marketText}>
          {analysisResult?.marketInsights.demandForecast}
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
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

          <View style={styles.analysisOptions}>
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

            <Text style={styles.orText}>または</Text>

            <View style={styles.specificAnalysisButtons}>
              <TouchableOpacity 
                style={styles.specificButton}
                onPress={() => handleRunAnalysis('profit')}
                disabled={isAnalyzing}
              >
                <Text style={styles.specificButtonText}>💰 利益分析</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.specificButton}
                onPress={() => handleRunAnalysis('risk')}
                disabled={isAnalyzing}
              >
                <Text style={styles.specificButtonText}>⚠️ リスク分析</Text>
              </TouchableOpacity>
            </View>
          </View>

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

    switch (activeTab) {
      case 'summary':
        return renderSummaryView();
      case 'profit':
        return renderProfitView();
      case 'risk':
        return renderRiskView();
      case 'packaging':
        return renderPackagingView();
      case 'market':
        return renderMarketView();
      default:
        return renderSummaryView();
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
          <Text style={styles.headerSubtitle}>フリマ利益最大化コンサルタント</Text>
        </View>
      </View>

      {/* タブナビゲーション */}
      {hasRunAnalysis && (
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
  analysisOptions: {
    width: '100%',
    marginBottom: 30,
  },
  primaryAnalysisButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  specificAnalysisButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specificButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  specificButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
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
  profitComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  optimizedCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  profitLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  optimizedValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  arrow: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  improvementSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  improvementItem: {
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  recommendationSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  riskOverview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  riskScoreCard: {
    alignItems: 'center',
  },
  riskScoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  riskScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  riskLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  riskDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  riskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  riskItemTitle: {
    fontSize: 14,
    color: '#333',
  },
  riskItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  preventionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  preventionItem: {
    marginBottom: 8,
  },
  preventionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  packagingSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  packagingItem: {
    marginBottom: 8,
  },
  packagingText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  budgetSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetMaterial: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  budgetDurability: {
    fontSize: 12,
    color: '#666',
  },
  budgetCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  tipsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  marketSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  marketText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
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