import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

export const officialLinks = Object.freeze({ checker: 'https://contenttrue.org/', pricing: 'https://contenttrue.org/pricing', privacy: 'https://contenttrue.org/privacy' });

export function inspectText(text) {
  const normalized = text.normalize('NFC').replace(/\r\n?/g, '\n');
  const characters = [...normalized.replace(/\s/g, '')].length;
  const paragraphs = normalized.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
  const japaneseCharacters = [...normalized].filter(ch => /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(ch)).length;
  return { charactersExcludingWhitespace: characters, paragraphCount: paragraphs.length, japaneseCharacters, meetsSuggestedMinimum: characters >= 200, note: characters < 200 ? '公式サイトは200文字以上を推奨しています。短い文章の判定は慎重に解釈してください。' : '判定結果は参考情報として扱い、文章の出典や作成過程も確認してください。' };
}

export function splitParagraphs(text, maxCharacters) {
  const paragraphs = text.normalize('NFC').replace(/\r\n?/g, '\n').split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if ([...paragraph].length > maxCharacters) throw new Error('A paragraph exceeds maxCharacters; split that paragraph manually to preserve context.');
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if ([...candidate].length > maxCharacters) { chunks.push(current); current = paragraph; }
    else current = candidate;
  }
  if (current) chunks.push(current);
  return { chunks: chunks.map((value, index) => ({ part: index + 1, characters: [...value].length, text: value })), note: '段落の境界で分割しました。各部分の判定を文書全体の確定判定として扱わないでください。' };
}

const reply = value => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] });
export function createServer() {
  const server = new McpServer({ name: 'contenttrue-japanese-text-preflight', version: '0.1.0' });
  server.registerTool('inspect_text', { title: '文章を事前確認', description: '文章量と日本語文字数をローカルで確認します。AI生成かどうかは判定しません。', inputSchema: z.object({ text: z.string().min(1).max(50000) }) }, async ({ text }) => reply(inspectText(text)));
  server.registerTool('split_paragraphs', { title: '段落単位で文章を分割', description: '長い文章を段落の境界で分けます。サーバーへのアップロードは行いません。', inputSchema: z.object({ text: z.string().min(1).max(50000), maxCharacters: z.number().int().min(200).max(20000) }) }, async ({ text, maxCharacters }) => { try { return reply(splitParagraphs(text, maxCharacters)); } catch (error) { return { ...reply({ error: error.message }), isError: true }; } });
  server.registerTool('get_official_links', { title: '公式リンク', description: '公式の AI チェッカーと関連ページを返します。', inputSchema: z.object({}) }, async () => reply(officialLinks));
  return server;
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) void serveStdio(createServer);
