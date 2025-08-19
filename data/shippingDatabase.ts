// data/shippingDatabase.ts - 実料金表対応版（2025年5月改定データ）
export type RegionCode = 'hokkaido' | 'kitaTohoku' | 'minamiTohoku' | 'kanto' | 'shinetsu' | 'hokuriku' | 'chubu' | 'kansai' | 'chugoku' | 'shikoku' | 'kyushu' | 'okinawa';
export type SizeCode = 'compact' | '60' | '80' | '100' | '120' | '140' | '160' | '180' | '200';

// 都道府県から地域への対応表
export const prefectureToRegion: { [prefecture: string]: RegionCode } = {
  '北海道': 'hokkaido',
  '青森県': 'kitaTohoku', '秋田県': 'kitaTohoku', '岩手県': 'kitaTohoku',
  '宮城県': 'minamiTohoku', '山形県': 'minamiTohoku', '福島県': 'minamiTohoku',
  '茨城県': 'kanto', '栃木県': 'kanto', '群馬県': 'kanto', '埼玉県': 'kanto', 
  '千葉県': 'kanto', '神奈川県': 'kanto', '東京都': 'kanto', '山梨県': 'kanto',
  '新潟県': 'shinetsu', '長野県': 'shinetsu',
  '富山県': 'hokuriku', '石川県': 'hokuriku', '福井県': 'hokuriku',
  '静岡県': 'chubu', '愛知県': 'chubu', '三重県': 'chubu', '岐阜県': 'chubu',
  '大阪府': 'kansai', '京都府': 'kansai', '滋賀県': 'kansai', '奈良県': 'kansai', 
  '和歌山県': 'kansai', '兵庫県': 'kansai',
  '岡山県': 'chugoku', '広島県': 'chugoku', '山口県': 'chugoku', '鳥取県': 'chugoku', '島根県': 'chugoku',
  '香川県': 'shikoku', '徳島県': 'shikoku', '愛媛県': 'shikoku', '高知県': 'shikoku',
  '福岡県': 'kyushu', '佐賀県': 'kyushu', '長崎県': 'kyushu', '熊本県': 'kyushu', 
  '大分県': 'kyushu', '宮崎県': 'kyushu', '鹿児島県': 'kyushu',
  '沖縄県': 'okinawa'
};

