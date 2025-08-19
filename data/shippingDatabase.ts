// data/shippingDatabase.ts - 統合版（realShippingDatabase.tsベース）
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

// 宅急便コンパクトの料金表
export const takkyubinCompactRates: { [fromRegion in RegionCode]: { [toRegion in RegionCode]: number } } = {
  hokkaido: { hokkaido: 720, kitaTohoku: 830, minamiTohoku: 890, kanto: 940, shinetsu: 940, hokuriku: 1000, chubu: 1000, kansai: 1110, chugoku: 1160, shikoku: 1160, kyushu: 1270, okinawa: 1270 },
  kitaTohoku: { hokkaido: 830, kitaTohoku: 720, minamiTohoku: 720, kanto: 780, shinetsu: 780, hokuriku: 830, chubu: 830, kansai: 890, chugoku: 940, shikoku: 940, kyushu: 1050, okinawa: 1110 },
  minamiTohoku: { hokkaido: 890, kitaTohoku: 720, minamiTohoku: 720, kanto: 720, shinetsu: 720, hokuriku: 780, chubu: 780, kansai: 830, chugoku: 940, shikoku: 940, kyushu: 1050, okinawa: 1050 },
  kanto: { hokkaido: 940, kitaTohoku: 780, minamiTohoku: 720, kanto: 720, shinetsu: 720, hokuriku: 720, chubu: 720, kansai: 780, chugoku: 830, shikoku: 830, kyushu: 940, okinawa: 940 },
  shinetsu: { hokkaido: 940, kitaTohoku: 780, minamiTohoku: 720, kanto: 720, shinetsu: 720, hokuriku: 720, chubu: 720, kansai: 780, chugoku: 830, shikoku: 830, kyushu: 940, okinawa: 1000 },
  hokuriku: { hokkaido: 1000, kitaTohoku: 830, minamiTohoku: 780, kanto: 720, shinetsu: 720, hokuriku: 720, chubu: 720, kansai: 720, chugoku: 780, shikoku: 780, kyushu: 830, okinawa: 1000 },
  chubu: { hokkaido: 1000, kitaTohoku: 830, minamiTohoku: 780, kanto: 720, shinetsu: 720, hokuriku: 720, chubu: 720, kansai: 720, chugoku: 780, shikoku: 780, kyushu: 830, okinawa: 940 },
  kansai: { hokkaido: 1110, kitaTohoku: 890, minamiTohoku: 830, kanto: 780, shinetsu: 780, hokuriku: 720, chubu: 720, kansai: 720, chugoku: 720, shikoku: 720, kyushu: 780, okinawa: 940 },
  chugoku: { hokkaido: 1160, kitaTohoku: 940, minamiTohoku: 940, kanto: 830, shinetsu: 830, hokuriku: 780, chubu: 780, kansai: 720, chugoku: 720, shikoku: 720, kyushu: 720, okinawa: 940 },
  shikoku: { hokkaido: 1160, kitaTohoku: 940, minamiTohoku: 940, kanto: 830, shinetsu: 830, hokuriku: 780, chubu: 780, kansai: 720, chugoku: 720, shikoku: 720, kyushu: 780, okinawa: 940 },
  kyushu: { hokkaido: 1270, kitaTohoku: 1050, minamiTohoku: 1050, kanto: 940, shinetsu: 940, hokuriku: 830, chubu: 830, kansai: 780, chugoku: 720, shikoku: 780, kyushu: 720, okinawa: 890 },
  okinawa: { hokkaido: 1270, kitaTohoku: 1110, minamiTohoku: 1050, kanto: 940, shinetsu: 1000, hokuriku: 1000, chubu: 940, kansai: 940, chugoku: 940, shikoku: 940, kyushu: 890, okinawa: 720 }
};

// 宅急便60サイズの料金表
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

// その他のサービス料金
export const yupacketPostRate = 200; // 全国一律
export const nekoposRate = 230; // 全国一律  
export const yupacketRate = 250; // 地域により変動あり（簡易版では固定）

