// components/ResultScreen.tsx - AI分析ボタン修正版
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ShippingResult, ProductInfo } from '../types/shipping';

interface ResultScreenProps {
  result: ShippingResult;
  onBackToInput: () => void;
  onAIAnalysis: () => void;  // ✅ App.tsxから渡されるprops名と一致
  productInfo: ProductInfo;
}

export default function ResultScreen({ 
  result, 
  onBackToInput, 
  onAIAnalysis,  // ✅ 正しいprops名を使用
  productInfo
}: ResultScreenProps) {

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onBackToInput}>
          <Text style={styles.closeButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>おすすめの発送方法</Text>
          <Text style={styles.headerSubtitle}>あなたにピッタリの配送サービス</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* サマリー */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            {result.summary.from} → {result.summary.to} / {result.summary.size} / {result.summary.weight}
          </Text>
        </View>

        {/* 配送オプション一覧 */}
        {result.options.map((option, index) => (
          <View 
            key={option.id} 
            style={[
              styles.resultCard,
              option.isRecommended && styles.recommendedCard
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {index === 0 && '🥇 '}
                {index === 1 && '🥈 '}
                {index === 2 && '🥉 '}
                {option.name}
              </Text>
              <Text style={styles.resultPrice}>¥{option.price.toLocaleString()}</Text>
            </View>
            
            <Text style={styles.resultDetails}>{option.deliveryDays}</Text>
            
            <View style={styles.resultFeatures}>
              {option.features.map((feature, featureIndex) => (
                <Text key={featureIndex} style={styles.featureTag}>
                  {feature}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {/* 🎯 AI分析ボタン - メイン */}
        <TouchableOpacity 
          style={styles.aiAnalysisButton} 
          onPress={onAIAnalysis}
        >
          <Text style={styles.aiAnalysisButtonText}>🤖 AI総合分析を実行</Text>
          <Text style={styles.aiAnalysisButtonSubtext}>
            利益最大化・リスク分析・梱包提案・市場戦略
          </Text>
        </TouchableOpacity>

        {/* 条件変更ボタン */}
        <TouchableOpacity style={styles.secondaryButton} onPress={onBackToInput}>
          <Text style={styles.secondaryButtonText}>条件を変更する</Text>
        </TouchableOpacity>
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
    backgroundColor: '#1E88E5',
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
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
  },
  recommendedCard: {
    borderLeftColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  resultDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resultFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  // 🎯 AI分析ボタンのスタイル
  aiAnalysisButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#FF9800',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiAnalysisButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiAnalysisButtonSubtext: {
    color: 'white',
    fontSize: 13,
    opacity: 0.9,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#1E88E5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '500',
  },
});