// 【メルカリ便対応】宅急便コンパクト料金表（2025年5月改定版）
export const mercariCompactRates: { [fromRegion in RegionCode]: { [toRegion in RegionCode]: number } } = {
  hokkaido: { hokkaido: 380, kitaTohoku: 450, minamiTohoku: 480, kanto: 520, shinetsu: 520, hokuriku: 550, chubu: 550, kansai: 620, chugoku: 650, shikoku: 650, kyushu: 720, okinawa: 720 },
  kitaTohoku: { hokkaido: 450, kitaTohoku: 380, minamiTohoku: 380, kanto: 420, shinetsu: 420, hokuriku: 450, chubu: 450, kansai: 480, chugoku: 520, shikoku: 520, kyushu: 580, okinawa: 620 },
  minamiTohoku: { hokkaido: 480, kitaTohoku: 380, minamiTohoku: 380, kanto: 380, shinetsu: 380, hokuriku: 420, chubu: 420, kansai: 450, chugoku: 520, shikoku: 520, kyushu: 580, okinawa: 580 },
  kanto: { hokkaido: 520, kitaTohoku: 420, minamiTohoku: 380, kanto: 380, shinetsu: 380, hokuriku: 380, chubu: 380, kansai: 420, chugoku: 450, shikoku: 450, kyushu: 520, okinawa: 520 },
  shinetsu: { hokkaido: 520, kitaTohoku: 420, minamiTohoku: 380, kanto: 380, shinetsu: 380, hokuriku: 380, chubu: 380, kansai: 420, chugoku: 450, shikoku: 450, kyushu: 520, okinawa: 550 },
  hokuriku: { hokkaido: 550, kitaTohoku: 450, minamiTohoku: 420, kanto: 380, shinetsu: 380, hokuriku: 380, chubu: 380, kansai: 380, chugoku: 420, shikoku: 420, kyushu: 450, okinawa: 550 },
  chubu: { hokkaido: 550, kitaTohoku: 450, minamiTohoku: 420, kanto: 380, shinetsu: 380, hokuriku: 380, chubu: 380, kansai: 380, chugoku: 420, shikoku: 420, kyushu: 450, okinawa: 520 },
  kansai: { hokkaido: 620, kitaTohoku: 480, minamiTohoku: 450, kanto: 420, shinetsu: 420, hokuriku: 380, chubu: 380, kansai: 380, chugoku: 380, shikoku: 380, kyushu: 420, okinawa: 520 },
  chugoku: { hokkaido: 650, kitaTohoku: 520, minamiTohoku: 520, kanto: 450, shinetsu: 450, hokuriku: 420, chubu: 420, kansai: 380, chugoku: 380, shikoku: 380, kyushu: 380, okinawa: 520 },
  shikoku: { hokkaido: 650, kitaTohoku: 520, minamiTohoku: 520, kanto: 450, shinetsu: 450, hokuriku: 420, chubu: 420, kansai: 380, chugoku: 380, shikoku: 380, kyushu: 420, okinawa: 520 },
  kyushu: { hokkaido: 720, kitaTohoku: 580, minamiTohoku: 580, kanto: 520, shinetsu: 520, hokuriku: 450, chubu: 450, kansai: 420, chugoku: 380, shikoku: 420, kyushu: 380, okinawa: 480 },
  okinawa: { hokkaido: 720, kitaTohoku: 620, minamiTohoku: 580, kanto: 520, shinetsu: 550, hokuriku: 550, chubu: 520, kansai: 520, chugoku: 520, shikoku: 520, kyushu: 480, okinawa: 380 }
};

// 【メルカリ便対応】宅急便60サイズ料金表（2025年5月改定版）
export const mercari60Rates: { [fromRegion in RegionCode]: { [toRegion in RegionCode]: number } } = {
  hokkaido: { hokkaido: 750, kitaTohoku: 950, minamiTohoku: 1050, kanto: 1150, shinetsu: 1150, hokuriku: 1300, chubu: 1300, kansai: 1500, chugoku: 1650, shikoku: 1650, kyushu: 1850, okinawa: 1850 },
  kitaTohoku: { hokkaido: 950, kitaTohoku: 750, minamiTohoku: 750, kanto: 850, shinetsu: 850, hokuriku: 950, chubu: 950, kansai: 1050, chugoku: 1150, shikoku: 1150, kyushu: 1400, okinawa: 1500 },
  minamiTohoku: { hokkaido: 1050, kitaTohoku: 750, minamiTohoku: 750, kanto: 750, shinetsu: 750, hokuriku: 850, chubu: 850, kansai: 950, chugoku: 1150, shikoku: 1150, kyushu: 1400, okinawa: 1400 },
  kanto: { hokkaido: 1150, kitaTohoku: 850, minamiTohoku: 750, kanto: 750, shinetsu: 750, hokuriku: 750, chubu: 750, kansai: 850, chugoku: 950, shikoku: 950, kyushu: 1150, okinawa: 1150 },
  shinetsu: { hokkaido: 1150, kitaTohoku: 850, minamiTohoku: 750, kanto: 750, shinetsu: 750, hokuriku: 750, chubu: 750, kansai: 850, chugoku: 950, shikoku: 950, kyushu: 1150, okinawa: 1300 },
  hokuriku: { hokkaido: 1300, kitaTohoku: 950, minamiTohoku: 850, kanto: 750, shinetsu: 750, hokuriku: 750, chubu: 750, kansai: 750, chugoku: 850, shikoku: 850, kyushu: 950, okinawa: 1300 },
  chubu: { hokkaido: 1300, kitaTohoku: 950, minamiTohoku: 850, kanto: 750, shinetsu: 750, hokuriku: 750, chubu: 750, kansai: 750, chugoku: 850, shikoku: 850, kyushu: 950, okinawa: 1150 },
  kansai: { hokkaido: 1500, kitaTohoku: 1050, minamiTohoku: 950, kanto: 850, shinetsu: 850, hokuriku: 750, chubu: 750, kansai: 750, chugoku: 750, shikoku: 750, kyushu: 850, okinawa: 1150 },
  chugoku: { hokkaido: 1650, kitaTohoku: 1150, minamiTohoku: 1150, kanto: 950, shinetsu: 950, hokuriku: 850, chubu: 850, kansai: 750, chugoku: 750, shikoku: 750, kyushu: 750, okinawa: 1150 },
  shikoku: { hokkaido: 1650, kitaTohoku: 1150, minamiTohoku: 1150, kanto: 950, shinetsu: 950, hokuriku: 850, chubu: 850, kansai: 750, chugoku: 750, shikoku: 750, kyushu: 850, okinawa: 1150 },
  kyushu: { hokkaido: 1850, kitaTohoku: 1400, minamiTohoku: 1400, kanto: 1150, shinetsu: 1150, hokuriku: 950, chubu: 950, kansai: 850, chugoku: 750, shikoku: 850, kyushu: 750, okinawa: 1050 },
  okinawa: { hokkaido: 1850, kitaTohoku: 1500, minamiTohoku: 1400, kanto: 1150, shinetsu: 1300, hokuriku: 1300, chubu: 1150, kansai: 1150, chugoku: 1150, shikoku: 1150, kyushu: 1050, okinawa: 750 }
};

