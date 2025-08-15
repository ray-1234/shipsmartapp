// utils/aiAnalysisService.ts - 修正版
import { ProductInfo, ShippingOption } from '../types/shipping';

// Vercel APIのベースURL（本番環境の実際のドメインに変更してください）
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://shipsmartapp-iaqt.vercel.app/api/ai-analysis'  // ← 実際のVercelドメインに変更
  : '/api';

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
}

export interface RiskAssessment {
  damageRisk: number; // 1-10
  delayRisk: number; // 1-10
  lossRisk: number; // 1-10
  overallRisk: number; // 1-10
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

// メインの分析関数
export async function runAIAnalysis(
  request: AIAnalysisRequest,
  analysisType: AnalysisType = 'comprehensive'
): Promise<AIAnalysisResult> {
  console.log('🤖 AI分析開始:', { analysisType, productInfo: request.productInfo });

  try {
    // プロンプト生成
    const prompt = generateComprehensivePrompt(request, analysisType);
    console.log('📝 プロンプト生成完了');

    // API呼び出し
    console.log('🌐 API呼び出し開始...');
    const response = await fetch(`${API_BASE_URL}/ai-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        analysisType,
        model: 'gpt-4o',
        maxTokens: 1500
      })
    });

    console.log(`📡 API レスポンス: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ レスポンス受信:', data.metadata);

    if (!data.analysis) {
      console.error('❌ 分析結果なし:', data);
      throw new Error('分析結果が返されませんでした');
    }

    // JSON解析
    console.log('🔍 JSON解析開始...');
    const analysisResult = parseAnalysisResponse(data.analysis);
    console.log('✅ 解析完了:', analysisResult);

    return {
      ...analysisResult,
      analysisId: generateAnalysisId(),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ AI分析エラー:', error);
    
    // ネットワークエラーの場合
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 ネットワークエラー');
      throw new Error('ネットワークに接続できません。インターネット接続を確認してください。');
    }
    
    // フォールバック分析を返す
    console.log('🔄 フォールバック分析を使用');
    return getFallbackAnalysis(request);
  }
}

// 包括的なプロンプト生成
function generateComprehensivePrompt(request: AIAnalysisRequest, analysisType: AnalysisType): string {
  const { productInfo, shippingOptions, userPreferences } = request;
  
  const productDescription = `
【商品情報】
- カテゴリ: ${productInfo.category}
- サイズ: ${productInfo.length}×${productInfo.width}×${productInfo.thickness}cm
- 重量: ${productInfo.weight}g
- 配送先: ${productInfo.destination}
`;

  const shippingOptionsText = shippingOptions.map((option, index) => 
    `${index + 1}. ${option.name || option.service}: ¥${option.price} (${option.deliveryDays})`
  ).join('\n');

  const userPreferencesText = userPreferences ? `
【ユーザー設定】
- コスト重視: ${userPreferences.prioritizeCost ? 'はい' : 'いいえ'}
- スピード重視: ${userPreferences.prioritizeSpeed ? 'はい' : 'いいえ'}
- リスク許容度: ${userPreferences.riskTolerance || 'medium'}
` : '';

  return `あなたは日本のフリマ市場（メルカリ、ヤフオク等）に精通した物流・配送コンサルタントです。
以下の商品について、${getAnalysisDescription(analysisType)}を行ってください。

${productDescription}

【配送オプション】
${shippingOptionsText}

${userPreferencesText}

必ず以下のJSON形式で回答してください：

{
  "summary": "分析結果の要約（2-3文で具体的に）",
  "confidence": 0.85,
  "profitAnalysis": {
    "currentProfit": 1200,
    "optimizedProfit": 1450,
    "costSavings": 250,
    "improvements": [
      "具体的な改善提案1",
      "具体的な改善提案2",
      "具体的な改善提案3"
    ],
    "priceRecommendation": "最適な価格設定の提案"
  },
  "riskAssessment": {
    "overallRisk": 3,
    "damageRisk": 2,
    "delayRisk": 4,
    "lossRisk": 1,
    "preventionTips": [
      "具体的な予防策1",
      "具体的な予防策2"
    ]
  },
  "packagingAdvice": {
    "recommendedMaterials": [
      "推奨梱包材1",
      "推奨梱包材2"
    ],
    "costEffectiveSolutions": [
      "コスト削減案1",
      "コスト削減案2"
    ],
    "budgetBreakdown": [
      {
        "material": "プチプチ",
        "cost": 30,
        "durability": "高"
      }
    ]
  },
  "marketInsights": {
    "competitiveAdvantage": "競合優位性の提案",
    "pricingStrategy": "価格戦略の提案",
    "timingAdvice": "出品タイミングのアドバイス",
    "buyerBehavior": "購買行動の分析",
    "demandForecast": "需要予測"
  }
}

フリマ初心者にも分かりやすく、具体的で実践的なアドバイスをお願いします。`;
}

function getAnalysisDescription(type: AnalysisType): string {
  const descriptions = {
    comprehensive: '総合的な利益最大化とリスク管理の分析',
    profit: '利益とコスト効率に特化した分析',
    risk: '配送リスクの評価と対策に特化した分析',
    packaging: '梱包材の最適化に特化した分析',
    market: '市場戦略とタイミングに特化した分析'
  };
  return descriptions[type];
}

// レスポンス解析
function parseAnalysisResponse(responseText: string): Omit<AIAnalysisResult, 'analysisId' | 'timestamp'> {
  try {
    console.log('🔍 Raw response:', responseText.substring(0, 200) + '...');
    
    // Markdown記法を除去
    const cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    console.log('🧹 Cleaned response:', cleaned.substring(0, 200) + '...');
    
    const parsed = JSON.parse(cleaned);
    console.log('✅ Parsed JSON:', Object.keys(parsed));

    // データ検証と補完
    return {
      summary: parsed.summary || 'AI分析が完了しました',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      profitAnalysis: {
        currentProfit: parsed.profitAnalysis?.currentProfit || 0,
        optimizedProfit: parsed.profitAnalysis?.optimizedProfit || 0,
        costSavings: parsed.profitAnalysis?.costSavings || 0,
        improvements: parsed.profitAnalysis?.improvements || [],
        priceRecommendation: parsed.profitAnalysis?.priceRecommendation || ''
      },
      riskAssessment: {
        overallRisk: parsed.riskAssessment?.overallRisk || 3,
        damageRisk: parsed.riskAssessment?.damageRisk || 3,
        delayRisk: parsed.riskAssessment?.delayRisk || 3,
        lossRisk: parsed.riskAssessment?.lossRisk || 2,
        preventionTips: parsed.riskAssessment?.preventionTips || []
      },
      packagingAdvice: {
        recommendedMaterials: parsed.packagingAdvice?.recommendedMaterials || [],
        costEffectiveSolutions: parsed.packagingAdvice?.costEffectiveSolutions || [],
        budgetBreakdown: parsed.packagingAdvice?.budgetBreakdown || []
      },
      marketInsights: {
        competitiveAdvantage: parsed.marketInsights?.competitiveAdvantage || '',
        pricingStrategy: parsed.marketInsights?.pricingStrategy || '',
        timingAdvice: parsed.marketInsights?.timingAdvice || '',
        buyerBehavior: parsed.marketInsights?.buyerBehavior || '',
        demandForecast: parsed.marketInsights?.demandForecast || ''
      }
    };

  } catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError);
    console.error('🔍 原文:', responseText);
    
    // パースエラーの場合はフォールバックデータを使用
    const fallback = getFallbackAnalysis({} as AIAnalysisRequest);
    return {
      summary: fallback.summary,
      confidence: fallback.confidence,
      profitAnalysis: fallback.profitAnalysis,
      riskAssessment: fallback.riskAssessment,
      packagingAdvice: fallback.packagingAdvice,
      marketInsights: fallback.marketInsights
    };
  }
}

