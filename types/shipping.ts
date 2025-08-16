// types/shipping.ts - 更新版
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
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryDays: string;
  features: string[];
  description: string;
  isRecommended?: boolean;
}

export interface ShippingResult {
  summary: {
    from: string;
    to: string;
    size: string;
    weight: string;
  };
  options: ShippingOption[];
}