// 【ヤマト運輸公式】宅急便コンパクト料金表（2025年5月改定版）
export const takkyubinCompactRates: { [fromRegion in RegionCode]: { [toRegion in RegionCode]: number } } = {
  hokkaido: { hokkaido: 650, kitaTohoku: 760, minamiTohoku: 820, kanto: 870, shinetsu: 870, hokuriku: 930, chubu: 930, kansai: 1040, chugoku: 1090, shikoku: 1090, kyushu: 1200, okinawa: 1200 },
  kitaTohoku: { hokkaido: 760, kitaTohoku: 650, minamiTohoku: 650, kanto: 710, shinetsu: 710, hokuriku: 760, chubu: 760, kansai: 820, chugoku: 870, shikoku: 870, kyushu: 980, okinawa: 1040 },
  minamiTohoku: { hokkaido: 820, kitaTohoku: 650, minamiTohoku: 650, kanto: 650, shinetsu: 650, hokuriku: 710, chubu: 710, kansai: 760, chugoku: 870, shikoku: 870, kyushu: 980, okinawa: 980 },
  kanto: { hokkaido: 870, kitaTohoku: 710, minamiTohoku: 650, kanto: 650, shinetsu: 650, hokuriku: 650, chubu: 650, kansai: 710, chugoku: 760, shikoku: 760, kyushu: 870, okinawa: 870 },
  shinetsu: { hokkaido: 870, kitaTohoku: 710, minamiTohoku: 650, kanto: 650, shinetsu: 650, hokuriku: 650, chubu: 650, kansai: 710, chugoku: 760, shikoku: 760, kyushu: 870, okinawa: 930 },
  hokuriku: { hokkaido: 930, kitaTohoku: 760, minamiTohoku: 710, kanto: 650, shinetsu: 650, hokuriku: 650, chubu: 650, kansai: 650, chugoku: 710, shikoku: 710, kyushu: 760, okinawa: 930 },
  chubu: { hokkaido: 930, kitaTohoku: 760, minamiTohoku: 710, kanto: 650, shinetsu: 650, hokuriku: 650, chubu: 650, kansai: 650, chugoku: 710, shikoku: 710, kyushu: 760, okinawa: 870 },
  kansai: { hokkaido: 1040, kitaTohoku: 820, minamiTohoku: 760, kanto: 710, shinetsu: 710, hokuriku: 650, chubu: 650, kansai: 650, chugoku: 650, shikoku: 650, kyushu: 710, okinawa: 870 },
  chugoku: { hokkaido: 1090, kitaTohoku: 870, minamiTohoku: 870, kanto: 760, shinetsu: 760, hokuriku: 710, chubu: 710, kansai: 650, chugoku: 650, shikoku: 650, kyushu: 650, okinawa: 870 },
  shikoku: { hokkaido: 1090, kitaTohoku: 870, minamiTohoku: 870, kanto: 760, shinetsu: 760, hokuriku: 710, chubu: 710, kansai: 650, chugoku: 650, shikoku: 650, kyushu: 710, okinawa: 870 },
  kyushu: { hokkaido: 1200, kitaTohoku: 980, minamiTohoku: 980, kanto: 870, shinetsu: 870, hokuriku: 760, chubu: 760, kansai: 710, chugoku: 650, shikoku: 710, kyushu: 650, okinawa: 820 },
  okinawa: { hokkaido: 1200, kitaTohoku: 1040, minamiTohoku: 980, kanto: 870, shinetsu: 930, hokuriku: 930, chubu: 870, kansai: 870, chugoku: 870, shikoku: 870, kyushu: 820, okinawa: 650 }
};

