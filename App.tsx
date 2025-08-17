// App.tsx - 完全修正版
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import EnhancedInputScreen from './components/EnhancedInputScreen';
import ResultScreen from './components/ResultScreen';
import AIAnalysisScreen from './components/AIAnalysisScreen';
import { calculateRealShipping } from './utils/realCalculator';
import { ProductInfo, ShippingResult } from './types/shipping';

type Screen = 'input' | 'result' | 'analysis';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('input');
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    category: '',
    length: '',
    width: '',
    thickness: '',
    weight: '',
    destination: '',
    senderLocation: '',
    salePrice: '',
  });

  const handleDiagnosis = () => {
    const result = calculateRealShipping(productInfo);
    setShippingResult(result);
    setCurrentScreen('result');
  };

  const handleBackToInput = () => {
    setCurrentScreen('input');
  };

  const handleShowAIAnalysis = () => {
    setCurrentScreen('analysis');
  };

  const handleCloseAIAnalysis = () => {
    setCurrentScreen('result');
  };

  // 画面分岐
  switch (currentScreen) {
    case 'result':
      if (!shippingResult) {
        setCurrentScreen('input');
        return null;
      }
      return (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
          <ResultScreen 
            result={shippingResult} 
            onBackToInput={handleBackToInput}
            onAIAnalysis={handleShowAIAnalysis}
            productInfo={productInfo}
          />
        </>
      );

    case 'analysis':
      if (!shippingResult) {
        setCurrentScreen('input');
        return null;
      }
      return (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
          <AIAnalysisScreen
            productInfo={productInfo}
            shippingOptions={shippingResult.options}
            onClose={handleCloseAIAnalysis}
          />
        </>
      );

    default:
      return (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
          <EnhancedInputScreen
            productInfo={productInfo}
            onProductInfoChange={setProductInfo}
            onDiagnosis={handleDiagnosis}
          />
        </>
      );
  }
}