// components/SimpleAIAnalysisScreen.tsx - 簡易テスト版
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

export default function SimpleAIAnalysisScreen({ 
  productInfo, 
  shippingOptions, 
  onClose 
}: AIAnalysisScreenProps) {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rawData, setRawData] = useState<string>('');

  const handleRunAnalysis = async () => {
    console.log('🎯 簡易AI分析開始');
    setIsAnalyzing(true);
    
    try {
      const result = await runAIAnalysis({
        productInfo,
        shippingOptions,
        userPreferences: {
          prioritizeCost: true,
          riskTolerance: 'medium'
        }
      }, 'comprehensive');
      
      console.log('✅ 分析結果:', result);
      setAnalysisResult(result);
      setRawData(JSON.stringify(result, null, 2));
      
    } catch (error) {
      console.error('❌ 分析エラー:', error);
      Alert.alert('エラー', `AI分析に失敗: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🤖 AI分析テスト</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 分析ボタン */}
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRunAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🧠 AI分析実行</Text>
          )}
        </TouchableOpacity>

        {/* 結果表示 */}
        {analysisResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>📊 分析結果</Text>
            
            {/* 基本情報 */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>基本情報</Text>
              <Text style={styles.infoText}>ID: {analysisResult.analysisId}</Text>
              <Text style={styles.infoText}>信頼度: {Math.round(analysisResult.confidence * 100)}%</Text>
              <Text style={styles.infoText}>時刻: {new Date(analysisResult.timestamp).toLocaleString()}</Text>
            </View>

            {/* サマリー */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>📝 サマリー</Text>
              <Text style={styles.summaryText}>
                {analysisResult.summary || 'サマリーなし'}
              </Text>
            </View>

            {/* 利益分析 */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>💰 利益分析</Text>
              <Text style={styles.valueText}>現在利益: ¥{analysisResult.profitAnalysis.currentProfit}</Text>
              <Text style={styles.valueText}>最適化利益: ¥{analysisResult.profitAnalysis.optimizedProfit}</Text>
              <Text style={styles.valueText}>節約額: ¥{analysisResult.profitAnalysis.costSavings}</Text>
              <Text style={styles.infoText}>価格推奨: {analysisResult.profitAnalysis.priceRecommendation}</Text>
              
              <Text style={styles.subTitle}>改善提案:</Text>
              {analysisResult.profitAnalysis.improvements.map((item, index) => (
                <Text key={index} style={styles.listItem}>• {item}</Text>
              ))}
            </View>

            {/* リスク評価 */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>⚠️ リスク評価</Text>
              <Text style={styles.valueText}>総合リスク: {analysisResult.riskAssessment.overallRisk}/10</Text>
              <Text style={styles.valueText}>破損リスク: {analysisResult.riskAssessment.damageRisk}/10</Text>
              <Text style={styles.valueText}>遅延リスク: {analysisResult.riskAssessment.delayRisk}/10</Text>
              <Text style={styles.valueText}>紛失リスク: {analysisResult.riskAssessment.lossRisk}/10</Text>
              
              <Text style={styles.subTitle}>予防策:</Text>
              {analysisResult.riskAssessment.preventionTips.map((tip, index) => (
                <Text key={index} style={styles.listItem}>• {tip}</Text>
              ))}
            </View>

            {/* 生データ表示（デバッグ用） */}
            <View style={styles.debugCard}>
              <Text style={styles.cardTitle}>🔍 生データ (デバッグ用)</Text>
              <ScrollView horizontal>
                <Text style={styles.debugText}>{rawData}</Text>
              </ScrollView>
            </View>
          </View>
        )}
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    color: 'white',
    fontSize: 16,
    marginRight: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  valueText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
    marginLeft: 8,
  },
  debugCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  debugText: {
    fontSize: 10,
    color: '#495057',
    fontFamily: 'monospace',
  },
});