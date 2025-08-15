// utils/simpleCalculator.ts
import { ProductInfo, ShippingResult, ShippingOption } from '../types/shipping';

export function calculateShipping(productInfo: ProductInfo): ShippingResult {
  // Phase 1: 固定データでの結果返却
  // TODO: Phase 2で実際の計算ロジックに置き換え
  
  const options: ShippingOption[] = [
    {
      id: 'yupack-post',
      name: '🥇 ゆうパケットポスト',
      price: 210,
      deliveryDays: '1〜2日でお届け',
      features: ['コンビニ持込可', '追跡あり', '最安'],
      description: '',
      isRecommended: true,
    },
    {
      id: 'nekopos',
      name: '🥈 ネコポス',
      price: 230,
      deliveryDays: '1〜2日でお届け',
      features: ['自宅集荷', '追跡あり'],
      description: '',
    },
    {
      id: 'takkyubin-compact',
      name: '🥉 宅急便コンパクト',
      price: 450,
      deliveryDays: '翌日お届け',
      features: ['専用BOX', '追跡あり', '最速'],
      description: '',
    },
  ];

  const result: ShippingResult = {
    summary: {
      from: '東京都',
      to: productInfo.destination,
      size: `厚さ${productInfo.thickness}cm`,
      weight: `${productInfo.weight}g`,
    },
    options: options,
  };

  return result;
}