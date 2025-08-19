# ShipSmart アプリ構成ドキュメント（2025年8月19日最終更新）

## プロジェクト概要

**アプリ名**: ShipSmart - フリマ発送診断アプリ  
**目的**: メルカリ・ヤフオク出品者向けの最安・最適な発送方法診断  
**開発状況**: PWA対応完了、iOS先行ネイティブ化準備完了  
**主目的**: 個人起業によるtoCサービス展開

## 技術スタック（実装済み）

### フロントエンド
- **React Native**: 0.79.5（Expo 53.0.20）
- **TypeScript**: ~5.8.3
- **Metro Bundler**: Expo標準（webpackではない）
- **React Native Web**: 0.20.0（Web対応）

### バックエンド・API
- **Vercel API Routes**: `/api/ai-analysis.ts`（AI分析機能）
- **OpenAI API**: GPT-4o連携（.env.localで管理）
- **ローカル計算ロジック**: `utils/realCalculator.ts`

### PWA機能
- **Service Worker**: `/public/sw.js`（オフライン対応、キャッシュ管理）
- **Manifest**: `/public/manifest.json`（アプリメタデータ）
- **アイコン**: `/public/icons/`（192x192, 512x512等）

### デプロイ環境
- **Netlify**: メインアプリホスティング（https://chimerical-cobbler-df2269.netlify.app/）
- **Vercel**: API機能のみ（AI分析エンドポイント）

### iOS開発環境（準備完了）
- **EAS Build**: iOS Development Build設定済み
- **Xcode**: 最新版インストール済み
- **iOS Simulator**: 開発・テスト環境構築済み
- **Apple Developer**: 申請中（本人確認プロセス）

## フォルダ構成（実装済み）

```
ShipSmart/
├── index.ts                     # Expoエントリーポイント
├── App.tsx                      # メインアプリコンポーネント（PWA統合済み）
├── package.json                 # 依存関係管理
├── app.json                     # Expo設定（iOS deploymentTarget: 15.1）
├── eas.json                     # EAS設定（iOS環境変数設定済み）
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
    ├── splash-icon.png          # スプラッシュ画像
    └── adaptive-icon.png        # iOS Adaptive Icon
```

## 主要機能（実装済み）

### 1. 発送診断機能
- **入力**: 商品サイズ（長さ・幅・厚さ）、重量、配送先
- **出力**: 最安TOP3の配送方法、料金比較、特徴表示
- **ロジック**: `calculateRealShipping()`で各配送業者の料金を計算

### 2. AI分析機能
- **機能**: 利益最大化、リスク分析、梱包提案、市場戦略
- **API**: OpenAI GPT-4o連携（Vercel Functions経由）
- **UI**: タブ形式の分析結果表示
- **信頼性**: 3層フォールバック（95%→88%→70%品質保証）

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
[AIAnalysisScreen] → [Vercel API] → [OpenAI GPT-4o]
    ↓
