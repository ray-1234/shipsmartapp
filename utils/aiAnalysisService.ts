// utils/aiAnalysisService.ts - Vercel API統合版（完全版）
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

export interface ProfitAnalysis {
  currentProfit: number;
  optimizedProfit: number;
  improvements: string[];
  costSavings: number;
  priceRecommendation: string;
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

// 🎯 統合AI分析関数（Vercel API + ローカル分析）
export async function runAIAnalysis(
  request: AIAnalysisRequest,
  analysisType: AnalysisType = 'comprehensive'
): Promise<AIAnalysisResult> {
  console.log('🤖 統合AI分析開始:', { 
    analysisType, 
    productInfo: request.productInfo,
    shippingOptionsCount: request.shippingOptions?.length || 0
  });

  try {
    // 📡 Step 1: Vercel API呼び出しを試行
    const vercelResult = await tryVercelAPI(request, analysisType);
    if (vercelResult) {
      console.log('✅ Vercel API成功 - 高品質分析完了');
      return vercelResult;
    }

    // 🏠 Step 2: Vercel APIが失敗した場合はローカル高度分析
    console.log('🏠 ローカル高度分析にフォールバック');
    return await runAdvancedLocalAnalysis(request, analysisType);

  } catch (error) {
    console.error('❌ AI分析エラー:', error);
    
    // 🆘 Step 3: 最終フォールバック
    return getBasicAnalysis(request);
  }
}

// 🌐 Vercel API呼び出し試行
async function tryVercelAPI(
  request: AIAnalysisRequest,
  analysisType: AnalysisType
): Promise<AIAnalysisResult | null> {
  
  // Vercel APIエンドポイント（実際のドメイン）
  const vercelEndpoints = [
    'https://ship-smart-alpha.vercel.app/api/ai-analysis', // 正式エンドポイント
  ];

  const timeoutMs = 15000; // 15秒タイムアウト
  
  for (const endpoint of vercelEndpoints) {
    try {
      console.log(`🔍 Vercel API試行: ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generateVercelPrompt(request.productInfo, request.shippingOptions, analysisType),
          analysisType,
          model: 'gpt-4o',
          maxTokens: 1200
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`⚠️ Vercel API HTTP error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log('✅ Vercel APIレスポンス受信:', {
        hasAnalysis: !!data.analysis,
        metadata: data.metadata
      });

      // Vercel APIレスポンスを変換
      return transformVercelResponse(data, request, analysisType);

    } catch (error: any) {
      console.warn(`⚠️ Vercel API呼び出し失敗: ${endpoint}`, error.message);
      continue;
    }
  }

  console.log('🔄 すべてのVercel APIエンドポイント試行完了 - ローカル分析に移行');
  return null;
}

// 🔄 Vercel APIレスポンス変換
function transformVercelResponse(
  vercelData: any,
  request: AIAnalysisRequest,
  analysisType: AnalysisType
): AIAnalysisResult {
  
  let analysis;
  try {
    analysis = typeof vercelData.analysis === 'string' 
      ? JSON.parse(vercelData.analysis) 
      : vercelData.analysis;
  } catch (error) {
    console.warn('⚠️ Vercel JSON解析失敗、フォールバック処理');
    analysis = vercelData.analysis || {};
  }

  // 基本数値計算
  const salePrice = parseInt(request.productInfo.salePrice || '') || 0;
  const platformFee = Math.round(salePrice * 0.1);
  const cheapestOption = request.shippingOptions.length > 0 
    ? request.shippingOptions.reduce((prev, curr) => prev.price < curr.price ? prev : curr)
    : { price: 0, name: '未設定' };
  const currentProfit = salePrice - platformFee - cheapestOption.price;

  return {
    summary: analysis.summary || `${request.productInfo.category}のVercel AI分析が完了しました。配送最適化により利益向上が期待できます。`,
    profitAnalysis: {
      currentProfit: analysis.profitAnalysis?.currentProfit || currentProfit,
      optimizedProfit: analysis.profitAnalysis?.optimizedProfit || Math.max(currentProfit, currentProfit + 100),
      improvements: analysis.profitAnalysis?.improvements || [
        'Vercel AI分析による配送方法の最適化',
        '梱包効率化でコスト削減を実現',
        '価格戦略の見直しによる利益向上'
      ],
      costSavings: (analysis.profitAnalysis?.optimizedProfit || currentProfit + 100) - currentProfit,
      priceRecommendation: analysis.profitAnalysis?.priceRecommendation || 
        (currentProfit > 0 ? 'Vercel AI推奨: 現在の価格設定は適正です' : 'Vercel AI推奨: 価格の見直しを検討してください'),
      breakdown: {
        salePrice,
        platformFee,
        platformName: 'メルカリ',
        profitByShipping: request.shippingOptions.map(option => ({
          shippingName: option.name.replace(/🥇|🥈|🥉|📮|🐱|📦/g, '').trim(),
          shippingCost: option.price,
          profit: salePrice - platformFee - option.price,
          profitRate: ((salePrice - platformFee - option.price) / salePrice) * 100,
          deliveryDays: option.deliveryDays
        }))
      }
    },
    riskAssessment: {
      damageRisk: analysis.riskAssessment?.damageRisk || assessCategoryRisk(request.productInfo.category).damage,
      delayRisk: analysis.riskAssessment?.delayRisk || 3,
      lossRisk: analysis.riskAssessment?.lossRisk || 2,
      overallRisk: analysis.riskAssessment?.overallRisk || 3,
      preventionTips: analysis.riskAssessment?.preventionTips || [
        'Vercel AI推奨: 適切な梱包材での保護',
        '配送方法の特性を理解した選択',
        '商品説明での注意喚起徹底'
      ]
    },
    packagingAdvice: {
      recommendedMaterials: analysis.packagingAdvice?.recommendedMaterials || 
        getRecommendedMaterials(request.productInfo.category),
      costEffectiveSolutions: analysis.packagingAdvice?.costEffectiveSolutions || [
        'Vercel AI推奨: 100円ショップでの梱包材調達',
        '使い回し可能な資材の選択',
        'サイズに最適化した梱包設計'
      ],
      budgetBreakdown: calculatePackagingCosts(
        analysis.packagingAdvice?.recommendedMaterials || 
        getRecommendedMaterials(request.productInfo.category)
      )
    },
    marketInsights: {
      competitiveAdvantage: analysis.marketInsights?.competitiveAdvantage || 
        'Vercel AI分析による配送効率化で競争力向上',
      pricingStrategy: analysis.marketInsights?.pricingStrategy || 
        '送料込み価格での競争力強化戦略',
      timingAdvice: analysis.marketInsights?.timingAdvice || 
        'Vercel AI推奨: 平日午前中の出品で閲覧数最大化',
      buyerBehavior: analysis.marketInsights?.buyerBehavior || 
        '送料無料表示で購買意欲向上効果',
      demandForecast: analysis.marketInsights?.demandForecast || 
        getDemandForecast(request.productInfo.category)
    },
    confidence: 95, // Vercel API統合版の最高信頼度
    analysisId: `vercel_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    timestamp: new Date().toISOString()
  };
}

// 📝 Vercel API用プロンプト生成
function generateVercelPrompt(
  productInfo: ProductInfo,
  shippingOptions: ShippingOption[],
  analysisType: string
): string {
  const salePrice = productInfo.salePrice || '未設定';
  const category = productInfo.category || 'その他';
  const dimensions = `${productInfo.length || '?'}×${productInfo.width || '?'}×${productInfo.thickness || '?'}cm`;
  const weight = `${productInfo.weight || '?'}g`;
  
  const optionsText = shippingOptions.length > 0 
    ? shippingOptions.map((option, index) => 
        `${index + 1}. ${option.name}: ${option.price}円 (${option.deliveryDays})`
      ).join('\n')
    : '配送オプション計算中';

  return `
【フリマ配送診断 - ${analysisType}分析】

商品情報:
- カテゴリ: ${category}
- 販売価格: ${salePrice}円
- サイズ: ${dimensions}
- 重量: ${weight}
- 発送元: ${productInfo.senderLocation || '東京都'}
- 配送先: ${productInfo.destination || '全国'}

配送オプション:
${optionsText}

分析要求: ${analysisType}

上記情報を基に、フリマ出品者向けの実践的で具体的なアドバイスをJSON形式で提供してください。
特に以下の構造で回答してください：

{
  "summary": "分析結果の要約（100文字程度）",
  "profitAnalysis": {
    "currentProfit": 数値,
    "optimizedProfit": 数値,
    "improvements": ["改善提案1", "改善提案2", "改善提案3"],
    "priceRecommendation": "価格戦略提案"
  },
  "riskAssessment": {
    "overallRisk": 1-10,
    "damageRisk": 1-10,
    "delayRisk": 1-10,
    "lossRisk": 1-10,
    "preventionTips": ["対策1", "対策2", "対策3"]
  },
  "packagingAdvice": {
    "recommendedMaterials": ["材料1", "材料2", "材料3"],
    "costEffectiveSolutions": ["解決策1", "解決策2"]
  },
  "marketInsights": {
    "competitiveAdvantage": "競争優位性分析",
    "pricingStrategy": "価格戦略",
    "demandForecast": "需要予測"
  }
}

メルカリ手数料10%を考慮した実践的なアドバイスを提供してください。
  `;
}

// 🧠 高度なローカル分析エンジン（既存のコードを維持）
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

  // ✅ 空配列チェック追加
  if (!shippingOptions || shippingOptions.length === 0) {
    console.warn('⚠️ 配送オプションが空です。ダミーデータで処理を継続します。');
    return createEmptyOptionsAnalysis(productInfo);
  }

  // 📊 基本数値計算（安全なreduce）
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
    confidence: 88, // ローカル高度分析の信頼度
    analysisId: `local_adv_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    timestamp: new Date().toISOString()
  };

  return result;
}

// 🆘 空の配送オプション用の分析
function createEmptyOptionsAnalysis(productInfo: ProductInfo): AIAnalysisResult {
  const salePrice = parseInt(productInfo.salePrice ?? '') || 1500;
  const platformFee = Math.round(salePrice * 0.1);
  
  return {
    summary: `現在、${productInfo.category}の配送料金を計算中です。商品サイズ（${productInfo.length}×${productInfo.width}×${productInfo.thickness}cm）、重量（${productInfo.weight}g）での最適な配送方法を検索しています。`,
    profitAnalysis: {
      currentProfit: salePrice - platformFee,
      optimizedProfit: salePrice - platformFee,
      improvements: ['配送方法の選択肢が見つかり次第、詳細な利益分析を実行します'],
      costSavings: 0,
      priceRecommendation: '配送料金確定後に最適価格を提案します',
      breakdown: {
        salePrice,
        platformFee,
        platformName: 'メルカリ',
        profitByShipping: []
      }
    },
    riskAssessment: {
      damageRisk: 3,
      delayRisk: 2,
      lossRisk: 1,
      overallRisk: 2,
      preventionTips: ['配送方法が確定次第、詳細なリスク分析を提供します']
    },
    packagingAdvice: {
      recommendedMaterials: ['基本梱包材での保護'],
      costEffectiveSolutions: ['配送方法に応じた最適梱包を提案'],
      budgetBreakdown: []
    },
    marketInsights: {
      competitiveAdvantage: '配送効率の最適化により競争力向上',
      pricingStrategy: '配送費を考慮した戦略的価格設定',
      timingAdvice: '配送方法確定後に詳細提案',
      buyerBehavior: '送料込み価格での訴求力強化',
      demandForecast: '安定需要継続予測'
    },
    confidence: 60,
    analysisId: `empty_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}

// 🔧 ユーティリティ関数群
function assessCategoryRisk(category: string): { damage: number, delay: number, loss: number } {
  const riskMap: { [key: string]: { damage: number, delay: number, loss: number } } = {
    '衣類': { damage: 1, delay: 2, loss: 1 },
    '本・雑誌': { damage: 2, delay: 2, loss: 1 },
    'CD・DVD': { damage: 4, delay: 2, loss: 2 },
    '精密機器': { damage: 8, delay: 3, loss: 3 },
    'ガラス製品': { damage: 9, delay: 2, loss: 2 },
    'その他': { damage: 3, delay: 3, loss: 2 }
  };
  return riskMap[category] || riskMap['その他'];
}

function getRecommendedMaterials(category: string): string[] {
  const materialMap: { [key: string]: string[] } = {
    '衣類': ['OPP袋（防水）', 'プチプチ薄手'],
    '本・雑誌': ['OPP袋（防水）', 'ダンボール小'],
    'CD・DVD': ['プチプチ厚手', 'ダンボール', '緩衝材'],
    '精密機器': ['エアキャップ厚手', 'ダンボール二重', '緩衝材多重'],
    'ガラス製品': ['エアキャップ特厚', 'ダンボール二重', '緩衝材多重'],
    'その他': ['プチプチ薄手', 'ダンボール']
  };
  return materialMap[category] || materialMap['その他'];
}

function getDemandForecast(category: string): string {
  const forecastMap: { [key: string]: string } = {
    '衣類': '季節需要で変動、秋冬物は9-11月が最需要期',
    '本・雑誌': '安定需要、新学期・夏休み前に若干増加',
    'CD・DVD': '安定需要継続、レア商品は高値維持',
    '精密機器': '新製品発売時期で中古需要変動',
    'ガラス製品': '季節イベント前に需要増',
    'その他': '安定需要継続予測'
  };
  return forecastMap[category] || forecastMap['その他'];
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

  // 安全なreduce処理
  const cheapestShipping = profitByShipping.length > 0 
    ? profitByShipping.reduce((prev, curr) => 
        prev.shippingCost < curr.shippingCost ? prev : curr
      )
    : { profit: salePrice - platformFee, shippingCost: 0 };
  
  const mostProfitableShipping = profitByShipping.length > 0
    ? profitByShipping.reduce((prev, curr) => 
        prev.profit > curr.profit ? prev : curr
      )
    : cheapestShipping;

  const improvements = [];
  if (mostProfitableShipping.profit > cheapestShipping.profit) {
    improvements.push(`${mostProfitableShipping.shippingName}に変更で${mostProfitableShipping.profit - cheapestShipping.profit}円の利益向上`);
  }
  
  if (cheapestShipping.profit < salePrice * 0.2) {
    improvements.push('利益率20%未満のため価格見直しを推奨');
  }

  return {
    currentProfit: cheapestShipping.profit,
    optimizedProfit: mostProfitableShipping.profit,
    improvements,
    costSavings: mostProfitableShipping.profit - cheapestShipping.profit,
    priceRecommendation: generatePriceRecommendation(
      salePrice, 
      cheapestShipping.profit, 
      (cheapestShipping.profit / salePrice) * 100
    ),
    breakdown: {
      salePrice,
      platformFee,
      platformName: 'メルカリ',
      profitByShipping
    }
  };
}

// ⚠️ リスク評価システム
function analyzeShippingRisks(
  productInfo: ProductInfo,
  shippingOptions: ShippingOption[],
  selectedOption: ShippingOption
): RiskAssessment {
  let damageRisk = 2; // ベースリスク
  let delayRisk = 3;
  let lossRisk = 1;

  // カテゴリ別リスク調整
  const categoryRisks: { [key: string]: { damage: number, delay: number, loss: number } } = {
    '衣類': { damage: 1, delay: 2, loss: 1 },
    '本・雑誌': { damage: 2, delay: 2, loss: 1 },
    'CD・DVD': { damage: 4, delay: 2, loss: 2 },
    '精密機器': { damage: 8, delay: 3, loss: 3 },
    'ガラス製品': { damage: 9, delay: 2, loss: 2 },
    'その他': { damage: 3, delay: 3, loss: 2 }
  };

  const categoryRisk = categoryRisks[productInfo.category] || categoryRisks['その他'];
  damageRisk = categoryRisk.damage;
  delayRisk = categoryRisk.delay;
  lossRisk = categoryRisk.loss;

  // サイズ・重量による調整
  const volume = parseInt(productInfo.length || '0') * 
                parseInt(productInfo.width || '0') * 
                parseInt(productInfo.thickness || '0');
  
  if (volume > 50000) { // 大型商品
    damageRisk += 2;
    delayRisk += 1;
  }

  const weight = parseInt(productInfo.weight || '0');
  if (weight > 3000) { // 重量商品
    damageRisk += 1;
    delayRisk += 2;
  }

  const overallRisk = Math.round((damageRisk + delayRisk + lossRisk) / 3);
  
  return {
    damageRisk,
    delayRisk,
    lossRisk,
    overallRisk,
    preventionTips: generatePreventionTips(productInfo.category, overallRisk)
  };
}

// 📦 梱包最適化アドバイス
function analyzePackagingOptimization(
  productInfo: ProductInfo,
  riskLevel: number
): PackagingAdvice {
  const materials = [];
  const solutions = [];

  // カテゴリ別推奨梱包材
  const categoryMaterials: { [key: string]: string[] } = {
    '衣類': ['OPP袋（防水）', 'プチプチ薄手'],
    '本・雑誌': ['OPP袋（防水）', 'ダンボール小'],
    'CD・DVD': ['プチプチ厚手', 'ダンボール', '緩衝材'],
    '精密機器': ['エアキャップ厚手', 'ダンボール二重', '緩衝材多重'],
    'ガラス製品': ['エアキャップ特厚', 'ダンボール二重', '緩衝材多重'],
    'その他': ['プチプチ薄手', 'ダンボール']
  };

  const baseMaterials = categoryMaterials[productInfo.category] || categoryMaterials['その他'];
  materials.push(...baseMaterials);

  // リスクレベル別追加対策
  if (riskLevel >= 7) {
    materials.push('追加緩衝材', '「壊れ物」シール');
    solutions.push('保険付き配送を強く推奨');
  }

  if (riskLevel >= 5) {
    solutions.push('丁寧な梱包で差別化');
  }

  solutions.push('100円ショップ活用でコスト削減');
  solutions.push('梱包材の使い回しでエコ&節約');

  return {
    recommendedMaterials: materials,
    costEffectiveSolutions: solutions,
    budgetBreakdown: calculatePackagingCosts(materials)
  };
}

// 📈 市場戦略分析
function analyzeMarketStrategy(
  productInfo: ProductInfo,
  salePrice: number,
  currentProfit: number
): MarketInsights {
  const profitMargin = (currentProfit / salePrice) * 100;

  return {
    competitiveAdvantage: profitMargin > 30 
      ? '高利益率により価格競争力を維持可能'
      : '配送費最適化で競争力向上が必要',
    pricingStrategy: generatePriceRecommendation(salePrice, currentProfit, profitMargin),
    timingAdvice: '平日午前中の出品で閲覧数最大化',
    buyerBehavior: '送料込み価格表示で購買意欲向上',
    demandForecast: getDemandForecast(productInfo.category)
  };
}

// 📋 詳細サマリー生成
function generateDetailedSummary(
  productInfo: ProductInfo,
  cheapest: ShippingOption,
  fastest: ShippingOption,
  profit: number,
  riskLevel: number
): string {
  const profitMargin = profit > 0 ? `利益${profit}円` : `赤字${Math.abs(profit)}円`;
  const riskText = riskLevel >= 7 ? '高リスク' : riskLevel >= 4 ? '中リスク' : '低リスク';

  return `${productInfo.category}（${productInfo.salePrice}円）の最適配送戦略：

💰 **利益分析**: ${cheapest.name}(${cheapest.price}円)で${profitMargin}、利益率${((profit / parseInt(productInfo.salePrice || '0')) * 100).toFixed(1)}%

⚡ **速度重視**: ${fastest.name}(${fastest.deliveryDays})で迅速対応

⚠️ **リスク評価**: ${riskText} - 適切な梱包で事故防止

🎯 **推奨戦略**: ${profit > 500 ? '現在の価格設定で積極販売' : '配送費見直しまたは価格調整を検討'}`;
}

// 🛡️ 予防策アドバイス生成
function generatePreventionTips(category: string, riskLevel: number): string[] {
  const baseTips = [
    '商品写真で梱包状態もアピール',
    '配送方法を商品説明に明記',
    '購入者との事前コミュニケーション重視'
  ];

  const categoryTips: { [key: string]: string[] } = {
    '衣類': ['圧縮袋使用で送料削減', 'においの防止策', '圧縮による皺対策'],
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

// 🆘 基本分析（フォールバック）- エラー修正版
function getBasicAnalysis(request: AIAnalysisRequest): AIAnalysisResult {
  const { productInfo, shippingOptions } = request;
  
  // ✅ 空配列対策：初期値を設定
  const cheapest = shippingOptions.length > 0 
    ? shippingOptions.reduce((prev, curr) => prev.price < curr.price ? prev : curr)
    : { name: 'サンプル配送', price: 300, deliveryDays: '1-2日' };

  const salePrice = parseInt(productInfo.salePrice ?? '') || 1500;
  const platformFee = Math.round(salePrice * 0.1);
  const profit = salePrice - platformFee - cheapest.price;

  return {
    summary: `基本分析: ${productInfo.category}の${cheapest.name}での配送で${profit}円の利益見込み`,
    profitAnalysis: {
      currentProfit: profit,
      optimizedProfit: profit,
      improvements: ['詳細分析で更なる最適化が可能'],
      costSavings: 0,
      priceRecommendation: '適正価格範囲内',
      breakdown: {
        salePrice,
        platformFee,
        platformName: 'メルカリ',
        profitByShipping: shippingOptions.map(option => ({
          shippingName: option.name,
          shippingCost: option.price,
          profit: salePrice - platformFee - option.price,
          profitRate: ((salePrice - platformFee - option.price) / salePrice) * 100,
          deliveryDays: option.deliveryDays
        }))
      }
    },
    riskAssessment: {
      damageRisk: 3,
      delayRisk: 3,
      lossRisk: 2,
      overallRisk: 3,
      preventionTips: ['基本的な梱包で十分', '配送業者の選択重要']
    },
    packagingAdvice: {
      recommendedMaterials: ['基本梱包材'],
      costEffectiveSolutions: ['標準的な梱包'],
      budgetBreakdown: [{ material: '基本梱包', cost: 100, durability: '中' }]
    },
    marketInsights: {
      competitiveAdvantage: '標準的な競争力',
      pricingStrategy: '市場価格準拠',
      timingAdvice: '通常タイミング',
      buyerBehavior: '一般的な購買行動',
      demandForecast: '安定需要'
    },
    confidence: 70,
    analysisId: `basic_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}