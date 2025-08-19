// utils/realCalculator.ts - 持ち込み・仕入れ値対応版
import { ProductInfo, ShippingResult, ShippingOption } from '../types/shipping';
import { calculateActualShippingCost } from '../data/shippingDatabase';

export function calculateRealShipping(productInfo: ProductInfo): ShippingResult {
  const length = parseFloat(productInfo.length) || 0;
  const width = parseFloat(productInfo.width) || 0;
  const thickness = parseFloat(productInfo.thickness) || 0;
  const weight = parseFloat(productInfo.weight) || 0;
  
  // 発送元を動的に取得（デフォルトは東京都）
  const senderLocation = productInfo.senderLocation || '東京都';
  
  // 持ち込み選択の取得
  const isDropOff = productInfo.isDropOff || false;
  
  console.log('実データで計算中:', {
    サイズ: { length, thickness, width },
    発送元: senderLocation,
    配送先: productInfo.destination,
    重量: weight,
    持ち込み: isDropOff ? '持ち込み配送' : '集荷依頼'
  });
  
  // 実際の料金データで計算（持ち込みオプション付き）
  const actualResults = calculateActualShippingCost(
    senderLocation,
    productInfo.destination,
    length,
    width,
    thickness,
    weight,
    isDropOff
  );
  
  console.log('実データ計算結果:', {
    options: actualResults,
    summary: {
      from: senderLocation,
      to: productInfo.destination,
      size: `${length}×${width}×${thickness}cm`,
      weight: `${weight}g`,
      delivery: isDropOff ? '持ち込み' : '集荷'
    }
  });
  
  // 【重要修正】空の結果の場合はフォールバック処理を実行
  if (!actualResults || actualResults.length === 0) {
    console.log('⚠️ 計算結果が空でした。フォールバック配送オプションを使用します。');
    return createFallbackShippingResult(productInfo, senderLocation);
  }
  
  // ShippingOption形式に変換
  const availableOptions: ShippingOption[] = actualResults.map((result, index) => {
    const emojis = ['📮', '🐱', '📦', '🚚', '✈️'];
    const emoji = emojis[index % emojis.length];
    
    return {
      id: `option_${index}`,
      name: `${emoji} ${result.service}`,
      price: result.price,
      deliveryDays: getDeliveryDays(result.service, senderLocation, productInfo.destination),
      features: result.features,
      description: generateDescription(result.service, result.price, result.features),
      isRecommended: index === 0,
      provider: result.provider,
      hasPickupDiscount: result.hasPickupDiscount || false
    };
  });

  // 持ち込み分析の生成
  const pickupAnalysis = generatePickupAnalysis(actualResults, isDropOff);

  return {
    summary: {
      from: senderLocation,
      to: productInfo.destination,
      size: `${length}×${width}×${thickness}cm`,
      weight: `${weight}g`
    },
    options: availableOptions,
    pickupAnalysis
  };
}

// 持ち込み分析の生成
function generatePickupAnalysis(
  results: Array<{service: string, price: number, features: string[], provider: string, hasPickupDiscount?: boolean}>,
  isDropOffSelected: boolean
) {
  // ヤマト運輸の持ち込み割引があるサービスを検索
  const yamatoServices = results.filter(r => r.provider === 'ヤマト運輸');
  const potentialSavings = yamatoServices.filter(r => r.hasPickupDiscount).length * 110;
  
  let recommendation = '';
  
  if (isDropOffSelected) {
    if (potentialSavings > 0) {
      recommendation = `✅ 持ち込み配送を選択済み。ヤマト運輸で合計${potentialSavings}円の割引が適用されています。`;
    } else {
      recommendation = `ℹ️ 持ち込み配送を選択済み。メルカリ便には持ち込み割引はありませんが、匿名配送のメリットがあります。`;
    }
  } else {
    if (potentialSavings > 0) {
      recommendation = `💡 持ち込み配送に変更すると、ヤマト運輸で最大${potentialSavings}円節約できます。コンビニや営業所への持ち込みをご検討ください。`;
    } else {
      recommendation = `📞 集荷依頼を選択済み。自宅で受け渡しできるため便利です。`;
    }
  }
  
  return {
    isDropOffSelected,
    potentialSavings,
    recommendation
  };
}

// フォールバック処理（空の結果用）
function createFallbackShippingResult(productInfo: ProductInfo, senderLocation: string): ShippingResult {
  console.log('🆘 フォールバック配送オプションを生成中...');
  
  const fallbackOptions: ShippingOption[] = [
    {
      id: 'fallback_1',
      name: '📮 ゆうパケットポスト',
      price: 200,
      deliveryDays: '1〜3日',
      features: ['全国一律', 'ポスト投函', '追跡あり'],
      description: '薄型商品に最適な全国一律料金',
      isRecommended: true,
      provider: '日本郵便'
    },
    {
      id: 'fallback_2',
      name: '🐱 ネコポス', 
      price: 230,
      deliveryDays: '1〜2日',
      features: ['全国一律', 'ポスト投函', '追跡あり'],
      description: 'ヤマト運輸の安心配送',
      provider: 'ヤマト運輸'
    },
    {
      id: 'fallback_3',
      name: '📦 宅急便コンパクト',
      price: 450,
      deliveryDays: '翌日〜2日',
      features: ['専用BOX', '手渡し', '追跡あり'],
      description: '小型商品向けの安全配送',
      provider: 'ヤマト運輸'
    }
  ];

  return {
    summary: {
      from: senderLocation,
      to: productInfo.destination,
      size: `${productInfo.length}×${productInfo.width}×${productInfo.thickness}cm`,
      weight: `${productInfo.weight}g`
    },
    options: fallbackOptions,
    pickupAnalysis: {
      isDropOffSelected: productInfo.isDropOff || false,
      potentialSavings: 110,
      recommendation: '配送方法確定後に持ち込み割引の詳細をご案内します。'
    }
  };
}

