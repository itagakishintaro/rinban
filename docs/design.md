# 全体設計書

機能要件・技術スタックは [README.md](../README.md) を参照。

## 設計方針

- **担当者は計算で決める(状態を持たない)** — 「現在の担当index」のような可変状態をDBに持たず、ローテーション設定・メンバー順序・基準日から任意の日付の担当者を純粋関数で決定論的に計算する。スケジュール実行による状態更新が不要になり、サーバーレス・従量課金と相性がよい
- **例外は日付キーの上書きで表現** — 入れ替えなどの例外は `overrides`(日付→メンバーID)として保存し、表示時に計算結果より優先する
- **1グループ=1ドキュメント** — メンバー・順序・設定・例外をすべて1つのFirestoreドキュメントに収め、1回のread(＋リアルタイムリスナー1本)で画面を構成する

## アーキテクチャ

```
src/
  domain/        # ローテーション計算などの純粋関数(Reactにも Firestoreにも依存しない)
  firebase.ts    # Firebase初期化(開発時はエミュレータへ自動接続)
  hooks/         # Firestoreの購読・更新(useGroup など)
  pages/         # 画面(Home, Group)
  components/    # UI部品
features/        # BDD(Gherkin + playwright-bdd)
```

- ドメインロジックは `src/domain/` に隔離し、VitestでTDDする
- Firestoreへのアクセスはhooksに集約する。コンポーネントはドメイン関数とhooksを組み合わせるだけにする
- Cloud FunctionsはMVPでは使わない(メール通知の実装時に導入)

## データモデル(Firestore)

```
groups/{groupId}
{
  name: string,                 // グループ名(例: 朝会司会)
  members: [                    // 上限50人
    { id: string, name: string }
    // メール通知実装時に email, notify を拡張する
  ],
  order: string[],              // member.id の並び。輪番はこの順で回る
  rotation: {
    type: 'weekly' | 'biweekly' | 'monthly',
    weekday?: number,           // 0(日)〜6(土)。weekly / biweekly で必須
    dayOfMonth?: number,        // 1〜31。monthly で必須。月にその日がなければ月末に丸める
    anchorDate: string          // 'YYYY-MM-DD'。開始日かつ隔週の基準日
  },
  overrides: {                  // 例外。表示時に通常計算より優先
    [date: string]: string      // 'YYYY-MM-DD' → member.id
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

- `groupId` はFirestoreの自動ID(20文字、推測不能)。URLの `/g/{groupId}` に使う
- タイムゾーンはAsia/Tokyo固定。日付はすべて 'YYYY-MM-DD' 文字列で扱う

## ドメインロジック

### 開催日の計算

`occurrences(rotation, from, n)` — from以降の開催日をn件返す純粋関数。

- weekly: anchorDate以降の毎週weekday
- biweekly: anchorDateを含む週を第0週として、偶数週のweekday
- monthly: 毎月dayOfMonth。存在しない月(例: 2/31)はその月の末日

### 担当者の計算

`assignee(group, date)` — 開催日dateの担当者を返す純粋関数。

1. `overrides[date]` があり、そのIDが `members` に存在すればその人(存在しないIDなら無視して2へ)
2. なければ `order[k % order.length]`(k = anchorDateからdateまでの通算開催回数)

### 入れ替え

「Aの担当回(date1)とBの担当回(date2)を交換する」= `overrides[date1] = B, overrides[date2] = A` を1回の更新で書き込む。

- UIでは自分の担当回を選び、交換相手(の担当回)を選ぶ
- 取り消しは該当エントリの削除

### メンバー・順序・設定の変更の影響

- `order` や `rotation` を変更すると、それ以降の担当は計算式どおりに引き直される(将来分の担当が変わりうる)。個別に維持したい回は入れ替え(override)で調整する
- メンバー削除時は `order` からも除く。`overrides` に残った無効IDは表示時に無視される

## URL・画面

| URL | 画面 | 内容 |
| --- | --- | --- |
| `/` | Home | グループ作成(名前を入れて作成→ `/g/{groupId}` へ遷移) |
| `/g/{groupId}` | Group | 今回・次回の担当の強調表示、今後の予定一覧(次10回)、メンバー管理、順序の並べ替え、ローテーション設定、入れ替え操作 |

Groupは1画面に集約し、編集はインライン/モーダルで行う。存在しないgroupIdは404表示。

## セキュリティルール

- `get`: 誰でも可(URLを知っている=アクセス権)
- `list`: 拒否(グループIDの列挙を防ぐ)
- `create`, `update`: 誰でも可。ただしスキーマ検証(フィールド型、members上限50、name長さ上限など)をルールで行う
- `delete`: 拒否(誤削除・荒らし防止。グループ削除機能は要件外)

## テスト戦略

| 対象 | 手法 |
| --- | --- |
| `src/domain/`(開催日・担当計算・入れ替え) | Vitestでユニットテスト(TDDの主戦場) |
| ユーザーストーリー(グループ作成〜入れ替えまでの操作) | 日本語Gherkin + playwright-bdd。Firestoreエミュレータ上で実行 |
| セキュリティルール | `@firebase/rules-unit-testing` + Vitest(エミュレータ上) |

## マイルストーン

1機能=1 Issue で進める。

1. アプリケーション骨格 — Vite + React + Tailwind + Firebase初期化、エミュレータ接続、テスト環境(Vitest / playwright-bdd)、CI/CD(GitHub Actions)
2. グループ作成と表示(MVPの土台)
3. メンバーの追加・変更・削除
4. ローテーション設定と担当計算・予定一覧表示
5. 順序の設定・変更
6. 入れ替え
7. (MVP後)メール通知 — 送信サービス選定、Cloud Functions + Cloud Scheduler、通知設定UI
