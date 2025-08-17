// MainApp.tsx（新規作成）
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// 既存のコンポーネントimport
import EnhancedInputScreen from './components/EnhancedInputScreen';
import ResultScreen from './components/ResultScreen';
import AIAnalysisScreen from './components/AIAnalysisScreen';

import { ProductInfo, ShippingResult } from './types/shipping';
import { calculateRealShipping } from './utils/realCalculator';

export default function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<'input' | 'result' | 'analysis'>('input');
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    category: '衣類',
    length: '',
    width: '',
    thickness: '',
    weight: '',
    destination: '',
    senderLocation: '東京都',
    salePrice: '',
  });
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);

  const handleDiagnosis = () => {
    const result = calculateRealShipping(productInfo);
    setShippingResult(result);
    setCurrentScreen('result');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'input':
        return (
          <EnhancedInputScreen
            productInfo={productInfo}
            onProductInfoChange={setProductInfo}
            onDiagnosis={handleDiagnosis}
          />
        );
      case 'result':
        return (
          <ResultScreen
            result={shippingResult}
            onBack={() => setCurrentScreen('input')}
            onAIAnalysis={() => setCurrentScreen('analysis')}
          />
        );
      case 'analysis':
        return (
          <AIAnalysisScreen
            productInfo={productInfo}
            shippingOptions={shippingResult?.options || []}
            onBack={() => setCurrentScreen('result')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});