// 配送日数の計算（発送元・配送先を考慮）
function getDeliveryDays(serviceName: string, from: string, to: string): string {
  // 地域間距離による配送日数の調整
  const isSameRegion = getRegionFromPrefecture(from) === getRegionFromPrefecture(to);
  const isNeighborRegion = !isSameRegion && !isDistantRegion(from, to);
  
  if (serviceName.includes('ネコポス') || serviceName.includes('ゆうパケット')) {
    if (isSameRegion) return '翌日';
    if (isNeighborRegion) return '翌日〜2日';
    return '2〜3日';
  }
  
  if (serviceName.includes('宅急便')) {
    if (isSameRegion) return '翌日';
    if (isNeighborRegion) return '翌日';
    if (to.includes('沖縄') || from.includes('沖縄')) return '2〜3日';
    return '翌日〜2日';
  }
  
  return '1〜3日';
}

// 地域判定関数
function getRegionFromPrefecture(prefecture: string): string {
  const regionMap: { [key: string]: string } = {
    '北海道': '北海道',
    '青森県': '東北', '岩手県': '東北', '宮城県': '東北', '秋田県': '東北', '山形県': '東北', '福島県': '東北',
    '茨城県': '関東', '栃木県': '関東', '群馬県': '関東', '埼玉県': '関東', '千葉県': '関東', '東京都': '関東', '神奈川県': '関東',
    '新潟県': '中部', '富山県': '中部', '石川県': '中部', '福井県': '中部', '山梨県': '中部', '長野県': '中部', '岐阜県': '中部', '静岡県': '中部', '愛知県': '中部',
    '三重県': '関西', '滋賀県': '関西', '京都府': '関西', '大阪府': '関西', '兵庫県': '関西', '奈良県': '関西', '和歌山県': '関西',
    '鳥取県': '中国', '島根県': '中国', '岡山県': '中国', '広島県': '中国', '山口県': '中国',
    '徳島県': '四国', '香川県': '四国', '愛媛県': '四国', '高知県': '四国',
    '福岡県': '九州', '佐賀県': '九州', '長崎県': '九州', '熊本県': '九州', '大分県': '九州', '宮崎県': '九州', '鹿児島県': '九州', '沖縄県': '沖縄'
  };
  
  return regionMap[prefecture] || '関東';
}

// 遠距離地域判定
function isDistantRegion(from: string, to: string): boolean {
  const distantPairs = [
    ['北海道', '沖縄'],
    ['北海道', '九州'],
    ['東北', '沖縄'],
    ['関東', '沖縄'],
    ['中部', '沖縄'],
    ['関西', '沖縄']
  ];
  
  const fromRegion = getRegionFromPrefecture(from);
  const toRegion = getRegionFromPrefecture(to);
  
  return distantPairs.some(([region1, region2]) => 
    (fromRegion === region1 && toRegion === region2) ||
    (fromRegion === region2 && toRegion === region1)
  );
}

// サービス説明文の生成
function generateDescription(serviceName: string, price: number, features: string[]): string {
  const hasTracking = features.some(f => f.includes('追跡'));
  const isPostDelivery = features.some(f => f.includes('ポスト投函'));
  const hasInsurance = features.some(f => f.includes('補償'));
  const hasPickupDiscount = features.some(f => f.includes('持込割引'));
  
  let description = `¥${price.toLocaleString()}で配送`;
  
  if (isPostDelivery) {
    description += '・ポスト投函';
  } else {
    description += '・手渡し';
  }
  
  if (hasTracking) description += '・追跡可能';
  if (hasInsurance) description += '・損害補償付き';
  if (hasPickupDiscount) description += '・持込割引適用';
  
  return description;
}

// 利益計算の分析（仕入れ値対応）
export function calculateProfitAnalysis(productInfo: ProductInfo, shippingOptions: ShippingOption[]) {
  const salePrice = parseFloat(productInfo.salePrice || '0');
  const costPrice = parseFloat(productInfo.costPrice || '0');
  const platformFee = Math.round(salePrice * 0.1); // メルカリ手数料10%
  
  if (salePrice === 0) {
    return null; // 販売価格未入力の場合は分析しない
  }
  
  const analysis = shippingOptions.map(option => {
    const shippingCost = option.price;
    const grossProfit = salePrice - (costPrice || 0); // 売上総利益
    const netProfit = salePrice - platformFee - shippingCost - (costPrice || 0); // 純利益
    const profitRate = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;
    
    return {
      shippingService: option.name,
      shippingCost,
      grossProfit: costPrice > 0 ? grossProfit : null, // 仕入れ値がある場合のみ表示
      netProfit,
      profitRate,
      isRecommended: option.isRecommended
    };
  });
  
  return {
    salePrice,
    costPrice: costPrice || null,
    platformFee,
    analysis,
    bestOption: analysis.reduce((best, current) => 
      current.netProfit > best.netProfit ? current : best
    )
  };
}