# ShipSmart アプリ構成ドキュメント（2025年8月時点）

## プロジェクト概要

**アプリ名**: ShipSmart - フリマ発送診断アプリ  
**目的**: メルカリ・ヤフオク出品者向けの最安・最適な発送方法診断  
**開発状況**: PWA対応完了、Netlify本番デプロイ済み  

## 技術スタック（実装済み）

### フロントエンド
- **React Native**: 0.79.5（Expo 53.0.20）
- **TypeScript**: ~5.8.3
- **Metro Bundler**: Expo標準（webpackではない）
- **React Native Web**: 0.20.0（Web対応）

### バックエンド・API
- **Vercel API Routes**: `/api/ai-analysis.ts`（AI分析機能）
- **OpenAI API**: GPT連携（.env.localで管理）
- **ローカル計算ロジック**: `utils/realCalculator.ts`

### PWA機能
- **Service Worker**: `/public/sw.js`（オフライン対応、キャッシュ管理）
- **Manifest**: `/public/manifest.json`（アプリメタデータ）
- **アイコン**: `/public/icons/`（192x192, 512x512等）

### デプロイ環境
- **Netlify**: メインアプリホスティング（https://chimerical-cobbler-df2269.netlify.app/）
- **Vercel**: API機能のみ（AI分析エンドポイント）

## フォルダ構成（実装済み）

```
ShipSmart/
├── index.ts                     # Expoエントリーポイント
├── App.tsx                      # メインアプリコンポーネント（PWA統合済み）
├── package.json                 # 依存関係管理
├── app.json                     # Expo設定
├── metro.config.js              # Metro bundler設定
├── tsconfig.json               # TypeScript設定
├── .gitignore                  # Git除外設定（PWA関連追加済み）
│
├── components/                  # React Nativeコンポーネント
│   ├── EnhancedInputScreen.tsx  # 商品情報入力画面
│   ├── ResultScreen.tsx         # 診断結果表示画面
│   └── AIAnalysisScreen.tsx     # AI分析機能画面
│
├── utils/                       # ユーティリティ関数
│   ├── realCalculator.ts        # 発送料金計算ロジック
│   ├── aiAnalysisService.ts     # AI分析サービス
│   └── pwa.ts                   # PWA管理クラス
│
├── types/                       # TypeScript型定義
│   └── shipping.ts              # 配送関連の型定義
│
├── data/                        # 静的データ
│   └── shippingDatabase.ts      # 配送業者情報・料金データ
│
├── public/                      # 静的ファイル（PWA関連）
│   ├── manifest.json            # PWAマニフェスト
│   ├── sw.js                    # Service Worker
│   ├── offline.html             # オフライン用ページ
│   └── icons/                   # PWAアイコン
│       ├── icon-192x192.png
│       └── icon-512x512.png
│
├── api/                         # Vercel API Routes
│   └── ai-analysis.ts           # AI分析エンドポイント
│
├── dist/                        # ビルド成果物（Metro生成）
│   ├── index.html               # 生成されたHTML
│   ├── _expo/static/js/         # バンドルされたJavaScript
│   └── [PWAファイル]            # publicからコピーされたPWA関連ファイル
│
└── assets/                      # アセットファイル
    ├── icon.png                 # アプリアイコン（元画像）
    └── splash-icon.png          # スプラッシュ画像
```

## 主要機能（実装済み）

### 1. 発送診断機能
- **入力**: 商品サイズ（長さ・幅・厚さ）、重量、配送先
- **出力**: 最安TOP3の配送方法、料金比較、特徴表示
- **ロジック**: `calculateRealShipping()`で各配送業者の料金を計算

### 2. AI分析機能
- **機能**: 利益最大化、リスク分析、梱包提案、市場戦略
- **API**: OpenAI GPT連携（Vercel Functions経由）
- **UI**: タブ形式の分析結果表示

### 3. PWA機能
- **オフライン対応**: Service Workerによるキャッシュ
- **インストール可能**: ホーム画面への追加対応
- **プッシュ通知**: 権限取得済み（VAPID未設定）
- **アプリライク**: standaloneモードでの起動

## データフロー

```
[ユーザー入力] 
    ↓
[EnhancedInputScreen] 
    ↓
[realCalculator.ts] → [shippingDatabase.ts]
    ↓
[ResultScreen] 
    ↓
[AIAnalysisScreen] → [Vercel API] → [OpenAI API]
    ↓
[分析結果表示]
```

## デプロイメント構成

### 現在の状況
1. **Netlify**: フロントエンドアプリ（PWA対応済み）
2. **Vercel**: バックエンドAPI（AI分析のみ）
3. **ローカル**: 基本的な配送計算はクライアントサイド

### ビルドプロセス
```bash
npx expo export --platform web  # Metro bundlerでWeb向けビルド
# ↓
dist/ フォルダ生成
# ↓ 
PWAファイルを手動コピー（manifest.json, sw.js, icons/）
# ↓
Netlify Dropまたは CLI でデプロイ
```

## 課題と制約

### 現在の制約
- **Netlify Drop**: 一時的なURL、カスタムドメイン不可
- **VercelとNetlify分離**: API呼び出しでCORS考慮が必要
- **手動PWAファイルコピー**: ビルドプロセスに組み込まれていない

### 改善すべき点
- Netlify CLIへの移行（独自ドメイン対応）
- ビルドプロセス自動化（PWAファイルコピー）
- 統合されたホスティング環境検討

## 次フェーズ計画

### Phase 1: インフラ改善
- Netlify CLI移行
- カスタムドメイン設定
- 自動デプロイパイプライン構築

### Phase 2: iOS/Androidアプリ化
- Capacitor導入
- App Store/Play Store申請
- ネイティブ機能追加（カメラ、位置情報）

### Phase 3: 機能拡張
- ユーザー登録・ログイン
- 診断履歴保存
- 梱包材購入連携
- リアルタイム料金更新

## 開発環境

### 必要なツール
- Node.js 18+
- Expo CLI
- Chrome DevTools（PWAテスト）
- Netlify CLI（本格デプロイ用）

### 開発コマンド
```bash
npm start                    # Expo開発サーバー起動
npm run web                 # Web版開発サーバー
npx expo export --platform web  # 本番ビルド
netlify deploy --prod --dir dist    # 本番デプロイ
```

---

**最終更新**: 2025年8月17日  
**ステータス**: PWA実装完了、本番デプロイ済み、スマホ対応確認済み