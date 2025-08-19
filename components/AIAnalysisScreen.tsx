// components/AIAnalysisScreen.tsx - 最終版
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

const renderProfitAnalysis = () => (
  <ScrollView style={styles.tabContent}>
    {/* 販売価格・手数料の内訳表示 */}
    <View style={styles.breakdownCard}>
      <Text style={styles.cardTitle}>💰 収益内訳</Text>
      
      <View style={styles.breakdownRow}>
        <Text style={styles.breakdownLabel}>販売価格</Text>
        <Text style={styles.breakdownValue}>¥{analysisResult.profitAnalysis.breakdown.salePrice.toLocaleString()}</Text>
      </View>
      
      <View style={styles.breakdownRow}>
        <Text style={styles.breakdownLabel}>{analysisResult.profitAnalysis.breakdown.platformName}手数料 (10%)</Text>
        <Text style={[styles.breakdownValue, styles.feeText]}>-¥{analysisResult.profitAnalysis.breakdown.platformFee.toLocaleString()}</Text>
      </View>
      
      <View style={styles.divider} />
      <View style={styles.breakdownRow}>
        <Text style={styles.breakdownLabelBold}>手数料差引後</Text>
        <Text style={styles.breakdownValueBold}>
          ¥{(analysisResult.profitAnalysis.breakdown.salePrice - analysisResult.profitAnalysis.breakdown.platformFee).toLocaleString()}
        </Text>
      </View>
    </View>

    {/* 配送方法別利益比較表 */}
    <View style={styles.comparisonCard}>
      <Text style={styles.cardTitle}>🚚 配送方法別利益比較</Text>
      
      {analysisResult.profitAnalysis.breakdown.profitByShipping.map((shipping, index) => (
        <View key={shipping.shippingName} style={[
          styles.shippingRow,
          index === 0 && styles.bestOption  // 最初（最安）をハイライト
        ]}>
          <View style={styles.shippingInfo}>
            <Text style={styles.shippingName}>
              {index === 0 && '🏆 '}
              {shipping.shippingName}
            </Text>
            <Text style={styles.deliveryTime}>{shipping.deliveryDays}</Text>
          </View>
          
          <View style={styles.shippingCosts}>
            <Text style={styles.shippingCost}>送料: ¥{shipping.shippingCost.toLocaleString()}</Text>
            <Text style={[
              styles.profit,
              shipping.profit > 0 ? styles.profitPositive : styles.profitNegative
            ]}>
              利益: ¥{shipping.profit.toLocaleString()}
            </Text>
            <Text style={styles.profitRate}>
              利益率: {shipping.profitRate}%
            </Text>
          </View>
        </View>
      ))}
    </View>

    {/* 最適化提案 */}
    <View style={styles.optimizationCard}>
      <Text style={styles.cardTitle}>💡 利益最適化提案</Text>
      
      {analysisResult.profitAnalysis.costSavings > 0 && (
        <View style={styles.savingsHighlight}>
          <Text style={styles.savingsText}>
            最安配送選択で¥{analysisResult.profitAnalysis.costSavings}節約可能
          </Text>
        </View>
      )}
      
      {analysisResult.profitAnalysis.improvements.map((improvement, index) => (
        <View key={index} style={styles.improvementItem}>
          <Text style={styles.improvementBullet}>•</Text>
          <Text style={styles.improvementText}>{improvement}</Text>
        </View>
      ))}
      
      <View style={styles.recommendationBox}>
        <Text style={styles.recommendationText}>
          {analysisResult.profitAnalysis.priceRecommendation}
        </Text>
      </View>
    </View>
  </ScrollView>
);

  const renderTabButton = (tabId: ActiveTab, title: string, icon: string) => (
    <TouchableOpacity
      key={tabId}
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => {
        console.log(`🔥 タブクリック: ${tabId} (現在: ${activeTab})`);
        console.log(`🔥 hasRunAnalysis: ${hasRunAnalysis}`);
        console.log(`🔥 analysisResult存在: ${!!analysisResult}`);
        setActiveTab(tabId);
        console.log(`🔥 タブ変更完了: ${tabId}`);
      }}
      disabled={!hasRunAnalysis}
    >
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );

  // 分析開始前の画面
  const renderStartScreen = () => (
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

      <View style={styles.featureHighlights}>
        <Text style={styles.highlightsTitle}>🎯 AI分析でわかること</Text>
        <Text style={styles.highlightText}>💰 隠れた利益改善ポイント</Text>
        <Text style={styles.highlightText}>⚠️ 配送リスクと予防策</Text>
        <Text style={styles.highlightText}>📦 最適な梱包材と節約術</Text>
        <Text style={styles.highlightText}>📈 売れる価格設定戦略</Text>
      </View>
    </View>
  );

  // タブ別コンテンツ表示
  const renderTabContent = () => {
    console.log(`🎯 renderTabContent呼び出し: activeTab=${activeTab}, analysisResult存在=${!!analysisResult}`);
    
    if (!analysisResult) {
      console.log(`❌ analysisResult がnull`);
      return (
        <View style={{padding: 20, backgroundColor: 'red'}}>
          <Text style={{color: 'white', fontSize: 16}}>analysisResult が存在しません</Text>
        </View>
      );
    }

    console.log(`✅ タブコンテンツ描画: ${activeTab}`);

    switch (activeTab) {
      case 'summary':
        console.log(`📊 サマリータブ描画開始`);
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>🤖 AI分析サマリー</Text>
            
            <View style={styles.contentCard}>
              <Text style={styles.summaryText}>{analysisResult.summary}</Text>
              <Text style={styles.confidenceText}>
                分析信頼度: {Math.round(analysisResult.confidence * 100)}%
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>¥{analysisResult.profitAnalysis.costSavings}</Text>
                <Text style={styles.metricLabel}>節約可能額</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{analysisResult.riskAssessment.overallRisk}/10</Text>
                <Text style={styles.metricLabel}>リスクスコア</Text>
              </View>
            </View>
          </View>
        );

      case 'profit':
        console.log(`💰 利益タブ描画開始`);
        return renderProfitAnalysis(); // ここを変更

      case 'risk':
        console.log(`⚠️ リスクタブ描画開始`);
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>⚠️ 配送リスク分析</Text>
            
            <View style={styles.riskOverview}>
              <Text style={styles.riskScoreValue}>{analysisResult.riskAssessment.overallRisk}/10</Text>
              <Text style={styles.riskScoreLabel}>総合リスクスコア</Text>
              <Text style={styles.riskLevel}>
                {analysisResult.riskAssessment.overallRisk <= 3 ? '低リスク' :
                 analysisResult.riskAssessment.overallRisk <= 6 ? '中リスク' : '高リスク'}
              </Text>
            </View>

            <View style={styles.riskDetails}>
              <View style={styles.riskItem}>
                <Text style={styles.riskItemTitle}>💥 破損リスク</Text>
                <Text style={styles.riskItemValue}>{analysisResult.riskAssessment.damageRisk}/10</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskItemTitle}>⏰ 遅延リスク</Text>
                <Text style={styles.riskItemValue}>{analysisResult.riskAssessment.delayRisk}/10</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskItemTitle}>🔍 紛失リスク</Text>
                <Text style={styles.riskItemValue}>{analysisResult.riskAssessment.lossRisk}/10</Text>
              </View>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>🛡️ 予防策</Text>
              {analysisResult.riskAssessment.preventionTips.map((tip, index) => (
                <Text key={index} style={styles.listItem}>• {tip}</Text>
              ))}
            </View>
          </View>
        );

      case 'packaging':
        console.log(`📦 梱包タブ描画開始`);
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>📦 最適梱包提案</Text>
            
            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>🎯 推奨梱包材</Text>
              {analysisResult.packagingAdvice.recommendedMaterials.map((material, index) => (
                <Text key={index} style={styles.listItem}>• {material}</Text>
              ))}
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>💰 梱包材コスト</Text>
              {analysisResult.packagingAdvice.budgetBreakdown.map((item, index) => (
                <View key={index} style={styles.budgetItem}>
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetMaterial}>{item.material}</Text>
                    <Text style={styles.budgetDurability}>{item.durability}耐久性</Text>
                  </View>
                  <Text style={styles.budgetCost}>¥{item.cost}</Text>
                </View>
              ))}
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>💡 コスト削減のコツ</Text>
              {analysisResult.packagingAdvice.costEffectiveSolutions.map((tip, index) => (
                <Text key={index} style={styles.listItem}>• {tip}</Text>
              ))}
            </View>
          </View>
        );

      case 'market':
        console.log(`📈 市場タブ描画開始`);
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>📈 市場戦略分析</Text>
            
            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>🎯 競合優位性</Text>
              <Text style={styles.contentText}>{analysisResult.marketInsights.competitiveAdvantage}</Text>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>💰 価格戦略</Text>
              <Text style={styles.contentText}>{analysisResult.marketInsights.pricingStrategy}</Text>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>⏰ タイミング戦略</Text>
              <Text style={styles.contentText}>{analysisResult.marketInsights.timingAdvice}</Text>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>📊 購買行動分析</Text>
              <Text style={styles.contentText}>{analysisResult.marketInsights.buyerBehavior}</Text>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardTitle}>🔮 需要予測</Text>
              <Text style={styles.contentText}>{analysisResult.marketInsights.demandForecast}</Text>
            </View>
          </View>
        );

      default:
        console.log(`❓ 未知のタブ: ${activeTab}`);
        return null;
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
            {isAnalyzing ? '分析中...' : hasRunAnalysis ? '分析完了' : '分析待機中'}
          </Text>
        </View>
      </View>

      {/* タブナビゲーション - 分析完了後のみ表示 */}
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
        {hasRunAnalysis ? renderTabContent() : renderStartScreen()}
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
// AIAnalysisScreen.tsxの最後のStyleSheet定義に追加
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
    maxHeight: 60,
    minHeight: 50,
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
    backgroundColor: '#f5f7fa',
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
  highlightText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  contentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    textAlign: 'right',
  },
  contentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  metricsRow: {
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
  arrow: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  riskOverview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  // === ここから不足していたスタイル ===
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  breakdownCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  feeText: {
    color: '#dc3545',
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: 8,
  },
  breakdownLabelBold: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
    flex: 1,
  },
  breakdownValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#28a745',
    textAlign: 'right',
  },
  comparisonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  bestOption: {
    backgroundColor: '#e7f3ff',
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  shippingInfo: {
    flex: 1,
  },
  shippingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
  },
  shippingCosts: {
    alignItems: 'flex-end',
  },
  shippingCost: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  profit: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  profitPositive: {
    color: '#28a745',
  },
  profitNegative: {
    color: '#dc3545',
  },
  profitRate: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  optimizationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  savingsHighlight: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
    textAlign: 'center',
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  improvementBullet: {
    fontSize: 14,
    color: '#8B5CF6',
    marginRight: 8,
    fontWeight: '600',
  },
  improvementText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  recommendationBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
    textAlign: 'center',
  },
});