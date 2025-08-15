// App.tsx - メインアプリケーション（修正版）
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import EnhancedInputScreen from './components/EnhancedInputScreen';
import ResultScreen from './components/ResultScreen';
import AIAnalysisScreen from './components/AIAnalysisScreen';
import { calculateRealShipping } from './utils/realCalculator';
import { ProductInfo, ShippingResult, ShippingOption } from './types/shipping';

type Screen = 'input' | 'result' | 'ai_analysis';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('input');
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
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

  const handleShowAIAnalysis = () => {
    setShowAIAnalysis(true);
    setCurrentScreen('ai_analysis');
  };

  const handleCloseAI = () => {
    setShowAIAnalysis(false);
    setCurrentScreen('result');
  };

  // AI分析画面の表示
  if (currentScreen === 'ai_analysis' && shippingResult) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <AIAnalysisScreen
          productInfo={productInfo}
          shippingOptions={shippingResult.options}
          onClose={handleCloseAI}
        />
      </>
    );
  }

  // 結果画面の表示
  if (currentScreen === 'result' && shippingResult) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
        <ResultScreen 
          result={shippingResult} 
          onBackToInput={handleBackToInput}
          productInfo={productInfo}
          onShowAIAnalysis={handleShowAIAnalysis} // AI分析ボタン用
        />
      </>
    );
  }

  // 入力画面の表示
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