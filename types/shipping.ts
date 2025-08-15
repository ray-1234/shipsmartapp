// types/shipping.ts
export interface ProductInfo {
  category: string;
  length: string;
  width: string;
  thickness: string;
  weight: string;
  destination: string;
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