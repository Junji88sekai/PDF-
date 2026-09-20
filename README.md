# PDF Table of Contents Reader & Search
（PDF 目次リーダー & ページ抽出・ノンブル付与ツール）

[![Open Web App](https://img.shields.io/badge/▶_Webアプリを起動-(インストール不要)-10B981?style=for-the-badge)](https://ais-pre-h3l6yantevtjvq2pgxqsvg-472986156227.asia-northeast1.run.app)

> **💡 インストール不要ですぐに使いたい場合**  
> どのPCからでも、上記のバッジまたは以下のURLをクリックするだけでブラウザ上で直接アプリをご利用いただけます：  
> 👉 **[https://ais-pre-h3l6yantevtjvq2pgxqsvg-472986156227.asia-northeast1.run.app](https://ais-pre-h3l6yantevtjvq2pgxqsvg-472986156227.asia-northeast1.run.app)**

---

PDFのテキスト構造やレイアウトを解析して階層目次を自動生成し、全文検索、ページ番号（ノンブル）印字、および指定ページのワンクリック抽出・保存ができる高機能Webアプリケーションです。

---

## 🌟 主な機能

1. **自動目次（TOC）生成 & ジャンプ**
   - PDF読み込み時にフォントサイズや見出しパターン（第○章、1.1など）から階層目次を自動作成。
   - 目次項目をクリックすると該当ページへ即座にスムーズスクロール＆ジャンプ。
   - 手動での項目追加・編集・削除や、Markdown/JSON形式でのエクスポートにも対応。
   - Gemini AIによる文書要約＆高精度な目次再構築機能。

2. **全文インクリメンタル検索**
   - `Ctrl + F`（または `Cmd + F`）で全ページから瞬時にテキストを検索。
   - 一致件数の集計、前後文脈スニペット表示、次へ/前への巡回ナビゲーション。

3. **指定ページのワンクリック保存（単一・複数抽出）**
   - 閲覧中のページをツールバーやページ上部のボタンからワンクリックで指定フォルダに個別PDFとして即座に保存。
   - 複数ページ選択モーダルから、必要なページのみを束ねた新しいPDFや高画質PNG画像として抽出・エクスポート可能。

4. **ページ番号（ノンブル）印字・付与**
   - PDFの全ページに指定位置（中央下、右下、右上など6箇所）でページ番号を印字。
   - プレフィックス書式（`- 1 -`、`1 / N`、`Page 1 of N` など）や表紙（1ページ目）の除外、フォントサイズ・色のカスタマイズ。
   - 仕上がりをプレビューしながら、ビューアへの即時適用または完成版PDFのダウンロードが可能。

---

## 🛠 技術スタック

- **フロントエンド**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion
- **PDF処理エンジン**: 
  - `pdfjs-dist`: レンダリング、テキスト抽出、キャンバス描画
  - `pdf-lib`: PDF結合・抽出、ページ番号（ノンブル）印字
- **バックエンド**: Node.js, Express (フルスタック構成)
- **AI連携**: Google Gen AI SDK (`@google/genai`)

---

## 📦 GitHub リポジトリへのプッシュ方法

本プロジェクト（`https://github.com/Junji88sekai/PDF-`）に反映する手順：

```bash
# 1. ダウンロードしたフォルダに移動
cd <ダウンロードしたフォルダ>

# 2. Gitの初期化とファイル追加
git init
git add .
git commit -m "feat: initial release of PDF Table of Contents Reader & Exporter"

# 3. ブランチ名を main に設定
git branch -M main

# 4. リモートリポジトリ（Junji88sekai/PDF-）を紐付け
git remote add origin https://github.com/Junji88sekai/PDF-.git

# 5. プッシュを実行
git push -u origin main
```

---

## 🚀 ローカル環境での起動手順（開発用）

### 1. リポジトリのクローン
```bash
git clone https://github.com/Junji88sekai/PDF-.git
cd PDF-
```

### 2. 依存パッケージのインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.example` をコピーして `.env` を作成します。
```bash
cp .env.example .env
```
`.env` ファイルを開き、Gemini APIキーを設定します（AI目次生成機能を利用する場合）:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```
※ Gemini APIキーが未設定の場合でも、ローカル解析による目次生成、全文検索、ノンブル印字、ページ抽出保存などの主要機能はすべてそのまま動作します。

### 4. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

