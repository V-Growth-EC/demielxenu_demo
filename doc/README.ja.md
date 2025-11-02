これは [Next.js](https://nextjs.org) を使用して作成されたプロジェクトで、[`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) で初期化されています。

## はじめに

まず、開発サーバーを起動します：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認できます。

`app/page.js` を編集することでページの編集を開始できます。ファイルを編集すると、ページは自動的に更新されます。

このプロジェクトは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使用して、Vercel の新しいフォントファミリーである [Geist](https://vercel.com/font) を自動的に最適化して読み込みます。

## デプロイ手順

### ローカルビルド

プロジェクトをローカルでビルドするには：

```bash
npm run build
```

### SFTP デプロイ

1. **デプロイの準備**

   デプロイスクリプトを実行してデプロイパッケージを作成：
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   これにより、必要なファイルを含む `deploy.tar.gz` ファイルが作成されます。

2. **サーバーへのアップロード**

   SFTP クライアント（FileZilla や Cyberduck など）を使用：
   - ホスト：サーバーの IP またはドメイン
   - ユーザー名：SFTP ユーザー名
   - パスワード：SFTP パスワード
   - ポート：通常は 22

   `deploy.tar.gz` ファイルをサーバーにアップロードします。

3. **サーバー設定**

   サーバーで以下のコマンドを実行：
   ```bash
   # デプロイパッケージを解凍
   tar -xzf deploy.tar.gz
   
   # デプロイディレクトリに移動
   cd deploy
   
   # 本番環境の依存関係をインストール
   npm install --production
   
   # アプリケーションを起動
   npm start
   ```

4. **本番環境の注意事項**

   - サーバーに Node.js と npm がインストールされていることを確認
   - 適切な環境変数を設定
   - 本番環境では PM2 などのプロセス管理ツールの使用を推奨
   - ウェブサーバー（nginx、Apache）を設定して Next.js アプリケーションへのリクエストをプロキシ

## 詳細情報

Next.js の詳細については、以下のリソースをご覧ください：

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能と API について学ぶ
- [Next.js を学ぶ](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル

[Next.js GitHub リポジトリ](https://github.com/vercel/next.js) でソースコードを確認できます - フィードバックや貢献を歓迎します！

## Vercel へのデプロイ

Next.js アプリケーションをデプロイする最も簡単な方法は、Next.js の作成者である [Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を使用することです。

詳細については [Next.js デプロイドキュメント](https://nextjs.org/docs/app/building-your-application/deploying) をご覧ください。 