// 【ヤマト運輸公式】宅急便60サイズ料金表（2025年5月改定版）
export const takkyubin60Rates: { [fromRegion in RegionCode]: { [toRegion in RegionCode]: number } } = {
  hokkaido: { hokkaido: 940, kitaTohoku: 1190, minamiTohoku: 1320, kanto: 1460, shinetsu: 1460, hokuriku: 1610, chubu: 1610, kansai: 1920, chugoku: 2070, shikoku: 2070, kyushu: 2340, okinawa: 2340 },
  kitaTohoku: { hokkaido: 1190, kitaTohoku: 940, minamiTohoku: 940, kanto: 1060, shinetsu: 1060, hokuriku: 1190, chubu: 1190, kansai: 1320, chugoku: 1460, shikoku: 1460, kyushu: 1760, okinawa: 1920 },
  minamiTohoku: { hokkaido: 1320, kitaTohoku: 940, minamiTohoku: 940, kanto: 940, shinetsu: 940, hokuriku: 1060, chubu: 1060, kansai: 1190, chugoku: 1460, shikoku: 1460, kyushu: 1760, okinawa: 1760 },
  kanto: { hokkaido: 1460, kitaTohoku: 1060, minamiTohoku: 940, kanto: 940, shinetsu: 940, hokuriku: 940, chubu: 940, kansai: 1060, chugoku: 1190, shikoku: 1190, kyushu: 1460, okinawa: 1460 },
  shinetsu: { hokkaido: 1460, kitaTohoku: 1060, minamiTohoku: 940, kanto: 940, shinetsu: 940, hokuriku: 940, chubu: 940, kansai: 1060, chugoku: 1190, shikoku: 1190, kyushu: 1460, okinawa: 1610 },
  hokuriku: { hokkaido: 1610, kitaTohoku: 1190, minamiTohoku: 1060, kanto: 940, shinetsu: 940, hokuriku: 940, chubu: 940, kansai: 940, chugoku: 1060, shikoku: 1060, kyushu: 1190, okinawa: 1610 },
  chubu: { hokkaido: 1610, kitaTohoku: 1190, minamiTohoku: 1060, kanto: 940, shinetsu: 940, hokuriku: 940, chubu: 940, kansai: 940, chugoku: 1060, shikoku: 1060, kyushu: 1190, okinawa: 1460 },
  kansai: { hokkaido: 1920, kitaTohoku: 1320, minamiTohoku: 1190, kanto: 1060, shinetsu: 1060, hokuriku: 940, chubu: 940, kansai: 940, chugoku: 940, shikoku: 940, kyushu: 1060, okinawa: 1460 },
  chugoku: { hokkaido: 2070, kitaTohoku: 1460, minamiTohoku: 1460, kanto: 1190, shinetsu: 1190, hokuriku: 1060, chubu: 1060, kansai: 940, chugoku: 940, shikoku: 940, kyushu: 940, okinawa: 1460 },
  shikoku: { hokkaido: 2070, kitaTohoku: 1460, minamiTohoku: 1460, kanto: 1190, shinetsu: 1190, hokuriku: 1060, chubu: 1060, kansai: 940, chugoku: 940, shikoku: 940, kyushu: 1060, okinawa: 1460 },
  kyushu: { hokkaido: 2340, kitaTohoku: 1760, minamiTohoku: 1760, kanto: 1460, shinetsu: 1460, hokuriku: 1190, chubu: 1190, kansai: 1060, chugoku: 940, shikoku: 1060, kyushu: 940, okinawa: 1320 },
  okinawa: { hokkaido: 2340, kitaTohoku: 1920, minamiTohoku: 1760, kanto: 1460, shinetsu: 1610, hokuriku: 1610, chubu: 1460, kansai: 1460, chugoku: 1460, shikoku: 1460, kyushu: 1320, okinawa: 940 }
};

