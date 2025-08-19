// utils/realCalculator.ts - 空配列防止修正版
import { ProductInfo, ShippingResult, ShippingOption } from '../types/shipping';
import { calculateActualShippingCost } from '../data/realShippingDatabase';

export function calculateRealShipping(productInfo: ProductInfo): ShippingResult {
  const length = parseFloat(productInfo.length) || 0;
  const width = parseFloat(productInfo.width) || 0;
  const thickness = parseFloat(productInfo.thickness) || 0;
  const weight = parseFloat(productInfo.weight) || 0;
  
  // 発送元を動的に取得（デフォルトは東京都）
  const senderLocation = productInfo.senderLocation || '東京都';
  
  console.log('実データで計算中:', {
    サイズ: { length, thickness, width },
    発送元: senderLocation,
    配送先: productInfo.destination,
    重量: weight
  });
  
  // 実際の料金データで計算
  const actualResults = calculateActualShippingCost(
    senderLocation,
    productInfo.destination,
    length,
    width,
    thickness,
    weight
  );
  
  console.log('実データ計算結果:', {
    options: actualResults,
    summary: {
      from: senderLocation,
      to: productInfo.destination,
      size: `${length}×${width}×${thickness}cm`,
      weight: `${weight}g`
    }
  });
  
  // 【重要修正】空の結果の場合はフォールバック処理を実行
  if (!actualResults || actualResults.length === 0) {
    console.log('⚠️ 計算結果が空でした。フォールバック配送オプションを使用します。');
    return createFallbackShippingResult(productInfo, senderLocation);
  }
  
  // ShippingOption形式に変換
  const availableOptions: ShippingOption[] = actualResults.map((result, index) => {
    const emojis = ['📮', '🐱', '📦', '📦', '📦'];
    return {
      id: result.service.toLowerCase().replace(/\s+/g, '-'),
      name: `${emojis[index] || '📦'} ${result.service}`,
      price: result.price,
      deliveryDays: getDeliveryDays(result.service),
      features: result.features,
      description: result.features.join('・'),
    };
  });
  
  // 料金でソート済み
  const topOptions = availableOptions.slice(0, 3).map((option, index) => {
    const rankIcons = ['🥇', '🥈', '🥉'];
    const isRecommended = index === 0;
    
    // ランキングアイコンを名前に追加
    const nameWithRank = `${rankIcons[index]} ${option.name.replace(/^[📮🐱📦]\s/, '')}`;
    
    // 特徴にランキングを追加
    let updatedFeatures = [...option.features];
    if (index === 0) {
      updatedFeatures.push('最安');
    }
    if (option.deliveryDays.includes('翌日')) {
      updatedFeatures.push('最速');
    }
    
    return {
      ...option,
      name: nameWithRank,
      features: updatedFeatures,
      isRecommended,
    };
  });
  
  // 結果の組み立て
  const result: ShippingResult = {
    summary: {
      from: senderLocation,
      to: productInfo.destination,
      size: `${length}×${width}×${thickness}cm`,
      weight: `${weight}g`,
    },
    options: topOptions,
  };
  
  console.log('✅ 最終計算結果:', result);
  return result;
}

// 【新規追加】フォールバック用の配送オプション作成
function createFallbackShippingResult(productInfo: ProductInfo, senderLocation: string): ShippingResult {
  const length = parseFloat(productInfo.length) || 0;
  const width = parseFloat(productInfo.width) || 0;
  const thickness = parseFloat(productInfo.thickness) || 0;
  const weight = parseFloat(productInfo.weight) || 0;
  
  console.log('🔄 フォールバック配送オプションを生成中...');
  
  // サイズと重量に基づいた基本料金の推定
  const estimatedPrice = estimateShippingPrice(length, width, thickness, weight);
  
  const fallbackOptions: ShippingOption[] = [
    {
      id: 'fallback-standard',
      name: '🥇 標準配送',
      price: estimatedPrice,
      deliveryDays: '1〜3日でお届け',
      features: ['追跡あり', '推定料金', '最安'],
      description: '追跡あり・推定料金・最安',
      isRecommended: true,
    },
    {
      id: 'fallback-express',
      name: '🥈 速達配送',
      price: estimatedPrice + 200,
      deliveryDays: '翌日〜2日でお届け',
      features: ['追跡あり', '推定料金', '最速'],
      description: '追跡あり・推定料金・最速',
    },
    {
      id: 'fallback-premium',
      name: '🥉 プレミアム配送',
      price: estimatedPrice + 400,
      deliveryDays: '翌日お届け',
      features: ['追跡あり', '推定料金', '補償あり'],
      description: '追跡あり・推定料金・補償あり',
    },
  ];
  
  return {
    summary: {
      from: senderLocation,
      to: productInfo.destination,
      size: `${length}×${width}×${thickness}cm`,
      weight: `${weight}g`,
    },
    options: fallbackOptions,
  };
}

// 【新規追加】配送料金の推定関数
function estimateShippingPrice(length: number, width: number, thickness: number, weight: number): number {
  // サイズと重量に基づいた料金推定
  const totalSize = length + width + thickness;
  
  // 薄型・軽量の場合
  if (thickness <= 3 && weight <= 1000) {
    return 210; // ゆうパケットポスト相当
  }
  
  // 小型の場合
  if (totalSize <= 60 && weight <= 2000) {
    return 350; // 小型宅配便相当
  }
  
  // 中型の場合
  if (totalSize <= 100 && weight <= 5000) {
    return 500; // 中型宅配便相当
  }
  
  // 大型の場合
  return 800; // 大型宅配便相当
}

// サービス別の配達日数
function getDeliveryDays(serviceName: string): string {
  const deliveryMap: { [key: string]: string } = {
    'ゆうパケットポスト': '1〜3日',
    'ネコポス': '1〜2日',
    'ゆうパケット': '1〜3日',
    '宅急便コンパクト': '翌日〜2日',
    '宅急便60': '翌日〜2日'
  };
  
  return deliveryMap[serviceName] || '1〜3日';
}

// 距離による料金差の分析
export function analyzeShippingDistance(productInfo: ProductInfo) {
  const senderLocation = productInfo.senderLocation || '東京都';
  const destination = productInfo.destination;
  
  // 同一都道府県での料金
  const sameResults = calculateActualShippingCost(
    senderLocation, senderLocation,
    parseFloat(productInfo.length), parseFloat(productInfo.width),
    parseFloat(productInfo.thickness), parseFloat(productInfo.weight)
  );
  
  // 実際の配送先での料金
  const actualResults = calculateActualShippingCost(
    senderLocation, destination,
    parseFloat(productInfo.length), parseFloat(productInfo.width),
    parseFloat(productInfo.thickness), parseFloat(productInfo.weight)
  );
  
  return {
    distanceInfo: `${senderLocation} → ${destination}`,
    priceComparison: actualResults.map((actual, index) => ({
      service: actual.service,
      actualPrice: actual.price,
      sameRegionPrice: sameResults[index]?.price || actual.price,
      difference: actual.price - (sameResults[index]?.price || actual.price)
    }))
  };
}