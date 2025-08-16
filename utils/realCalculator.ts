// utils/realCalculator.ts - 修正版
import { ProductInfo, ShippingResult, ShippingOption } from '../types/shipping';
import { shippingServices, getRegionFromPrefecture, getDistanceCategory } from '../data/shippingDatabase';

export function calculateRealShipping(productInfo: ProductInfo): ShippingResult {
  const length = parseFloat(productInfo.length) || 0;
  const width = parseFloat(productInfo.width) || 0;
  const thickness = parseFloat(productInfo.thickness) || 0;
  const weight = parseFloat(productInfo.weight) || 0;
  
  // 発送元を動的に取得（デフォルトは東京都）
  const senderLocation = productInfo.senderLocation || '東京都';
  const fromRegion = getRegionFromPrefecture(senderLocation);
  const toRegion = getRegionFromPrefecture(productInfo.destination);
  const distanceCategory = getDistanceCategory(fromRegion, toRegion);
  
  console.log('計算パラメータ:', {
    サイズ: { length, width, thickness },
    重量: weight,
    発送元: senderLocation,
    配送先: productInfo.destination,
    距離: `${fromRegion} → ${toRegion} (${distanceCategory})`
  });
  
  // 各配送サービスをチェック
  const availableOptions: ShippingOption[] = [];
  
  for (const service of shippingServices) {
    // サイズ・重量制限チェック
    const isWithinLimits = 
      length <= service.sizeLimit.maxLength &&
      width <= service.sizeLimit.maxWidth &&
      thickness <= service.sizeLimit.maxThickness &&
      weight <= service.sizeLimit.maxWeight;
    
    if (isWithinLimits) {
      const price = service.priceByRegion[distanceCategory];
      
      // 特徴とアドバンテージを設定
      let features = [...service.features];
      let advantages = [...service.advantages];
      
      availableOptions.push({
        id: service.id,
        name: `${service.emoji} ${service.displayName}`,
        price: price,
        deliveryDays: service.deliveryDays,
        features: features,
        description: advantages.join('・'),
      });
    }
  }
  
  // 料金でソート
  availableOptions.sort((a, b) => a.price - b.price);
  
  // 上位3つに絞り、ランキングアイコンを追加
  const topOptions = availableOptions.slice(0, 3).map((option, index) => {
    const rankIcons = ['🥇', '🥈', '🥉'];
    
    // 最安の場合は推奨マーク
    const isRecommended = index === 0;
    
    // ランキングアイコンを名前に追加
    const nameWithRank = `${rankIcons[index]} ${option.name.replace(/^[🎯📮🐱📦]\s/, '')}`;
    
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
  
  // 結果の組み立て - 発送元を動的に表示
  const result: ShippingResult = {
    summary: {
      from: senderLocation,
      to: productInfo.destination,
      size: `${length}×${width}×${thickness}cm`,
      weight: `${weight}g`,
    },
    options: topOptions,
  };
  
  console.log('計算結果:', result);
  return result;
}

// サイズ制限チェック用のヘルパー関数
export function checkSizeCompatibility(productInfo: ProductInfo) {
  const length = parseFloat(productInfo.length) || 0;
  const width = parseFloat(productInfo.width) || 0;
  const thickness = parseFloat(productInfo.thickness) || 0;
  const weight = parseFloat(productInfo.weight) || 0;
  
  const compatibleServices = shippingServices.filter(service => 
    length <= service.sizeLimit.maxLength &&
    width <= service.sizeLimit.maxWidth &&
    thickness <= service.sizeLimit.maxThickness &&
    weight <= service.sizeLimit.maxWeight
  );
  
  return {
    compatibleCount: compatibleServices.length,
    services: compatibleServices.map(s => s.displayName),
    hasOptions: compatibleServices.length > 0,
  };
}

// 発送元と配送先の距離による料金影響を計算する関数
export function calculateDistanceImpact(productInfo: ProductInfo) {
  const senderLocation = productInfo.senderLocation || '東京都';
  const fromRegion = getRegionFromPrefecture(senderLocation);
  const toRegion = getRegionFromPrefecture(productInfo.destination);
  const distanceCategory = getDistanceCategory(fromRegion, toRegion);
  
  // 各距離カテゴリでの料金例を取得
  const sampleService = shippingServices[0]; // ゆうパケットポストで例示
  const prices = {
    same: sampleService.priceByRegion.same,
    neighbor: sampleService.priceByRegion.neighbor,
    distant: sampleService.priceByRegion.distant
  };
  
  return {
    currentCategory: distanceCategory,
    currentPrice: prices[distanceCategory],
    priceRange: prices,
    distanceInfo: `${fromRegion} → ${toRegion}`,
    savings: distanceCategory === 'same' ? prices.distant - prices.same : 0
  };
}