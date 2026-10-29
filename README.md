# Content True 日本語テキスト事前確認 MCP

[Content True の AI チェッカー](https://contenttrue.org/)を使う前に、文章の長さと段落構成をローカルで確認する MCP サーバーです。AI 生成判定は公式サイトで行い、このサーバーは検出結果や確率を作りません。

- `inspect_text`: 空白を除いた文字数、日本語文字数、段落数を数えます。公式サイトが推奨する200文字以上かどうかも確認します。
- `split_paragraphs`: 長い文章を段落の境界で分割します。段落が上限を超える場合はエラーにして、文脈を勝手に切りません。
- `get_official_links`: 公式サイトへのリンクを返します。

文章を確認するときは、まず文字数を見てから、必要に応じて段落単位で整えてください。その後に [AI チェッカー](https://contenttrue.org/) で分析しても、判定だけで著者や文章の真偽を断定しないでください。出典や執筆過程も併せて確認することが大切です。

## 実行

Node.js 20.18.1 以降:

```sh
npm install
npm test
node index.mjs
```

MCP クライアントでは `node /absolute/path/to/contenttrue-mcp/index.mjs` を stdio プロセスとして登録します。このサーバー自体はネットワーク通信しません。ただし、MCP クライアントや AI モデルへ文章を渡す場合は、そのサービスのプライバシー設定を確認してください。MIT ライセンス。`LICENSE` を参照。
