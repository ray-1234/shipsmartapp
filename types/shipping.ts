// types/shipping.ts - 持ち込み・仕入れ値対応版
export interface ProductInfo {
  category: string;
  length: string;
  width: string;
  thickness: string;
  weight: string;
  destination: string;
  
  // Phase 1 追加項目
  salePrice?: string;        // 販売予定価格
  senderLocation?: string;   // 発送元都道府県
  
  // Phase 2 新機能
  costPrice?: string;        // 仕入れ値（任意項目）
  isDropOff?: boolean;       // 持ち込み配送かどうか（true: 持ち込み, false: 集荷）
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryDays: string;
  features: string[];
  description: string;
  isRecommended?: boolean;
  provider?: string;         // 配送業者（メルカリ、ヤマト運輸等）
  hasPickupDiscount?: boolean; // 持ち込み割引があるかどうか
}

export interface ShippingResult {
  summary: {
    from: string;
    to: string;
    size: string;
    weight: string;
  };
  options: ShippingOption[];
  
  // 持ち込み設定による分析結果
  pickupAnalysis?: {
    isDropOffSelected: boolean;
    potentialSavings: number;  // 持ち込みによる節約額
    recommendation: string;    // 持ち込みに関する推奨事項
  };
}