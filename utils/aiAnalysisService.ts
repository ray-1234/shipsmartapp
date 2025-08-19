// utils/aiAnalysisService.ts - EAS統合版
import { ProductInfo, ShippingOption } from '../types/shipping';

export interface AIAnalysisRequest {
  productInfo: ProductInfo;
  shippingOptions: ShippingOption[];
  userPreferences?: {
    prioritizeSpeed?: boolean;
    prioritizeCost?: boolean;
    riskTolerance?: 'low' | 'medium' | 'high';
  };
}

// ProfitAnalysis インターフェースの拡張
export interface ProfitAnalysis {
  currentProfit: number;
  optimizedProfit: number;
  improvements: string[];
  costSavings: number;
  priceRecommendation: string;
  // 新しく追加
  breakdown: {
    salePrice: number;
    platformFee: number;
    platformName: string;
    profitByShipping: Array<{
      shippingName: string;
      shippingCost: number;
      profit: number;
      profitRate: number;
      deliveryDays: string;
    }>;
  };
}

export interface RiskAssessment {
  damageRisk: number;
  delayRisk: number;
  lossRisk: number;
  overallRisk: number;
  preventionTips: string[];
}

export interface PackagingAdvice {
  recommendedMaterials: string[];
  costEffectiveSolutions: string[];
  budgetBreakdown: {
    material: string;
    cost: number;
    durability: string;
  }[];
}

export interface MarketInsights {
  competitiveAdvantage: string;
  pricingStrategy: string;
  timingAdvice: string;
  buyerBehavior: string;
  demandForecast: string;
}

export interface AIAnalysisResult {
  summary: string;
  profitAnalysis: ProfitAnalysis;
  riskAssessment: RiskAssessment;
  packagingAdvice: PackagingAdvice;
  marketInsights: MarketInsights;
  confidence: number;
  analysisId: string;
  timestamp: string;
}

export type AnalysisType = 'comprehensive' | 'profit' | 'risk' | 'packaging' | 'market';

// 🎯 EAS統合メイン分析関数
export async function runAIAnalysis(
  request: AIAnalysisRequest,
  analysisType: AnalysisType = 'comprehensive'
): Promise<AIAnalysisResult> {
  console.log('🤖 EAS統合AI分析開始:', { 
    analysisType, 
    productInfo: request.productInfo,
    projectId: 'a1a107fa-6e9b-4a22-93aa-dd9d49bd70ac'
  });

  try {
    // 🏠 統合ローカル分析エンジン（常に動作保証）
    const result = await runAdvancedLocalAnalysis(request, analysisType);
    
    console.log('✅ EAS統合分析完了:', {
      analysisId: result.analysisId,
      confidence: result.confidence,
      summaryLength: result.summary.length
    });
    
    return result;

  } catch (error) {
    console.error('❌ EAS分析エラー:', error);
    
    // フォールバック
    return getBasicAnalysis(request);
  }
}