// 【メルカリ便・ヤマト統一】ネコポス・ゆうパケット等小型配送料金
export const smallPackageRates = {
  mercarinet: 210,      // メルカリ便ネコポス（全国一律）
  mercaripost: 230,     // メルカリ便ゆうパケット（全国一律）
  nekopos: 230,         // ヤマトネコポス（全国一律）
  yupacket: 250,        // ゆうパケット（全国一律）
  yupacketPost: 200,    // ゆうパケットポスト（全国一律）
  clickpost: 198        // クリックポスト（全国一律）
};

// サイズ判定ロジック（実測値ベース）
export function getSizeCategory(length: number, width: number, thickness: number, weight: number): SizeCode {
  const totalSize = length + width + thickness;
  
  // 宅急便コンパクト: 25×20×5cm以内（または24.8×34cm専用袋）
  if ((length <= 25 && width <= 20 && thickness <= 5) || 
      (length <= 34 && width <= 24.8 && thickness <= 3)) {
    return 'compact';
  }
  
  // 各サイズの判定（3辺の合計で判定）
  if (totalSize <= 60) return '60';
  if (totalSize <= 80) return '80';
  if (totalSize <= 100) return '100';
  if (totalSize <= 120) return '120';
  if (totalSize <= 140) return '140';
  if (totalSize <= 160) return '160';
  if (totalSize <= 180) return '180';
  return '200';
}

// 小型配送可否判定（厚さ・重量制限）
export function canUseSmallPackage(length: number, width: number, thickness: number, weight: number) {
  return {
    mercarinet: thickness <= 2.5 && weight <= 1000 && length <= 31.2 && width <= 22.8,
    mercaripost: thickness <= 3.0 && weight <= 1000 && length <= 32.7 && width <= 22.8,
    nekopos: thickness <= 2.5 && weight <= 1000 && length <= 31.2 && width <= 22.8,
    yupacket: thickness <= 3.0 && weight <= 1000 && length <= 32.7 && width <= 22.8,
    yupacketPost: thickness <= 3.0 && weight <= 2000 && length <= 32.7 && width <= 22.8,
    clickpost: thickness <= 3.4 && weight <= 1000 && length <= 34 && width <= 25
  };
}