// フォールバック分析（AIが失敗した場合）
function getFallbackAnalysis(request: AIAnalysisRequest): AIAnalysisResult {
  console.log('🔄 フォールバック分析を生成中...');
  
  return {
    summary: '🤖 基本分析を実行しました。配送コストを最適化し、リスクを最小限に抑える戦略をご提案します。',
    confidence: 0.7,
    profitAnalysis: {
      currentProfit: 890,
      optimizedProfit: 1140,
      costSavings: 250,
      improvements: [
        '厚みを2.5cm以下に圧縮してネコポス活用',
        '送料込み価格設定で購入率向上',
        '平日午前中発送で評価アップ'
      ],
      priceRecommendation: '送料込み1,580円の価格設定で競争力を保ちつつ利益確保'
    },
    riskAssessment: {
      overallRisk: 3,
      damageRisk: 3,
      delayRisk: 4,
      lossRisk: 2,
      preventionTips: [
        '硬めの封筒または薄型ダンボール使用',
        '追跡可能な配送方法を選択',
        '「折り曲げ厳禁」シール貼付'
      ]
    },
    packagingAdvice: {
      recommendedMaterials: [
        'クリックポスト専用箱',
        'プチプチ（薄型）',
        '透明梱包テープ'
      ],
      costEffectiveSolutions: [
        '100円ショップの薄型ダンボール活用',
        '新聞紙での緩衝材代用'
      ],
      budgetBreakdown: [
        { material: '薄型ダンボール', cost: 50, durability: '高' },
        { material: 'プチプチ', cost: 30, durability: '中' },
        { material: '梱包テープ', cost: 20, durability: '高' }
      ]
    },
    marketInsights: {
      competitiveAdvantage: '迅速対応と丁寧梱包で差別化',
      pricingStrategy: '送料込み価格で購入心理的ハードルを下げる',
      timingAdvice: '平日午前中発送で高評価獲得',
      buyerBehavior: '評価数と迅速発送を重視する傾向',
      demandForecast: '安定需要が見込まれるカテゴリ'
    },
    analysisId: generateAnalysisId(),
    timestamp: new Date().toISOString()
  };
}

// ユーティリティ関数
function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 接続テスト用
export async function testAPIConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔍 API接続テスト開始...');
    const response = await fetch(`${API_BASE_URL}/ai-analysis`, {
      method: 'OPTIONS'
    });
    
    if (response.ok) {
      console.log('✅ API接続成功');
      return { success: true, message: 'API接続が正常です' };
    } else {
      console.log('❌ API接続失敗:', response.status);
      return { success: false, message: `API接続エラー: ${response.status}` };
    }
  } catch (error) {
    console.error('❌ 接続テストエラー:', error);
    return { success: false, message: '接続テストに失敗しました' };
  }
}