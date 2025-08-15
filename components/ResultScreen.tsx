// components/ResultScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ShippingResult } from '../types/shipping';
import QRCodeComponent from './QRCodeComponent';

interface ResultScreenProps {
  result: ShippingResult;
  onBackToInput: () => void;
  productInfo: any; // ProductInfo type
}

export default function ResultScreen({ result, onBackToInput, productInfo }: ResultScreenProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleCreateQR = (option: any) => {
    setSelectedOption(option);
    setShowQRCode(true);
  };

  const handleCloseQR = () => {
    setShowQRCode(false);
    setSelectedOption(null);
  };

  // QRコード画面表示
  if (showQRCode && selectedOption) {
    return (
      <QRCodeComponent
        productInfo={productInfo}
        selectedOption={selectedOption}
        onClose={handleCloseQR}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToInput}>
          <Text style={styles.backButtonText}>← 戻る</Text>
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
              <Text style={styles.resultTitle}>{option.name}</Text>
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

            {/* QRコード生成ボタン */}
            <TouchableOpacity 
              style={styles.qrButton} 
              onPress={() => handleCreateQR(option)}
            >
              <Text style={styles.qrButtonText}>📱 QRコード生成</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* アクションボタン */}
        <TouchableOpacity style={styles.ctaButton} onPress={() => handleCreateQR(result.options[0])}>
          <Text style={styles.ctaButtonText}>🥇 最安方法でQR作成</Text>
        </TouchableOpacity>

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
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  backButtonText: {
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#1E88E5',
  },
  recommendedCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#f8fff9',
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
    fontWeight: '700',
    color: '#1E88E5',
  },
  resultDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  resultFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: '#e3f2fd',
    color: '#1E88E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  qrButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E88E5',
    marginBottom: 40,
  },
  secondaryButtonText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '600',
  },
});