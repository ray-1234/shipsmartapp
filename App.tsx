// App.tsx - メインアプリケーション
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import EnhancedInputScreen from './components/EnhancedInputScreen';
import ResultScreen from './components/ResultScreen';
import { calculateRealShipping } from './utils/realCalculator';
import { ProductInfo, ShippingResult } from './types/shipping';
import AIAnalysisScreen from './AIAnalysisScreen';

type Screen = 'input' | 'result';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('input');
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    category: '衣類',
    length: '25',
    width: '18',
    thickness: '2.8',
    weight: '450',
    destination: '大阪府',
  });

  const handleDiagnosis = () => {
    console.log('診断開始:', productInfo);
    
    // 実際の料金計算を実行
    const result = calculateRealShipping(productInfo);
    setShippingResult(result);
    setCurrentScreen('result');
  };

  const handleBackToInput = () => {
    setCurrentScreen('input');
  };

  const handleProductInfoChange = (newProductInfo: ProductInfo) => {
    setProductInfo(newProductInfo);
  };

  // 画面の分岐
  if (currentScreen === 'result' && shippingResult) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
        <ResultScreen 
          result={shippingResult} 
          onBackToInput={handleBackToInput}
          productInfo={productInfo}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
      <EnhancedInputScreen
        productInfo={productInfo}
        onProductInfoChange={handleProductInfoChange}
        onDiagnosis={handleDiagnosis}
      />
    </>
  );
}

if (showAIAnalysis && selectedOption) {
  return (
    <AIAnalysisScreen
      productInfo={productInfo}
      shippingOptions={shippingOptions}
      onClose={handleCloseAI}
    />
  );
}