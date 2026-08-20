#!/bin/bash
# インフラ(Firebase / GCP / GitHub)を冪等に構築する。何度実行しても安全。
# 前提: firebase login(itagaki.shintaro@gmail.com)、gcloud auth(同アカウント)、gh auth login(itagakishintaro)
set -euo pipefail

PROJECT_ID=rinban-app
DISPLAY_NAME=Rinban
LOCATION=asia-northeast1
ACCOUNT=itagaki.shintaro@gmail.com
SA=github-action-deploy@${PROJECT_ID}.iam.gserviceaccount.com
REPO=itagakishintaro/rinban
ROLES=(
  roles/firebasehosting.admin
  roles/serviceusage.apiKeysViewer
  roles/run.viewer
  roles/firebaserules.admin
  roles/serviceusage.serviceUsageViewer
)

echo "== 1/7 GitHubリポジトリ"
if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "ok: $REPO"
else
  gh repo create "$REPO" --public --description "輪番(朝会司会などの交代制当番)を管理するWebアプリ"
fi

echo "== 2/7 Firebaseプロジェクト"
if gcloud projects describe "$PROJECT_ID" --account "$ACCOUNT" >/dev/null 2>&1; then
  echo "ok: $PROJECT_ID"
else
  firebase projects:create "$PROJECT_ID" --display-name "$DISPLAY_NAME" --non-interactive
fi

echo "== 3/7 API有効化"
gcloud services enable firestore.googleapis.com firebasehosting.googleapis.com firebaserules.googleapis.com \
  --project "$PROJECT_ID" --account "$ACCOUNT"

echo "== 4/7 Webアプリ登録"
# grep -q の早期終了とpipefailが競合するため、出力を変数に受けてから判定する
apps=$(firebase apps:list WEB --project "$PROJECT_ID" 2>/dev/null || true)
if echo "$apps" | grep -q "$DISPLAY_NAME"; then
  echo "ok: web app $DISPLAY_NAME"
else
  firebase apps:create web "$DISPLAY_NAME" --project "$PROJECT_ID"
  echo "NOTE: src/firebase.ts の本番設定を firebase apps:sdkconfig web --project $PROJECT_ID の値に更新すること"
fi

echo "== 5/7 Firestore DB ($LOCATION)"
if gcloud firestore databases describe --database='(default)' --project "$PROJECT_ID" --account "$ACCOUNT" >/dev/null 2>&1; then
  echo "ok: (default)"
else
  gcloud firestore databases create --database='(default)' --location "$LOCATION" \
    --project "$PROJECT_ID" --account "$ACCOUNT"
fi

echo "== 6/7 デプロイ用サービスアカウントとIAM"
if gcloud iam service-accounts describe "$SA" --project "$PROJECT_ID" --account "$ACCOUNT" >/dev/null 2>&1; then
  echo "ok: $SA"
else
  gcloud iam service-accounts create "${SA%%@*}" --display-name "GitHub Actions deploy" \
    --project "$PROJECT_ID" --account "$ACCOUNT"
fi
for role in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:$SA" \
    --role "$role" --condition=None --account "$ACCOUNT" >/dev/null
  echo "granted: $role"
done

echo "== 7/7 GitHub Secret (FIREBASE_SERVICE_ACCOUNT)"
secrets=$(gh secret list -R "$REPO" || true)
if echo "$secrets" | grep -q FIREBASE_SERVICE_ACCOUNT; then
  echo "ok: secret exists(再発行する場合はsecretを削除してから再実行)"
else
  KEY=$(mktemp)
  gcloud iam service-accounts keys create "$KEY" --iam-account "$SA" \
    --project "$PROJECT_ID" --account "$ACCOUNT"
  gh secret set FIREBASE_SERVICE_ACCOUNT -R "$REPO" < "$KEY"
  rm -f "$KEY"
fi

echo "完了"
