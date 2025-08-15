// utils/realCalculator.ts
import { ProductInfo, ShippingResult, ShippingOption } from '../types/shipping';
import { shippingServices, getRegionFromPrefecture, getDistanceCategory } from '../data/shippingDatabase';

export function calculateRealShipping(productInfo: ProductInfo): ShippingResult {
  const length = parseFloat(productInfo.length) || 0;
  const width = parseFloat(productInfo.width) || 0;
  const thickness = parseFloat(productInfo.thickness) || 0;
  const weight = parseFloat(productInfo.weight) || 0;
  
  // 出発地（固定：東京都として設定）
  const fromRegion = '関東';
  const toRegion = getRegionFromPrefecture(productInfo.destination);
  const distanceCategory = getDistanceCategory(fromRegion, toRegion);
  
  console.log('計算パラメータ:', {
    サイズ: { length, width, thickness },
    重量: weight,
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
      
      // ランキング用の特別フラグ
      let features = [...service.features];
      let advantages = [...service.advantages];
      
      // 最安かどうかをチェック（後で実装）
      
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
    const rankNames = ['最安', '次善', '選択肢'];
    
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
  
  // 結果の組み立て
  const result: ShippingResult = {
    summary: {
      from: '東京都',
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