[分析結果表示]（タブ形式UI）
```

## デプロイメント構成

### 現在の状況
1. **Netlify**: フロントエンドアプリ（PWA対応済み）
2. **Vercel**: バックエンドAPI（AI分析のみ）
3. **ローカル**: 基本的な配送計算はクライアントサイド
4. **EAS**: iOS Development Build準備完了

### ビルドプロセス

#### **Web版（現在稼働中）**
```bash
npx expo export --platform web  # Metro bundlerでWeb向けビルド
# ↓
dist/ フォルダ生成
# ↓ 
PWAファイルを手動コピー（manifest.json, sw.js, icons/）
# ↓
Netlify Dropまたは CLI でデプロイ
```

#### **iOS版（準備完了）**
```bash
# Apple Developer登録完了後
eas build --profile development --platform ios
# ↓
iOS Development Build生成
# ↓
TestFlight経由での配信
# ↓
App Store申請・リリース
```

## iOS先行戦略の詳細

### 選択理由
- **開発環境**: Android端末非保有のため
- **ターゲット**: フリマ主要ユーザー層（iPhone利用率高）
- **収益性**: App Store課金システムの早期統合
- **品質**: iOS単一プラットフォーム集中による高品質実現

### iOS特有の技術要件

#### **app.json iOS設定**
```json
{
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.shipsmart.freightapp",
    "buildNumber": "1",
    "deploymentTarget": "15.1",
    "infoPlist": {
      "NSCameraUsageDescription": "商品のサイズ測定に使用します",
      "NSLocationWhenInUseUsageDescription": "最寄りの発送場所を表示するために使用します",
      "ITSAppUsesNonExemptEncryption": false
    }
  }
}
```

#### **予定ネイティブ機能**
- **expo-camera**: iOS Camera API統合
- **expo-location**: CoreLocation活用
- **expo-notifications**: Apple Push Notification Service

## 課題と制約

### 現在の制約
- **Apple Developer**: 本人確認プロセス中（最大の制約）
- **単一プラットフォーム**: iOS専用によるリーチ制限
- **手動PWAファイルコピー**: ビルドプロセスに組み込まれていない

### 改善すべき点
- Apple Developer登録の早期解決
- iOS向けネイティブ機能の段階的実装
- App Store審査通過のための品質担保

## 次フェーズ計画

### Phase 1: iOS先行リリース（今後4週間）
- Apple Developer Program登録完了
- iOS Development Build作成・テスト
- App Store Connect設定・申請

### Phase 2: iOS向け機能拡張（2-3ヶ月）
- カメラ機能（商品サイズ自動測定）
- 位置情報（発送場所検索）
- プッシュ通知（料金変動アラート）

### Phase 3: Android展開検討（市場検証後）
- iOS成功事例をもとにAndroid展開
- React Nativeの利点を活かしたクロスプラットフォーム化
- 統一されたユーザー体験の提供

### Phase 4: エコシステム拡大（6ヶ月以降）
- AI画像解析機能（カメラ連携）
- SDGs可視化機能
- 企業向けBtoBサービス

## 開発環境

### 必要なツール
- **Node.js** 18+
- **Expo CLI** 53.0.20
- **EAS CLI** 最新版
- **Xcode** 最新版（iOS開発用）
- **iOS Simulator**（テスト用）

### 開発コマンド

#### **現在の開発環境**
```bash
npm start                    # Expo Go でQRコードスキャン
npm run ios                  # iOS シミュレーター
npm run web                  # Web ブラウザ
```

#### **iOS開発環境（準備完了）**
```bash
eas env:list                 # 環境変数確認
eas build --profile development --platform ios    # iOS開発ビルド
eas submit --platform ios    # App Store申請
eas update --branch production    # OTA更新配信
```

#### **Web/PWA環境（稼働中）**
```bash
npx expo export --platform web  # 本番ビルド
netlify deploy --prod --dir dist    # 本番デプロイ
```

## セキュリティ・品質管理

### API Key管理
- **Vercel環境変数**: OpenAI APIキー（サーバーサイド）
- **EAS Secrets**: iOS向け証明書・プロファイル
- **App Store Connect**: アプリ固有のセキュリティ設定

### 品質保証
- **3層フォールバック**: AI分析の信頼性確保
- **TypeScript**: 型安全性による品質向上
- **Expo EAS**: 企業レベルのビルド・配信インフラ

## 成功指標（iOS先行）

### 技術指標
- iOS Development Build成功率: 100%
- App Store審査通過: 初回で承認
- クラッシュ率: 1%未満維持

### ビジネス指標
- App Store初日ダウンロード: 100件
- 月間アクティブユーザー: 1,000人（3ヶ月目標）
- ユーザー評価: 4.0★以上維持

---

**最終更新**: 2025年8月19日  
**ステータス**: PWA稼働中、iOS先行ネイティブ化準備完了  
**次のマイルストーン**: Apple Developer登録完了 → iOS Development Build  
**戦略**: iOS単一プラットフォーム集中による高品質・早期リリース

**重要な変更点**:
- Android開発を一旦保留、iOS先行戦略に変更
- 開発リソースをiOS最適化に集中
- Apple Developer解決後の迅速な展開体制完了