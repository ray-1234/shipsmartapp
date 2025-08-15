// utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRules {
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  minThickness: number;
  maxThickness: number;
  minWeight: number;
  maxWeight: number;
}

const validationRules: ValidationRules = {
  minLength: 1,
  maxLength: 100,
  minWidth: 1,
  maxWidth: 100,
  minThickness: 0.1,
  maxThickness: 60,
  minWeight: 1,
  maxWeight: 30000,
};

export const prefectures = [
  '北海道',
  '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
  '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県',
  '沖縄県'
];

export function validateProductInfo(productInfo: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 数値変換
  const length = parseFloat(productInfo.length);
  const width = parseFloat(productInfo.width);
  const thickness = parseFloat(productInfo.thickness);
  const weight = parseFloat(productInfo.weight);

  // 必須項目チェック
  if (!productInfo.category) {
    errors.push('カテゴリを選択してください');
  }

  if (!productInfo.destination) {
    errors.push('配送先を入力してください');
  }

  // 数値の妥当性チェック
  if (isNaN(length) || length <= 0) {
    errors.push('長さは正の数値で入力してください');
  } else if (length < validationRules.minLength || length > validationRules.maxLength) {
    errors.push(`長さは${validationRules.minLength}〜${validationRules.maxLength}cmの範囲で入力してください`);
  }

  if (isNaN(width) || width <= 0) {
    errors.push('幅は正の数値で入力してください');
  } else if (width < validationRules.minWidth || width > validationRules.maxWidth) {
    errors.push(`幅は${validationRules.minWidth}〜${validationRules.maxWidth}cmの範囲で入力してください`);
  }

  if (isNaN(thickness) || thickness <= 0) {
    errors.push('厚みは正の数値で入力してください');
  } else if (thickness < validationRules.minThickness || thickness > validationRules.maxThickness) {
    errors.push(`厚みは${validationRules.minThickness}〜${validationRules.maxThickness}cmの範囲で入力してください`);
  }

  if (isNaN(weight) || weight <= 0) {
    errors.push('重量は正の数値で入力してください');
  } else if (weight < validationRules.minWeight || weight > validationRules.maxWeight) {
    errors.push(`重量は${validationRules.minWeight}〜${validationRules.maxWeight}gの範囲で入力してください`);
  }

  // 配送先の妥当性チェック（プルダウンなので簡素化）
  if (!productInfo.destination) {
    errors.push('配送先を選択してください');
  }

  // 実用性の警告
  if (!errors.length) {
    // 厚み警告
    if (thickness > 3.0) {
      warnings.push('厚み3cm超過：配送方法が限定される可能性があります');
    }
    
    // 重量警告
    if (weight > 1000) {
      warnings.push('重量1kg超過：一部サービスが利用できません');
    }
    
    // サイズバランス警告
    if (length > 50 || width > 50) {
      warnings.push('大型サイズ：宅配便が必要な可能性があります');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// 自動補正機能
export function autoCorrectDestination(input: string): string {
  if (!input) return input;
  
  // よくある入力パターンの自動補正
  const corrections: { [key: string]: string } = {
    '東京': '東京都',
    '大阪': '大阪府',
    '京都': '京都府',
    '北海道': '北海道',
    '神奈川': '神奈川県',
    '愛知': '愛知県',
    '福岡': '福岡県',
    '沖縄': '沖縄県',
  };
  
  for (const [key, value] of Object.entries(corrections)) {
    if (input.includes(key)) {
      return value;
    }
  }
  
  return input;
}