// 【統合】料金計算のメイン関数（メルカリ便 vs ヤマト運輸）
export function calculateActualShippingCost(
  fromPrefecture: string, 
  toPrefecture: string, 
  length: number, 
  width: number, 
  thickness: number, 
  weight: number,
  isDropOff: boolean = false // 持ち込み配送の選択
): Array<{service: string, price: number, features: string[], provider: string, hasPickupDiscount?: boolean}> {
  
  const fromRegion = prefectureToRegion[fromPrefecture];
  const toRegion = prefectureToRegion[toPrefecture];
  const sizeCategory = getSizeCategory(length, width, thickness, weight);
  const smallPackageOptions = canUseSmallPackage(length, width, thickness, weight);
  
  const results = [];
  
  // 【小型配送サービス】厚さ・重量制限内の場合
  if (smallPackageOptions.yupacketPost) {
    results.push({
      service: 'ゆうパケットポスト',
      price: smallPackageRates.yupacketPost,
      features: ['全国一律', 'ポスト投函', '追跡あり', '専用箱購入必要'],
      provider: '日本郵便'
    });
  }
  
  if (smallPackageOptions.mercarinet) {
    results.push({
      service: 'メルカリ便（ネコポス）',
      price: smallPackageRates.mercarinet,
      features: ['全国一律', 'ポスト投函', '追跡あり', '匿名配送'],
      provider: 'メルカリ'
    });
  }
  
  if (smallPackageOptions.mercaripost) {
    results.push({
      service: 'メルカリ便（ゆうパケット）',
      price: smallPackageRates.mercaripost,
      features: ['全国一律', 'ポスト投函', '追跡あり', '匿名配送'],
      provider: 'メルカリ'
    });
  }
  
  if (smallPackageOptions.nekopos) {
    results.push({
      service: 'ネコポス',
      price: smallPackageRates.nekopos,
      features: ['全国一律', 'ポスト投函', '追跡あり'],
      provider: 'ヤマト運輸'
    });
  }
  
  if (smallPackageOptions.clickpost) {
    results.push({
      service: 'クリックポスト',
      price: smallPackageRates.clickpost,
      features: ['全国最安', 'ポスト投函', '追跡あり', 'Web決済必須'],
      provider: '日本郵便'
    });
  }
  
  // 【中型配送サービス】宅急便コンパクト・60サイズ
  if (sizeCategory === 'compact' && fromRegion && toRegion) {
    // メルカリ便（宅急便コンパクト）- 持ち込み割引なし
    results.push({
      service: 'メルカリ便（宅急便コンパクト）',
      price: mercariCompactRates[fromRegion][toRegion],
      features: ['専用BOX', '手渡し', '追跡あり', '匿名配送', '持込割引なし'],
      provider: 'メルカリ'
    });
    
    // ヤマト運輸（宅急便コンパクト）
    const yamtoCompactPrice = takkyubinCompactRates[fromRegion][toRegion];
    
    if (isDropOff) {
      // 持ち込み選択時は割引価格のみ表示
      results.push({
        service: 'ヤマト宅急便コンパクト（持込）',
        price: yamtoCompactPrice - 110,
        features: ['専用BOX', '手渡し', '追跡あり', '持込割引-110円', '損害賠償'],
        provider: 'ヤマト運輸',
        hasPickupDiscount: true
      });
    } else {
      // 集荷選択時は通常価格のみ表示
      results.push({
        service: 'ヤマト宅急便コンパクト（集荷）',
        price: yamtoCompactPrice,
        features: ['専用BOX', '手渡し', '追跡あり', '自宅集荷', '損害賠償'],
        provider: 'ヤマト運輸'
      });
    }
  }
  
  if (sizeCategory === '60' && fromRegion && toRegion) {
    // メルカリ便（宅急便60）- 持ち込み割引なし
    results.push({
      service: 'メルカリ便（宅急便60）',
      price: mercari60Rates[fromRegion][toRegion],
      features: ['60cm以内', '手渡し', '追跡あり', '匿名配送', '最大25万円補償'],
      provider: 'メルカリ'
    });
    
    // ヤマト運輸（宅急便60）
    const yamato60Price = takkyubin60Rates[fromRegion][toRegion];
    
    if (isDropOff) {
      // 持ち込み選択時は割引価格のみ表示
      results.push({
        service: 'ヤマト宅急便60（持込）',
        price: yamato60Price - 110,
        features: ['60cm以内', '手渡し', '追跡あり', '持込割引-110円', '最大30万円補償'],
        provider: 'ヤマト運輸',
        hasPickupDiscount: true
      });
    } else {
      // 集荷選択時は通常価格のみ表示
      results.push({
        service: 'ヤマト宅急便60（集荷）',
        price: yamato60Price,
        features: ['60cm以内', '手渡し', '追跡あり', '自宅集荷', '最大30万円補償'],
        provider: 'ヤマト運輸'
      });
    }
  }
  
  // より大きなサイズ（80〜200）の場合は、60サイズの料金をベースに算出
  if (['80', '100', '120', '140', '160', '180', '200'].includes(sizeCategory) && fromRegion && toRegion) {
    const basePrice = takkyubin60Rates[fromRegion][toRegion];
    const multiplier = getSizeMultiplier(sizeCategory);
    const calculatedPrice = Math.round(basePrice * multiplier);
    
    if (isDropOff) {
      results.push({
        service: `ヤマト宅急便${sizeCategory}（持込）`,
        price: calculatedPrice - 110,
        features: [`${sizeCategory}cm以内`, '手渡し', '追跡あり', '持込割引-110円', '最大30万円補償'],
        provider: 'ヤマト運輸',
        hasPickupDiscount: true
      });
    } else {
      results.push({
        service: `ヤマト宅急便${sizeCategory}（集荷）`,
        price: calculatedPrice,
        features: [`${sizeCategory}cm以内`, '手渡し', '追跡あり', '自宅集荷', '最大30万円補償'],
        provider: 'ヤマト運輸'
      });
    }
  }
  
  return results.sort((a, b) => a.price - b.price);
}

