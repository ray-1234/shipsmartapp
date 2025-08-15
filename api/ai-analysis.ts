// api/ai-analysis.ts (Vercel Functions)
import OpenAI from 'openai';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, analysisType, model = 'gpt-4o', maxTokens = 800 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('AI分析リクエスト:', { analysisType, promptLength: prompt.length });

    // システムプロンプトを分析タイプに応じて設定
    const systemPrompt = getSystemPrompt(analysisType);

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const analysis = completion.choices[0].message.content;

    // 使用量のログ
    console.log('AI分析完了:', {
      tokensUsed: completion.usage?.total_tokens,
      analysisType,
      responseLength: analysis?.length
    });

    return res.json({ 
      analysis,
      metadata: {
        tokensUsed: completion.usage?.total_tokens,
        model: model,
        analysisType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('OpenAI API エラー:', error);

    // エラータイプに応じた処理
    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ 
        error: 'API利用制限に達しました。しばらく待ってから再試行してください。',
        retryAfter: 60
      });
    }

    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ 
        error: 'APIクォータが不足しています。' 
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'API認証エラーが発生しました。' 
      });
    }

    // 一般的なエラー
    return res.status(500).json({ 
      error: 'AI分析中にエラーが発生しました。再試行してください。',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 分析タイプに応じたシステムプロンプト
function getSystemPrompt(analysisType: string): string {
  const basePrompt = `あなたは日本のフリマ市場（メルカリ、ヤフオク等）に精通した物流・配送コンサルタントです。
実際の配送業界での豊富な経験を持ち、フリマ出品者の利益最大化を専門としています。
回答は必ずJSON形式で、具体的で実践的なアドバイスを提供してください。`;

  const specificPrompts = {
    profit: `${basePrompt}
特に利益最大化、コスト削減、価格戦略に関する専門知識を活用して分析してください。
メルカリ手数料10%、ヤフオク手数料8.8%を考慮した実際の手取り計算を行ってください。`,

    risk: `${basePrompt}
特に配送リスク管理、破損・遅延・紛失の予防に関する専門知識を活用してください。
過去の配送事故事例や季節要因も考慮した実践的なリスク評価を行ってください。`,

    packaging: `${basePrompt}
特に梱包材の選定、コスト効率、商品保護に関する専門知識を活用してください。
100円ショップやネット通販で入手可能な材料を中心とした現実的な提案をしてください。`,

    market: `${basePrompt}
特にフリマ市場の動向、価格戦略、購買行動に関する専門知識を活用してください。
実際の取引データに基づいた市場分析と戦略提案を行ってください。`,

    comprehensive: `${basePrompt}
利益最大化、リスク管理、梱包最適化、市場戦略の全ての観点から総合的に分析してください。`
  };

  return specificPrompts[analysisType as keyof typeof specificPrompts] || specificPrompts.comprehensive;
}

// 環境変数の検証（デプロイ時に実行される）
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ OPENAI_API_KEY が設定されていません');
}