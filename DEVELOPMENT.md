# DEVELOPMENT.md

## リポジトリ・アカウント

- GitHub: 個人アカウント `itagakishintaro` / リポジトリ `itagakishintaro/rinban`(public)
- push はSSHホストエイリアス `github.com-personal` 経由: `git@github.com-personal:itagakishintaro/rinban.git`
- `gh` コマンド(Issue・PR作成等)の前に `gh auth switch -u itagakishintaro` で個人アカウントに切り替える(通常は会社アカウントがactive)
- git user.email: `itagaki.shintaro@gmail.com`
- Firebase: `itagaki.shintaro@gmail.com` のアカウントで作成した専用プロジェクト(Blazeプラン)

## 開発サイクル

1. **Issue作成** — `gh issue create` で作業内容をdescriptionに記載。実装計画はIssueコメントに記載する
2. **ブランチ作成** — `feature/issue-<番号>-<短い説明>` をmainから切る
3. **BDD** — 仕様を `features/*.feature`(Gherkin、日本語)に記述し、playwright-bddでステップを実装(この時点ではRed)
4. **TDD** — Vitestでユニットテストを書き(Red)、プロダクションコードを実装してGreenにし、リファクタリング
5. **レビュー依頼** — PRを作成。本文に「レビューすべき内容」(変更点・確認手順・判断を仰ぎたい点)を明記する
6. **マージ** — ユーザーの承認後にmainへマージ。mainマージでHostingへ自動デプロイされる

## ブランチ・コミット規約

- ブランチ: `feature/issue-12-member-crud` のように Issue 番号を含める
- コミットメッセージ: [Conventional Commits](https://www.conventionalcommits.org/ja/)(`feat:` `fix:` `test:` `docs:` `chore:` など)。本文は日本語可
- コミットは意味のある単位で小さく。テストが通る状態でコミットする

## テストの配置と実行

| 種類 | 場所 | 実行 |
| --- | --- | --- |
| 振る舞いテスト(BDD) | `features/` | `npm run test:e2e`(エミュレータ起動が前提) |
| ユニットテスト(TDD) | `src/**/*.test.ts(x)` | `npm run test` |

### Firestoreエミュレータ

- アプリは開発モード(`import.meta.env.DEV`)のとき自動的にエミュレータへ接続する実装にする
- CIのE2Eテストは `firebase emulators:exec` で実行する

## CI/CD(GitHub Actions)

- **PR時**: lint → ユニットテスト → ビルド → E2Eテスト(エミュレータ上)。全部Greenでないとマージ不可
- **mainマージ時**: ビルドしてFirebase Hostingへ自動デプロイ
- デプロイ用のFirebaseサービスアカウントJSONはGitHub Secrets(`FIREBASE_SERVICE_ACCOUNT`)に登録する

## デプロイ(手動)

```bash
npm run build
firebase deploy --only hosting
```

## AI駆動開発のハーネス

- `.claude/settings.json` — PostToolUse hookでファイル編集後にPrettierを自動適用(実体は `.claude/hooks/format.sh`。node_modules未導入時は何もしない)
- Claude CodeはAuto Modeで運用する(権限allowlistは設けない)
- ドキュメントの分担: AGENTS.md=ルール / README.md=仕様 / DEVELOPMENT.md=開発手順。重複させない

## ドキュメント

- 全体設計書: `docs/design.md`(設計変更時は必ず更新する)
- 大きな技術判断はIssue/PRに記録を残す