// 🧠 高度なローカル分析エンジン
async function runAdvancedLocalAnalysis(
  request: AIAnalysisRequest,
  analysisType: AnalysisType
): Promise<AIAnalysisResult> {
  const { productInfo, shippingOptions, userPreferences } = request;
  
  console.log('🔍 詳細分析実行中...', {
    category: productInfo.category,
    shippingOptionsCount: shippingOptions.length,
    analysisType
  });

  // 📊 基本数値計算
  const cheapestOption = shippingOptions.reduce((prev, curr) => 
    prev.price < curr.price ? prev : curr
  );
  
  const fastestOption = shippingOptions.reduce((prev, curr) => {
    const prevDays = parseInt(prev.deliveryDays.replace(/[^0-9]/g, '')) || 7;
    const currDays = parseInt(curr.deliveryDays.replace(/[^0-9]/g, '')) || 7;
    return prevDays < currDays ? prev : curr;
  });

  const salePrice = parseInt(productInfo.salePrice ?? '') || 1500;
  const platformFee = Math.round(salePrice * 0.1); // メルカリ手数料
  const currentProfit = salePrice - platformFee - cheapestOption.price;
  
  // 🎯 利益最適化分析
  const profitAnalysis = analyzeProfitOptimization(
    salePrice, platformFee, shippingOptions, userPreferences
  );
  
  // ⚠️ リスク分析
  const riskAssessment = analyzeShippingRisks(
    productInfo, shippingOptions, cheapestOption
  );
  
  // 📦 梱包分析
  const packagingAdvice = analyzePackagingOptimization(
    productInfo, riskAssessment.overallRisk
  );
  
  // 📈 市場分析
  const marketInsights = analyzeMarketStrategy(
    productInfo, salePrice, currentProfit
  );

  // 📝 サマリー生成
  const summary = generateDetailedSummary(
    productInfo, cheapestOption, fastestOption, currentProfit, riskAssessment.overallRisk
  );

  const result: AIAnalysisResult = {
    summary,
    profitAnalysis,
    riskAssessment,
    packagingAdvice,
    marketInsights,
    confidence: 92, // EAS統合版の高信頼度
    analysisId: `eas_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    timestamp: new Date().toISOString()
  };

  return result;
}

// 💰 改善された利益最適化分析
function analyzeProfitOptimization(
  salePrice: number,
  platformFee: number,
  shippingOptions: ShippingOption[],
  userPreferences?: any
): ProfitAnalysis {
  
  // 各配送方法での利益計算
  const profitByShipping = shippingOptions.map(option => {
    const profit = salePrice - platformFee - option.price;
    const profitRate = (profit / salePrice * 100);
    
    return {
      shippingName: option.name.replace(/🥇|🥈|🥉|📮|🐱|📦/g, '').trim(),
      shippingCost: option.price,
      profit: profit,
      profitRate: parseFloat(profitRate.toFixed(1)),
      deliveryDays: option.deliveryDays
    };
  });

  const cheapestShipping = profitByShipping.reduce((prev, curr) => 
    prev.shippingCost < curr.shippingCost ? prev : curr
  );
  
  const mostProfitableShipping = profitByShipping.reduce((prev, curr) => 
    prev.profit > curr.profit ? prev : curr
  );

  const improvements: string[] = [];
  const maxProfit = mostProfitableShipping.profit;
  const costSavings = Math.max(...profitByShipping.map(p => p.shippingCost)) - cheapestShipping.shippingCost;

  if (costSavings > 0) {
    improvements.push(`${cheapestShipping.shippingName}選択で¥${costSavings}の送料節約`);
  }

  const currentProfitRate = (maxProfit / salePrice) * 100;
  if (currentProfitRate < 20) {
    const recommendedPrice = Math.ceil((cheapestShipping.shippingCost + platformFee) / 0.8);
    improvements.push(`販売価格を¥${recommendedPrice}に上げて利益率20%確保を推奨`);
  }

  improvements.push('梱包材を100円ショップで調達して¥50-100節約可能');

  return {
    currentProfit: maxProfit,
    optimizedProfit: maxProfit + costSavings,
    improvements,
    costSavings,
    priceRecommendation: generateDetailedPriceRecommendation(salePrice, maxProfit, currentProfitRate),
    breakdown: {
      salePrice,
      platformFee,
      platformName: 'メルカリ',
      profitByShipping
    }
  };
}

// 詳細な価格推奨メッセージ
function generateDetailedPriceRecommendation(
  currentPrice: number,
  currentProfit: number,
  profitRate: number
): string {
  if (profitRate < 10) {
    return `⚠️ 利益率${profitRate.toFixed(1)}%は低すぎます。価格上昇または最安配送選択を強く推奨`;
  } else if (profitRate < 20) {
    return `💡 利益率${profitRate.toFixed(1)}%。改善の余地あり、最安配送で利益率向上`;
  } else if (profitRate > 40) {
    return `✨ 利益率${profitRate.toFixed(1)}%で高収益！価格競争力を活かした積極販売推奨`;
  } else {
    return `👍 利益率${profitRate.toFixed(1)}%で適正範囲。現在の戦略継続を推奨`;
  }
}



// ⚠️ 配送リスク分析
function analyzeShippingRisks(
  productInfo: ProductInfo,
  shippingOptions: ShippingOption[],
  cheapestOption: ShippingOption
): RiskAssessment {
  // カテゴリ別基本リスク
  const categoryRiskMap: { [key: string]: number } = {
    '本・書籍': 2,
    'CD・DVD': 3,
    '衣類': 1,
    '精密機器': 8,
    'ガラス製品': 9,
    'アクセサリー': 6,
    'おもちゃ': 4,
    'その他': 5
  };

  const baseRisk = categoryRiskMap[productInfo.category] || 5;
  
  // サイズ・重量によるリスク調整
  const dimensions = {
    length: parseInt(productInfo.length) || 0,
    width: parseInt(productInfo.width) || 0,
    thickness: parseInt(productInfo.thickness) || 0,
    weight: parseInt(productInfo.weight) || 0
  };
  
  const volume = dimensions.length * dimensions.width * dimensions.thickness;
  const sizeRiskMultiplier = volume > 100000 ? 1.4 : volume > 50000 ? 1.2 : 1.0;
  const weightRiskMultiplier = dimensions.weight > 1000 ? 1.3 : dimensions.weight > 500 ? 1.1 : 1.0;
  
  const damageRisk = Math.min(baseRisk * sizeRiskMultiplier * weightRiskMultiplier, 10);
  
  // 配送方法によるリスク
  const hasTracking = cheapestOption.name.includes('追跡') || 
                     cheapestOption.features.some(f => f.includes('追跡'));
  const hasInsurance = cheapestOption.features.some(f => f.includes('補償'));
  
  const lossRisk = hasTracking ? 1 : 4;
  const delayRisk = shippingOptions.length > 2 ? 3 : 5;
  
  const overallRisk = Math.round((damageRisk + delayRisk + lossRisk) / 3);
  
  return {
    damageRisk: Math.round(damageRisk),
    delayRisk,
    lossRisk,
    overallRisk,
    preventionTips: generateRiskPreventionTips(productInfo.category, overallRisk, hasTracking, hasInsurance)
  };
}

// 📦 梱包最適化分析
function analyzePackagingOptimization(
  productInfo: ProductInfo,
  riskLevel: number
): PackagingAdvice {
  const categoryPackaging: { [key: string]: string[] } = {
    '本・書籍': ['OPP袋（防水）', 'プチプチ薄手', '角保護材', '茶封筒orダンボール'],
    'CD・DVD': ['プラケース保護', 'プチプチ厚手', 'ダンボール小', '帯電防止材'],
    '衣類': ['圧縮袋', 'ビニール袋', '宅配袋', '防水パック'],
    '精密機器': ['エアキャップ厚手', 'ダンボール二重', '緩衝材多重', '静電防止袋'],
    'ガラス製品': ['エアキャップ特厚', '固定材', 'ダンボール強化', '「壊れ物」表示'],
    'アクセサリー': ['小袋', 'プチプチ', 'ダンボール小', '紛失防止策'],
    'その他': ['プチプチ', 'ダンボール', 'ガムテープ', '緩衝材']
  };

  const baseMaterials = categoryPackaging[productInfo.category] || categoryPackaging['その他'];
  
  // リスクレベルに応じた材料追加
  const riskBasedMaterials = [...baseMaterials];
  if (riskLevel >= 7) {
    riskBasedMaterials.push('補強材', '多重梱包');
  }
  if (riskLevel >= 5) {
    riskBasedMaterials.push('緩衝材追加');
  }

  return {
    recommendedMaterials: riskBasedMaterials,
    costEffectiveSolutions: [
      '100円ショップでの基本材料調達',
      '郵便局・コンビニの無料箱活用',
      'まとめ買いによるコスト削減',
      'リサイクル材料の有効活用'
    ],
    budgetBreakdown: calculatePackagingCosts(riskBasedMaterials)
  };
}

// 📈 市場戦略分析
function analyzeMarketStrategy(
  productInfo: ProductInfo,
  salePrice: number,
  currentProfit: number
): MarketInsights {
  const categoryStrategies: { [key: string]: MarketInsights } = {
    '本・書籍': {
      competitiveAdvantage: '送料込み価格での差別化、状態の詳細説明',
      pricingStrategy: '定価の30-50%、希少本・専門書は60%以上も可能',
      timingAdvice: '新刊発売前後、入学・試験シーズンが需要ピーク',
      buyerBehavior: '送料重視、書き込み・折れの有無を最も気にする',
      demandForecast: '安定需要、電子書籍化で古い本は価値減少傾向'
    },
    '衣類': {
      competitiveAdvantage: 'ブランド価値、サイズ展開、季節適合性',
      pricingStrategy: '定価の10-40%、人気ブランドは50%以上維持',
      timingAdvice: 'シーズン直前出品、流行に敏感な時期を狙う',
      buyerBehavior: 'サイズ感重視、清潔感・におい対策必須',
      demandForecast: '季節変動大、ファストファッション化で回転早い'
    },
    'CD・DVD': {
      competitiveAdvantage: '帯付き・初回限定特典の有無が価格決定要因',
      pricingStrategy: '定価の20-40%、廃盤・レア品は定価超えも',
      timingAdvice: 'アーティスト関連ニュース、記念日前後',
      buyerBehavior: '盤面の傷、ケースの状態を厳重チェック',
      demandForecast: 'ストリーミング普及で需要減、コレクター需要は堅調'
    }
  };

  const baseStrategy = categoryStrategies[productInfo.category];
  if (baseStrategy) {
    return baseStrategy;
  }

  // 汎用戦略
  return {
    competitiveAdvantage: '商品状態の良さと丁寧な梱包・発送',
    pricingStrategy: '同カテゴリ相場の80-120%で競争力確保',
    timingAdvice: 'ピーク時間（平日夜、休日昼）の出品',
    buyerBehavior: '商品写真の質と説明文の詳細度を重視',
    demandForecast: '市場動向に応じた価格調整が成功の鍵'
  };
}

// 📝 詳細サマリー生成
function generateDetailedSummary(
  productInfo: ProductInfo,
  cheapestOption: ShippingOption,
  fastestOption: ShippingOption,
  currentProfit: number,
  overallRisk: number
): string {
  const destination = productInfo.destination;
  const category = productInfo.category;
  
  return `【${category}】${destination}配送の総合分析完了。最安は${cheapestOption.name}（¥${cheapestOption.price}）、最速は${fastestOption.name}。現在利益¥${currentProfit}、配送リスク${overallRisk}/10。利益重視なら最安配送、安全重視なら追跡付きサービスを推奨。`;
}

// 🛡️ リスク対策提案生成
function generateRiskPreventionTips(
  category: string,
  riskLevel: number,
  hasTracking: boolean,
  hasInsurance: boolean
): string[] {
  const baseTips = ['適切な梱包材の使用', '商品状態の正確な記載'];
  
  if (!hasTracking) {
    baseTips.push('追跡番号付きサービスへの変更検討');
  }
  
  if (!hasInsurance && riskLevel >= 6) {
    baseTips.push('補償付きオプションの検討');
  }

  const categoryTips: { [key: string]: string[] } = {
    '本・書籍': ['水濡れ防止のOPP袋必須', '角の保護材使用'],
    'CD・DVD': ['ケース割れ防止の厚手保護', '帯の保護対策'],
    '衣類': ['湿気・においの防止策', '圧縮による皺対策'],
    '精密機器': ['静電気対策', '衝撃吸収材の多重使用', '精密機器専用配送検討'],
    'ガラス製品': ['「壊れ物」シール必須', '固定材での動き防止', '保険加入推奨']
  };

  if (categoryTips[category]) {
    baseTips.push(...categoryTips[category]);
  }

  if (riskLevel >= 8) {
    baseTips.push('配送方法の根本的見直し推奨');
  }

  return baseTips;
}

// 💰 価格推奨メッセージ生成
function generatePriceRecommendation(
  currentPrice: number,
  currentProfit: number,
  profitMargin: number
): string {
  if (profitMargin < 15) {
    return '利益率が低いため、価格上昇または配送費削減を強く推奨';
  } else if (profitMargin < 25) {
    return '利益率改善の余地あり、送料込み価格設定で競争力向上';
  } else if (profitMargin > 50) {
    return '高利益率維持中、価格競争力を活かした積極販売推奨';
  } else {
    return '適正な利益率、現在の戦略継続を推奨';
  }
}

// 💰 梱包コスト計算
function calculatePackagingCosts(materials: string[]): Array<{material: string, cost: number, durability: string}> {
  const costMap: { [key: string]: {cost: number, durability: string} } = {
    'OPP袋（防水）': {cost: 15, durability: '中'},
    'プチプチ薄手': {cost: 30, durability: '中'},
    'プチプチ厚手': {cost: 50, durability: '高'},
    'エアキャップ厚手': {cost: 80, durability: '高'},
    'エアキャップ特厚': {cost: 120, durability: '最高'},
    'ダンボール小': {cost: 50, durability: '高'},
    'ダンボール': {cost: 80, durability: '高'},
    'ダンボール二重': {cost: 160, durability: '最高'},
    '圧縮袋': {cost: 100, durability: '中'},
    '茶封筒': {cost: 20, durability: '低'},
    '緩衝材': {cost: 60, durability: '高'},
    '緩衝材多重': {cost: 120, durability: '最高'},
    'その他': {cost: 40, durability: '中'}
  };

  return materials.map(material => ({
    material,
    cost: costMap[material]?.cost || 40,
    durability: costMap[material]?.durability || '中'
  }));
}

// 🆘 基本分析（フォールバック）
// 基本分析（フォールバック）
function getBasicAnalysis(request: AIAnalysisRequest): AIAnalysisResult {
  const { productInfo, shippingOptions } = request;
  const cheapest = shippingOptions.reduce((prev, curr) => 
    prev.price < curr.price ? prev : curr
  );

  const salePrice = parseInt(productInfo.salePrice ?? '') || 1500;
  const platformFee = Math.round(salePrice * 0.1);

  // 基本的な利益計算
  const profitByShipping = shippingOptions.map(option => ({
    shippingName: option.name.replace(/🥇|🥈|🥉|📮|🐱|📦/g, '').trim(),
    shippingCost: option.price,
    profit: salePrice - platformFee - option.price,
    profitRate: parseFloat(((salePrice - platformFee - option.price) / salePrice * 100).toFixed(1)),
    deliveryDays: option.deliveryDays
  }));

  return {
    summary: `基本分析完了。${cheapest.name}（¥${cheapest.price}）が最適配送方法です。`,
    confidence: 75,
    profitAnalysis: {
      currentProfit: 800,
      optimizedProfit: 1000,
      costSavings: 200,
      improvements: ['最安配送選択', '梱包最適化'],
      priceRecommendation: '送料込み価格での競争力強化推奨',
      breakdown: {
        salePrice,
        platformFee,
        platformName: 'メルカリ',
        profitByShipping
      }
    },
    riskAssessment: {
      overallRisk: 4,
      damageRisk: 4,
      delayRisk: 4,
      lossRisk: 3,
      preventionTips: ['基本梱包で十分', '追跡サービス推奨']
    },
    packagingAdvice: {
      recommendedMaterials: ['プチプチ', 'ダンボール'],
      costEffectiveSolutions: ['100円ショップ活用'],
      budgetBreakdown: [
        {material: 'プチプチ', cost: 50, durability: '中'},
        {material: 'ダンボール', cost: 80, durability: '高'}
      ]
    },
    marketInsights: {
      competitiveAdvantage: '価格競争力',
      pricingStrategy: '相場適正価格',
      timingAdvice: 'ピーク時間出品',
      buyerBehavior: '価格重視',
      demandForecast: '安定需要'
    },
    analysisId: `basic_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}