// サイズ別料金係数（60サイズを基準とした係数）
function getSizeMultiplier(size: SizeCode): number {
  const multipliers: { [key in SizeCode]: number } = {
    'compact': 0.7,
    '60': 1.0,
    '80': 1.3,
    '100': 1.6,
    '120': 1.9,
    '140': 2.2,
    '160': 2.5,
    '180': 3.8,
    '200': 4.8
  };
  return multipliers[size] || 1.0;
}

// 配送日数の取得
export function getDeliveryDays(serviceName: string, fromRegion: RegionCode, toRegion: RegionCode): string {
  // 同一地域・隣接地域・遠方地域での日数差
  const isSameRegion = fromRegion === toRegion;
  const isNeighborRegion = getRegionDistance(fromRegion, toRegion) <= 1;
  
  if (serviceName.includes('ネコポス') || serviceName.includes('ゆうパケット')) {
    if (isSameRegion) return '翌日';
    if (isNeighborRegion) return '翌日〜2日';
    return '2〜3日';
  }
  
  if (serviceName.includes('宅急便')) {
    if (isSameRegion) return '翌日';
    if (isNeighborRegion) return '翌日';
    if (toRegion === 'okinawa' || fromRegion === 'okinawa') return '2〜3日';
    return '翌日〜2日';
  }
  
  return '1〜3日';
}

// 地域間距離計算（配送日数算出用）
function getRegionDistance(from: RegionCode, to: RegionCode): number {
  const regionOrder: RegionCode[] = [
    'hokkaido', 'kitaTohoku', 'minamiTohoku', 'kanto', 
    'shinetsu', 'hokuriku', 'chubu', 'kansai', 
    'chugoku', 'shikoku', 'kyushu', 'okinawa'
  ];
  
  const fromIndex = regionOrder.indexOf(from);
  const toIndex = regionOrder.indexOf(to);
  
  return Math.abs(fromIndex - toIndex);
}

// 送料節約アドバイス生成
export function generateShippingAdvice(
  length: number, 
  width: number, 
  thickness: number, 
  weight: number,
  results: Array<{service: string, price: number, features: string[], provider: string}>
): string[] {
  const advice = [];
  const smallPackageOptions = canUseSmallPackage(length, width, thickness, weight);
  
  // 厚さ制限による小型配送アドバイス
  if (thickness > 3.0 && thickness <= 3.5) {
    advice.push('📏 厚さを3cm以下に抑えると、ゆうパケット（250円）が利用可能です');
  }
  
  if (thickness > 2.5 && thickness <= 3.0) {
    advice.push('📏 厚さを2.5cm以下に抑えると、ネコポス（230円）が利用可能です');
  }
  
  // 重量制限による節約アドバイス
  if (weight > 1000 && weight <= 2000) {
    advice.push('⚖️ 重量1kg以下なら、より多くの配送選択肢があります');
  }
  
  // メルカリ便 vs ヤマト運輸の比較アドバイス
  const mercariOptions = results.filter(r => r.provider === 'メルカリ');
  const yamatoOptions = results.filter(r => r.provider === 'ヤマト運輸');
  
  if (mercariOptions.length > 0 && yamatoOptions.length > 0) {
    const cheapestMercari = mercariOptions[0];
    const cheapestYamato = yamatoOptions[0];
    
    if (cheapestMercari.price < cheapestYamato.price) {
      advice.push(`💰 メルカリ便が${cheapestYamato.price - cheapestMercari.price}円お得（匿名配送付き）`);
    } else if (cheapestYamato.price < cheapestMercari.price) {
      advice.push(`💰 ヤマト運輸が${cheapestMercari.price - cheapestYamato.price}円お得（持込割引適用時）`);
    }
  }
  
  // サイズダウンアドバイス
  const currentSize = getSizeCategory(length, width, thickness, weight);
  if (currentSize === '60') {
    const compactLimit = Math.max(length, width, thickness);
    if (compactLimit <= 25) {
      advice.push('📦 宅急便コンパクト専用BOXに収まる可能性があります');
    }
  }
  
  return advice;
}

