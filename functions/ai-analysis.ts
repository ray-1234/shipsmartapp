// functions/ai-analysis.ts
import { ExpoRequest, ExpoResponse } from 'expo/server';

export async function POST(request: ExpoRequest): Promise<ExpoResponse> {
  try {
    console.log('🤖 EAS Functions AI分析開始');

    // CORS設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // リクエストボディ取得
    const body = await request.json();
    const { productInfo, shippingOptions, analysisType = 'comprehensive' } = body;

    console.log('📦 分析対象:', {
      category: productInfo?.category,
      price: productInfo?.salePrice,
      optionsCount: shippingOptions?.length || 0,
      analysisType
    });

    // 入力検証
    if (!productInfo || !shippingOptions) {
      return ExpoResponse.json(
        { 
          success: false, 
          error: 'productInfo と shippingOptions が必要です' 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // OpenAI API呼び出し
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not found');
      return ExpoResponse.json(
        { 
          success: false, 
          error: 'API設定エラー' 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // AI分析プロンプト生成
    const prompt = generateAnalysisPrompt(productInfo, shippingOptions, analysisType);
    const systemPrompt = getSystemPrompt(analysisType);

    console.log('🧠 OpenAI API呼び出し開始');

    // OpenAI API呼び出し
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorText
      });
      
      return ExpoResponse.json(
        { 
          success: false, 
          error: `OpenAI API エラー: ${openaiResponse.status}` 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log('✅ OpenAI API成功:', {
      tokensUsed: openaiData.usage?.total_tokens,
      model: 'gpt-4o'
    });

    let analysis;
    try {
      analysis = JSON.parse(openaiData.choices[0].message.content);
    } catch (parseError) {
      console.error('❌ JSON解析エラー:', parseError);
      return ExpoResponse.json(
        { 
          success: false, 
          error: 'AI分析結果の解析に失敗しました' 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return ExpoResponse.json({
      success: true,
      analysis,
      metadata: {
        tokensUsed: openaiData.usage?.total_tokens,
        model: 'gpt-4o',
        analysisType,
        timestamp: new Date().toISOString(),
        functionVersion: '1.0.0'
      }
    }, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('❌ EAS Functions エラー:', error);
    
    return ExpoResponse.json({
      success: false,
      error: 'AI分析中にエラーが発生しました',
      details: error.message
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// OPTIONS リクエスト対応（CORS プリフライト）
export async function OPTIONS(request: ExpoRequest): Promise<ExpoResponse> {
  return new ExpoResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// AI分析プロンプト生成
function generateAnalysisPrompt(
  productInfo: any, 
  shippingOptions: any[], 
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
    : '配送オプションなし';

  return `
【商品情報】
- カテゴリ: ${category}
- 販売価格: ${salePrice}円
- サイズ: ${dimensions}
- 重量: ${weight}
- 発送元: ${productInfo.senderLocation || '東京都'}
- 配送先: ${productInfo.destination || '全国'}

【配送オプション】
${optionsText}

【分析タイプ】
${analysisType}

上記の情報を基に、フリマ出品者向けの実践的で具体的な分析をJSON形式で提供してください。
特に利益最大化、リスク管理、梱包最適化の観点から詳細にアドバイスしてください。
  `;
}

// システムプロンプト
function getSystemPrompt(analysisType: string): string {
  const basePrompt = `あなたは日本のフリマ市場（メルカリ、ヤフオク等）に精通した物流・配送コンサルタントです。
実際の配送業界での豊富な経験を持ち、フリマ出品者の利益最大化を専門としています。

必ず以下のJSON形式で回答してください：

{
  "summary": "分析結果の要約（100文字程度の簡潔なサマリー）",
  "profitAnalysis": {
    "currentProfit": 現在の想定利益（数値）,
    "optimizedProfit": 最適化後の利益（数値）,
    "improvements": ["具体的な改善提案1", "具体的な改善提案2", "具体的な改善提案3"],
    "priceRecommendation": "価格戦略の具体的提案"
  },
  "riskAssessment": {
    "overallRisk": 総合リスクレベル（1-10の数値）,
    "damageRisk": 破損リスク（1-10の数値）,
    "delayRisk": 遅延リスク（1-10の数値）,
    "lossRisk": 紛失リスク（1-10の数値）,
    "preventionTips": ["リスク対策1", "リスク対策2", "リスク対策3"]
  },
  "packagingAdvice": {
    "recommendedMaterials": ["推奨梱包材1", "推奨梱包材2", "推奨梱包材3"],
    "costEffectiveSolutions": ["コスト効果的な解決策1", "コスト効果的な解決策2"]
  },
  "marketInsights": {
    "competitiveAdvantage": "競争優位性の分析",
    "pricingStrategy": "具体的な価格戦略",
    "demandForecast": "需要予測と市場分析"
  }
}

メルカリ手数料10%、ヤフオク手数料8.8%を考慮した実践的なアドバイスを提供してください。
数値は具体的に、提案は実行可能で現実的な内容にしてください。`;

  const specificPrompts = {
    comprehensive: `${basePrompt}
全ての観点（利益・リスク・梱包・市場）から総合的に分析してください。`,

    profit: `${basePrompt}
特に利益最大化とコスト削減に重点を置いて分析してください。`,

    risk: `${basePrompt}
特に配送リスクの詳細評価と対策に重点を置いて分析してください。`,

    packaging: `${basePrompt}
特に梱包材の選定とコスト効率に重点を置いて分析してください。`,

    market: `${basePrompt}
特に市場動向と価格戦略に重点を置いて分析してください。`
  };

  return specificPrompts[analysisType as keyof typeof specificPrompts] || specificPrompts.comprehensive;
}