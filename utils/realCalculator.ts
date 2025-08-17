// utils/realCalculator.ts - 実データ版
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
    サイズ: { length, width, thickness },
    重量: weight,
    発送元: senderLocation,
    配送先: productInfo.destination
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
  
  console.log('実データ計算結果:', result);
  return result;
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