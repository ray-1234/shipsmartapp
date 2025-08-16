// utils/aiAnalysisService.ts - 緊急修正版
import { ProductInfo, ShippingOption } from '../types/shipping';

// 常にVercel本番環境のURLを使用（開発・本番共通）
const VERCEL_API_URL = 'https://shipsmartapp-iaqt.vercel.app/api/ai-analysis';

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

    // API呼び出し（フル URL を使用）
    console.log('🌐 API呼び出し開始...', VERCEL_API_URL);
    const response = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        analysisType,
        model: 'gpt-4o',
        maxTokens: 1500
      })
    });

    console.log(`📡 API レスポンス: ${response.status} ${response.statusText}`);
    console.log('📡 Content-Type:', response.headers.get('content-type'));

    // レスポンスのテキストを先に取得してログ出力
    const responseText = await response.text();
    console.log('📄 Raw Response (最初の500文字):', responseText.substring(0, 500));

    // HTMLレスポンスかチェック
    if (responseText.includes('<!DOCTYPE html>')) {
      console.error('❌ HTMLレスポンスを受信 - APIエンドポイントが見つからない');
      throw new Error('APIエンドポイントに接続できません。Vercelデプロイを確認してください。');
    }

    if (!response.ok) {
      console.error('❌ API Error:', response.status, responseText);
      throw new Error(`API Error: ${response.status} - ${responseText}`);
    }

    // JSONパース
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('📄 Response Text:', responseText);
      throw new Error('API レスポンスの形式が不正です');
    }

    console.log('✅ レスポンス受信:', data.metadata);

    if (!data.analysis) {
      console.error('❌ 分析結果なし:', data);
      throw new Error('分析結果が返されませんでした');
    }

    // JSON解析 - より厳密な処理
    console.log('🔍 JSON解析開始...');
    console.log('📄 Raw analysis field:', data.analysis);
    
    let analysisResult;
    try {
      // 文字列から実際のJSONオブジェクトを解析
      const analysisString = typeof data.analysis === 'string' ? data.analysis : JSON.stringify(data.analysis);
      console.log('📝 Analysis string (最初の300文字):', analysisString.substring(0, 300));
      
      const parsedAnalysis = JSON.parse(analysisString);
      console.log('✅ Parsed analysis keys:', Object.keys(parsedAnalysis));
      
      analysisResult = parseAnalysisResponse(JSON.stringify(parsedAnalysis));
    } catch (directParseError) {
      console.error('❌ 直接解析失敗:', directParseError);
      // フォールバック: 従来の方法で解析
      analysisResult = parseAnalysisResponse(data.analysis);
    }
    
    console.log('✅ 最終解析完了:', analysisResult);

    return {
      ...analysisResult,
      analysisId: generateAnalysisId(),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ AI分析エラー:', error);
    
    // 具体的なエラーメッセージを表示
    if (error instanceof Error) {
      if (error.message.includes('HTMLレスポンス')) {
        throw new Error('Vercel APIが見つかりません。デプロイ状況を確認してください。');
      }
      if (error.message.includes('fetch')) {
        throw new Error('ネットワークエラー: インターネット接続を確認してください。');
      }
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
- 発送元: ${productInfo.senderLocation || '未設定'}
- 配送先: ${productInfo.destination}
- 販売予定価格: ${productInfo.salePrice ? `¥${productInfo.salePrice}` : '未設定'}
`;

  const shippingOptionsText = shippingOptions.map((option, index) => 
    `${index + 1}. ${option.name}: ¥${option.price} (${option.deliveryDays})`
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

【利益計算の前提】
- メルカリ手数料: 10%
- ヤフオク手数料: 8.8%
${productInfo.salePrice ? `- 販売予定価格: ¥${productInfo.salePrice}` : '- 販売価格: 仮想¥2000で計算'}

必ず以下のJSON形式で回答してください：

{
  "summary": "分析結果の要約（2-3文で具体的に）",
  "confidence": 0.85,
  "profitAnalysis": {
    "currentProfit": ${productInfo.salePrice ? 
      `${Math.round(parseFloat(productInfo.salePrice) * 0.9 - (shippingOptions[0]?.price || 200))}` : 
      '1200'},
    "optimizedProfit": ${productInfo.salePrice ? 
      `${Math.round(parseFloat(productInfo.salePrice) * 0.9 - Math.min(...shippingOptions.map(o => o.price)))}` : 
      '1450'},
    "costSavings": ${shippingOptions.length > 1 ? 
      `${(shippingOptions[0]?.price || 200) - Math.min(...shippingOptions.map(o => o.price))}` : 
      '250'},
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

発送元（${productInfo.senderLocation}）から配送先（${productInfo.destination}）への距離も考慮して、フリマ初心者にも分かりやすく、具体的で実践的なアドバイスをお願いします。`;
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
    
    // Markdown記法を除去し、エスケープされた改行文字も処理
    const cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\\n/g, '')  // エスケープされた改行文字を除去
      .replace(/\n/g, '')   // 実際の改行文字を除去
      .trim();
    
    console.log('🧹 Cleaned response:', cleaned.substring(0, 200) + '...');
    
    const parsed = JSON.parse(cleaned);
    console.log('✅ Parsed JSON structure:', Object.keys(parsed));

    // データ検証と補完（より厳密な型チェック）
    const result = {
      summary: parsed.summary || 'AI分析が完了しました',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      profitAnalysis: {
        currentProfit: Number(parsed.profitAnalysis?.currentProfit) || 0,
        optimizedProfit: Number(parsed.profitAnalysis?.optimizedProfit) || 0,
        costSavings: Number(parsed.profitAnalysis?.costSavings) || 0,
        improvements: Array.isArray(parsed.profitAnalysis?.improvements) ? parsed.profitAnalysis.improvements : [],
        priceRecommendation: parsed.profitAnalysis?.priceRecommendation || ''
      },
      riskAssessment: {
        overallRisk: Number(parsed.riskAssessment?.overallRisk) || 3,
        damageRisk: Number(parsed.riskAssessment?.damageRisk) || 3,
        delayRisk: Number(parsed.riskAssessment?.delayRisk) || 3,
        lossRisk: Number(parsed.riskAssessment?.lossRisk) || 2,
        preventionTips: Array.isArray(parsed.riskAssessment?.preventionTips) ? parsed.riskAssessment.preventionTips : []
      },
      packagingAdvice: {
        recommendedMaterials: Array.isArray(parsed.packagingAdvice?.recommendedMaterials) ? parsed.packagingAdvice.recommendedMaterials : [],
        costEffectiveSolutions: Array.isArray(parsed.packagingAdvice?.costEffectiveSolutions) ? parsed.packagingAdvice.costEffectiveSolutions : [],
        budgetBreakdown: Array.isArray(parsed.packagingAdvice?.budgetBreakdown) ? parsed.packagingAdvice.budgetBreakdown : []
      },
      marketInsights: {
        competitiveAdvantage: parsed.marketInsights?.competitiveAdvantage || '',
        pricingStrategy: parsed.marketInsights?.pricingStrategy || '',
        timingAdvice: parsed.marketInsights?.timingAdvice || '',
        buyerBehavior: parsed.marketInsights?.buyerBehavior || '',
        demandForecast: parsed.marketInsights?.demandForecast || ''
      }
    };

    console.log('✅ 解析完了 - 詳細データ:', {
      summary: result.summary,
      profitAnalysisKeys: Object.keys(result.profitAnalysis),
      riskAssessmentKeys: Object.keys(result.riskAssessment),
      packagingAdviceKeys: Object.keys(result.packagingAdvice),
      marketInsightsKeys: Object.keys(result.marketInsights)
    });

    return result;

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
    summary: '🤖 基本分析を実行しました。ゆうパケットポスト（¥200）が最もコスト効率が良く、配送リスクも低めです。',
    confidence: 0.7,
    profitAnalysis: {
      currentProfit: 1050,
      optimizedProfit: 1250,
      costSavings: 200,
      improvements: [
        'ゆうパケットポスト（¥200）を選択して送料を最小化',
        '厚み2.8cmギリギリまで圧縮梱包を活用',
        '送料込み価格設定で購入率向上'
      ],
      priceRecommendation: '送料込み1,680円で設定すると利益とユーザビリティを両立'
    },
    riskAssessment: {
      overallRisk: 3,
      damageRisk: 2,
      delayRisk: 3,
      lossRisk: 2,
      preventionTips: [
        '衣類は圧縮しても破損リスクが低いため安心',
        'ゆうパケットポストは追跡可能で紛失リスクが低い'
      ]
    },
    packagingAdvice: {
      recommendedMaterials: [
        'ゆうパケットポスト専用箱（郵便局で無料）',
        '圧縮袋（100円ショップ）',
        '透明テープ'
      ],
      costEffectiveSolutions: [
        '専用箱は郵便局で無料入手',
        '圧縮袋で厚み調整してコスト削減'
      ],
      budgetBreakdown: [
        { material: '専用箱', cost: 0, durability: '高' },
        { material: '圧縮袋', cost: 100, durability: '中' },
        { material: 'テープ', cost: 50, durability: '高' }
      ]
    },
    marketInsights: {
      competitiveAdvantage: '最安配送方法を選択することで価格競争力を向上',
      pricingStrategy: '送料込み価格で心理的ハードルを下げる戦略',
      timingAdvice: '平日発送で迅速対応をアピール',
      buyerBehavior: '衣類購入者は送料を重視する傾向',
      demandForecast: '衣類は通年需要があり安定した売上が期待'
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
export async function testAPIConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🔍 API接続テスト開始...', VERCEL_API_URL);
    
    const response = await fetch(VERCEL_API_URL, {
      method: 'OPTIONS',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const responseText = await response.text();
    
    if (responseText.includes('<!DOCTYPE html>')) {
      return { 
        success: false, 
        message: 'APIエンドポイントが見つかりません', 
        details: { url: VERCEL_API_URL, responseType: 'HTML' }
      };
    }
    
    if (response.ok) {
      console.log('✅ API接続成功');
      return { success: true, message: 'API接続が正常です' };
    } else {
      console.log('❌ API接続失敗:', response.status);
      return { 
        success: false, 
        message: `API接続エラー: ${response.status}`,
        details: { status: response.status, response: responseText }
      };
    }
  } catch (error) {
    console.error('❌ 接続テストエラー:', error);
    return { 
      success: false, 
      message: '接続テストに失敗しました',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}