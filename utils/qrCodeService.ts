// utils/qrCodeService.ts
import { ProductInfo, ShippingOption } from '../types/shipping';

export interface QRCodeData {
  service: string;
  serviceId: string;
  productInfo: {
    category: string;
    dimensions: string;
    weight: string;
    destination: string;
  };
  shippingDetails: {
    price: number;
    deliveryDays: string;
    features: string[];
  };
  timestamp: string;
  qrType: 'shipping_label' | 'tracking' | 'pickup_info';
}

export interface ShippingQRResult {
  qrData: string;
  displayText: string;
  instructions: string[];
  supportedBy: string;
}

// 各配送サービス用のQRコード生成
export function generateShippingQR(
  productInfo: ProductInfo, 
  selectedOption: ShippingOption
): ShippingQRResult {
  
  const qrData: QRCodeData = {
    service: selectedOption.name,
    serviceId: selectedOption.id,
    productInfo: {
      category: productInfo.category,
      dimensions: `${productInfo.length}x${productInfo.width}x${productInfo.thickness}cm`,
      weight: `${productInfo.weight}g`,
      destination: productInfo.destination,
    },
    shippingDetails: {
      price: selectedOption.price,
      deliveryDays: selectedOption.deliveryDays,
      features: selectedOption.features,
    },
    timestamp: new Date().toISOString(),
    qrType: 'shipping_label',
  };

  return {
    qrData: JSON.stringify(qrData),
    displayText: generateDisplayText(qrData),
    instructions: generateInstructions(selectedOption.id),
    supportedBy: getSupportedBy(selectedOption.id),
  };
}

// 持ち込み場所用QRコード生成
export function generatePickupLocationQR(
  productInfo: ProductInfo,
  selectedOption: ShippingOption,
  locationInfo?: {
    storeName: string;
    address: string;
    hours: string;
  }
): ShippingQRResult {
  
  const qrData: QRCodeData = {
    service: selectedOption.name,
    serviceId: selectedOption.id,
    productInfo: {
      category: productInfo.category,
      dimensions: `${productInfo.length}x${productInfo.width}x${productInfo.thickness}cm`,
      weight: `${productInfo.weight}g`,
      destination: productInfo.destination,
    },
    shippingDetails: {
      price: selectedOption.price,
      deliveryDays: selectedOption.deliveryDays,
      features: selectedOption.features,
    },
    timestamp: new Date().toISOString(),
    qrType: 'pickup_info',
  };

  return {
    qrData: JSON.stringify(qrData),
    displayText: generatePickupDisplayText(qrData, locationInfo),
    instructions: generatePickupInstructions(selectedOption.id),
    supportedBy: getSupportedBy(selectedOption.id),
  };
}

function generateDisplayText(qrData: QRCodeData): string {
  return `【${qrData.service}】
📦 ${qrData.productInfo.category}
📏 ${qrData.productInfo.dimensions}
⚖️ ${qrData.productInfo.weight}
🏠 ${qrData.productInfo.destination}
💰 ¥${qrData.shippingDetails.price}
⏰ ${qrData.shippingDetails.deliveryDays}
🕐 ${new Date(qrData.timestamp).toLocaleString('ja-JP')}`;
}

function generatePickupDisplayText(
  qrData: QRCodeData, 
  locationInfo?: { storeName: string; address: string; hours: string }
): string {
  const baseText = generateDisplayText(qrData);
  
  if (locationInfo) {
    return `${baseText}
📍 ${locationInfo.storeName}
🏢 ${locationInfo.address}
🕒 ${locationInfo.hours}`;
  }
  
  return baseText;
}

function generateInstructions(serviceId: string): string[] {
  const instructionMap: { [key: string]: string[] } = {
    'yupack-post': [
      '1. 最寄りの郵便局またはゆうパケットポスト対応店舗へ',
      '2. このQRコードを店員に提示',
      '3. 専用封筒を購入（¥10）',
      '4. 商品を封筒に入れて封をする',
      '5. 宛先ラベルを貼付して投函',
    ],
    'nekopos': [
      '1. ヤマト運輸営業所またはコンビニ（セブン-イレブン、ファミマ、デイリー）へ',
      '2. このQRコードを店員に提示',
      '3. ネコポス専用袋を使用',
      '4. 集荷サービスも利用可能',
      '5. 追跡番号で配送状況を確認',
    ],
    'yupack-light': [
      '1. 郵便局またはローソンへ',
      '2. このQRコードを店員に提示',
      '3. ゆうパケット専用ラベルを受け取り',
      '4. 梱包してラベルを貼付',
      '5. 窓口で差し出し',
    ],
    'takkyubin-compact': [
      '1. ヤマト運輸営業所またはコンビニへ',
      '2. このQRコードを店員に提示',
      '3. 宅急便コンパクト専用BOXを購入（¥70）',
      '4. 商品をBOXに梱包',
      '5. 送り状を記入して発送',
    ],
    'yupack-60': [
      '1. 郵便局窓口へ',
      '2. このQRコードを店員に提示',
      '3. ゆうパック伝票を記入',
      '4. 適切なサイズの箱で梱包',
      '5. 重量・サイズ確認後に発送',
    ],
  };

  return instructionMap[serviceId] || [
    '1. 対応店舗へ持参',
    '2. QRコードを提示',
    '3. 店員の指示に従って発送',
  ];
}

function generatePickupInstructions(serviceId: string): string[] {
  const baseInstructions = generateInstructions(serviceId);
  return [
    '📍 最寄りの対応店舗を確認してから来店してください',
    '🕒 営業時間内に来店してください',
    ...baseInstructions,
  ];
}

function getSupportedBy(serviceId: string): string {
  const supportMap: { [key: string]: string } = {
    'yupack-post': '郵便局、ローソン、ミニストップ',
    'nekopos': 'ヤマト運輸、セブン-イレブン、ファミリーマート、デイリーヤマザキ',
    'yupack-light': '郵便局、ローソン',
    'takkyubin-compact': 'ヤマト運輸、セブン-イレブン、ファミリーマート、デイリーヤマザキ',
    'yupack-60': '郵便局',
  };

  return supportMap[serviceId] || '対応店舗';
}

// QRコードの検証
export function validateQRCode(qrString: string): boolean {
  try {
    const data = JSON.parse(qrString);
    return !!(
      data.service &&
      data.serviceId &&
      data.productInfo &&
      data.shippingDetails &&
      data.timestamp
    );
  } catch {
    return false;
  }
}

// QRコードからデータを抽出
export function parseQRCode(qrString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrString);
    if (validateQRCode(qrString)) {
      return data as QRCodeData;
    }
    return null;
  } catch {
    return null;
  }
}