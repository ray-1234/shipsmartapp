// data/shippingDatabase.ts

export interface SizeLimit {
  maxLength: number;
  maxWidth: number;
  maxThickness: number;
  maxWeight: number;
}

export interface PriceByRegion {
  same: number;      // 同一都道府県
  neighbor: number;  // 隣接地域
  distant: number;   // 遠距離
}

export interface ShippingService {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  sizeLimit: SizeLimit;
  priceByRegion: PriceByRegion;
  deliveryDays: string;
  features: string[];
  advantages: string[];
}

export const shippingServices: ShippingService[] = [
  {
    id: 'yupack-post',
    name: 'ゆうパケットポスト',
    displayName: 'ゆうパケットポスト',
    emoji: '📮',
    sizeLimit: {
      maxLength: 32.7,
      maxWidth: 22.8,
      maxThickness: 3.0,
      maxWeight: 2000,
    },
    priceByRegion: {
      same: 200,
      neighbor: 200,
      distant: 200,
    },
    deliveryDays: '1〜3日',
    features: ['コンビニ持込可', '追跡あり', '全国一律料金'],
    advantages: ['最安', '厚さ3cm以内'],
  },
  {
    id: 'nekopos',
    name: 'ネコポス',
    displayName: 'ネコポス',
    emoji: '🐱',
    sizeLimit: {
      maxLength: 31.2,
      maxWidth: 22.8,
      maxThickness: 2.5,
      maxWeight: 1000,
    },
    priceByRegion: {
      same: 210,
      neighbor: 210,
      distant: 210,
    },
    deliveryDays: '1〜2日',
    features: ['自宅集荷', '追跡あり', '全国一律料金'],
    advantages: ['集荷可能', '厚さ2.5cm以内'],
  },
  {
    id: 'yupack-light',
    name: 'ゆうパケット',
    displayName: 'ゆうパケット',
    emoji: '📦',
    sizeLimit: {
      maxLength: 34.0,
      maxWidth: 25.0,
      maxThickness: 3.0,
      maxWeight: 1000,
    },
    priceByRegion: {
      same: 250,
      neighbor: 300,
      distant: 350,
    },
    deliveryDays: '1〜3日',
    features: ['ポスト投函', '追跡あり', '郵便局持込'],
    advantages: ['ポスト投函', '3cm対応'],
  },
  {
    id: 'takkyubin-compact',
    name: '宅急便コンパクト',
    displayName: '宅急便コンパクト',
    emoji: '📦',
    sizeLimit: {
      maxLength: 25.0,
      maxWidth: 20.0,
      maxThickness: 5.0,
      maxWeight: 30000, // 実質無制限
    },
    priceByRegion: {
      same: 450,
      neighbor: 500,
      distant: 600,
    },
    deliveryDays: '翌日〜2日',
    features: ['専用BOX', '追跡あり', '手渡し'],
    advantages: ['厚物対応', '翌日配達'],
  },
  {
    id: 'yupack-60',
    name: 'ゆうパック60',
    displayName: 'ゆうパック(60サイズ)',
    emoji: '📮',
    sizeLimit: {
      maxLength: 60.0,
      maxWidth: 60.0,
      maxThickness: 60.0,
      maxWeight: 25000,
    },
    priceByRegion: {
      same: 810,
      neighbor: 870,
      distant: 970,
    },
    deliveryDays: '1〜2日',
    features: ['大型対応', '追跡あり', '損害賠償'],
    advantages: ['大きいサイズ', '補償あり'],
  },
];

// 地域判定用のデータ
export const regionMapping: { [key: string]: string[] } = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '関西': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
  '沖縄': ['沖縄県'],
};

export function getRegionFromPrefecture(prefecture: string): string {
  for (const [region, prefectures] of Object.entries(regionMapping)) {
    if (prefectures.includes(prefecture)) {
      return region;
    }
  }
  return '関東'; // デフォルト
}

export function getDistanceCategory(fromRegion: string, toRegion: string): 'same' | 'neighbor' | 'distant' {
  if (fromRegion === toRegion) {
    return 'same';
  }
  
  // 隣接地域の定義
  const neighborRegions: { [key: string]: string[] } = {
    '関東': ['中部', '東北'],
    '関西': ['中部', '中国'],
    '中部': ['関東', '関西', '中国'],
    '東北': ['関東', '北海道'],
    '中国': ['関西', '中部', '四国', '九州'],
    '四国': ['中国', '九州'],
    '九州': ['中国', '四国'],
    '北海道': ['東北'],
    '沖縄': [], // 沖縄は全て遠距離
  };
  
  const neighbors = neighborRegions[fromRegion] || [];
  if (neighbors.includes(toRegion)) {
    return 'neighbor';
  }
  
  return 'distant';
}