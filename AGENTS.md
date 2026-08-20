# AGENTS.md

Rinban: 輪番(朝会司会などの交代制当番)を管理するWebアプリ。
React 19 + Vite + TypeScript + Tailwind CSS 4 / Firebase(Firestore + Hosting)完全サーバーレス。

## ルール

1. 不明点は推測せず、必ずユーザーに質問して確認してから作業する
2. 作業単位ごとにユーザーのレビューを受け、コミットしてから次に進む
3. 仕様確認 → BDD振る舞いテスト → TDDユニットテスト → プロダクションコード実装 → Green の順で進める
4. 作業ごとにGitHub Issueを作成してから着手する
5. PRにはユーザーがレビューすべき内容を明記する
6. 秘密情報はコードに書かず、Firebase Secret Manager / GitHub Secretsに保管する
7. 開発・テストは常にFirebase Emulator Suiteを使い、本番Firestoreに触れない
8. ドキュメント・コード・回答はすべて「必要十分で情報は多いが無駄のないシンプルな記述」にする。メタな説明や重複を書かない

## 参照

| 状況 | 参照先 |
| --- | --- |
| 機能・仕様・アクセス制御・技術スタック | [README.md](./README.md) |
| 実装作業(開発サイクル、BDD/TDDの手順、テスト、エミュレータ) | [DEVELOPMENT.md](./DEVELOPMENT.md) |
| git / GitHub操作(commit・push・Issue・PR・ブランチ) | [DEVELOPMENT.md](./DEVELOPMENT.md)「リポジトリ・アカウント」「ブランチ・コミット規約」 |
| CI/CD・デプロイ | [DEVELOPMENT.md](./DEVELOPMENT.md)「CI/CD」「デプロイ」 |
| 設計・データモデル・ローテーション仕様 | `docs/design.md` |
| Claude Codeのhook等ハーネス設定 | [DEVELOPMENT.md](./DEVELOPMENT.md)「AI駆動開発のハーネス」 |

## コマンド

```bash
npm run dev          # 開発サーバー
npm run lint         # ESLint
npm run test         # Vitest(ユニットテスト)
npm run test:e2e     # playwright-bdd(振る舞いテスト、エミュレータ必須)
npm run build        # 本番ビルド
firebase emulators:start   # Firestore + Hosting エミュレータ
```