// 価格帯別おすすめ配送方法
export function getRecommendationByPriceRange(totalPrice: number): {
  recommended: string[];
  avoid: string[];
  reasoning: string;
} {
  if (totalPrice < 500) {
    return {
      recommended: ['クリックポスト', 'ゆうパケットポスト', 'メルカリ便（ネコポス）'],
      avoid: ['宅急便60以上'],
      reasoning: '低価格商品では送料を最小限に抑えることが重要'
    };
  } else if (totalPrice < 2000) {
    return {
      recommended: ['メルカリ便（コンパクト）', 'ヤマト宅急便コンパクト', 'メルカリ便（ネコポス）'],
      avoid: ['180サイズ以上'],
      reasoning: '中価格帯では送料とサービス品質のバランスを重視'
    };
  } else {
    return {
      recommended: ['メルカリ便（60〜120）', 'ヤマト宅急便（集荷）'],
      avoid: ['厚さ制限のある小型配送'],
      reasoning: '高価格商品では安全性と追跡機能を最優先'
    };
  }
}

// 後方互換性のための型定義とインターフェース
export interface ShippingService {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  sizeLimit: {
    maxLength: number;
    maxWidth: number;
    maxThickness: number;
    maxWeight: number;
  };
  priceByRegion: {
    same: number;
    neighbor: number;
    distant: number;
  };
  deliveryDays: string;
  features: string[];
  advantages: string[];
}

// 既存コードとの互換性維持用
export const yupacketPostRate = smallPackageRates.yupacketPost;
export const nekoposRate = smallPackageRates.nekopos;
export const yupacketRate = smallPackageRates.yupacket;

// 地域名変換（後方互換性）
export function getRegionFromPrefecture(prefecture: string): string {
  const regionCode = prefectureToRegion[prefecture];
  const regionMap: { [key in RegionCode]: string } = {
    hokkaido: '北海道',
    kitaTohoku: '東北',
    minamiTohoku: '東北', 
    kanto: '関東',
    shinetsu: '中部',
    hokuriku: '中部',
    chubu: '中部',
    kansai: '関西',
    chugoku: '中国',
    shikoku: '四国',
    kyushu: '九州',
    okinawa: '沖縄'
  };
  return regionMap[regionCode] || '関東';
}

// 距離カテゴリ判定（後方互換性）
export function getDistanceCategory(fromRegion: string, toRegion: string): 'same' | 'neighbor' | 'distant' {
  if (fromRegion === toRegion) return 'same';
  
  const neighborMap: { [key: string]: string[] } = {
    '関東': ['中部', '東北'],
    '関西': ['中部', '中国'],
    '中部': ['関東', '関西', '中国'],
    '東北': ['関東', '北海道'],
    '中国': ['関西', '中部', '四国', '九州'],
    '四国': ['中国', '九州'],
    '九州': ['中国', '四国'],
    '北海道': ['東北'],
    '沖縄': []
  };
  
  const neighbors = neighborMap[fromRegion] || [];
  return neighbors.includes(toRegion) ? 'neighbor' : 'distant';
}