// サイズ判定ロジック
export function getSizeCategory(length: number, width: number, thickness: number, weight: number): SizeCode {
  const totalSize = length + width + thickness;
  
  // 宅急便コンパクト: 25×20×5cm以内
  if (length <= 25 && width <= 20 && thickness <= 5) {
    return 'compact';
  }
  
  // 各サイズの判定
  if (totalSize <= 60) return '60';
  if (totalSize <= 80) return '80';
  if (totalSize <= 100) return '100';
  if (totalSize <= 120) return '120';
  if (totalSize <= 140) return '140';
  if (totalSize <= 160) return '160';
  if (totalSize <= 180) return '180';
  return '200';
}

// 料金計算の統合関数（メイン）
export function calculateActualShippingCost(
  fromPrefecture: string, 
  toPrefecture: string, 
  length: number, 
  width: number, 
  thickness: number, 
  weight: number
): Array<{service: string, price: number, features: string[]}> {
  
  const fromRegion = prefectureToRegion[fromPrefecture];
  const toRegion = prefectureToRegion[toPrefecture];
  const sizeCategory = getSizeCategory(length, width, thickness, weight);
  
  const results = [];
  
  // ゆうパケットポスト (3cm以内、2kg以内)
  if (thickness <= 3 && weight <= 2000) {
    results.push({
      service: 'ゆうパケットポスト',
      price: yupacketPostRate,
      features: ['全国一律', 'ポスト投函', '追跡あり']
    });
  }
  
  // ネコポス (2.5cm以内、1kg以内)
  if (thickness <= 2.5 && weight <= 1000) {
    results.push({
      service: 'ネコポス',
      price: nekoposRate,
      features: ['全国一律', 'ポスト投函', '追跡あり']
    });
  }
  
  // 宅急便コンパクト
  if (sizeCategory === 'compact' && fromRegion && toRegion) {
    results.push({
      service: '宅急便コンパクト',
      price: takkyubinCompactRates[fromRegion][toRegion],
      features: ['専用BOX', '手渡し', '追跡あり']
    });
  }
  
  // 宅急便60サイズ
  if (sizeCategory === '60' && fromRegion && toRegion) {
    results.push({
      service: '宅急便60',
      price: takkyubin60Rates[fromRegion][toRegion],
      features: ['60cm以内', '手渡し', '追跡あり', '損害賠償']
    });
  }
  
  // ゆうパケット (3cm以内、1kg以内)
  if (thickness <= 3 && weight <= 1000) {
    results.push({
      service: 'ゆうパケット',
      price: yupacketRate,
      features: ['ポスト投函', '追跡あり']
    });
  }
  
  return results.sort((a, b) => a.price - b.price);
}

// 後方互換性のための関数（既存コードが動作するように）
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

// 後方互換性のための簡易版サービス定義
export const shippingServices: ShippingService[] = [
  {
    id: 'yupack-post',
    name: 'ゆうパケットポスト',
    displayName: 'ゆうパケットポスト',
    emoji: '📮',
    sizeLimit: { maxLength: 32.7, maxWidth: 22.8, maxThickness: 3.0, maxWeight: 2000 },
    priceByRegion: { same: 200, neighbor: 200, distant: 200 },
    deliveryDays: '1〜3日',
    features: ['コンビニ持込可', '追跡あり', '全国一律料金'],
    advantages: ['最安', '厚さ3cm以内']
  },
  {
    id: 'nekopos',
    name: 'ネコポス',
    displayName: 'ネコポス',
    emoji: '🐱',
    sizeLimit: { maxLength: 31.2, maxWidth: 22.8, maxThickness: 2.5, maxWeight: 1000 },
    priceByRegion: { same: 210, neighbor: 210, distant: 210 },
    deliveryDays: '1〜2日',
    features: ['自宅集荷', '追跡あり', '全国一律料金'],
    advantages: ['集荷可能', '厚さ2.5cm以内']
  }
];

// 後方互換性関数
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