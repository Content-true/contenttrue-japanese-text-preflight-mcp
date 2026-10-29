import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { inspectText, splitParagraphs } from './index.mjs';

test('counts Japanese characters and suggested minimum', () => {
  assert.equal(inspectText('日本語の文章です。').japaneseCharacters, 8);
  assert.equal(inspectText('短文').meetsSuggestedMinimum, false);
});
test('splits only at paragraph boundaries', () => {
  assert.deepEqual(splitParagraphs('a'.repeat(150) + '\n\n' + 'b'.repeat(150), 200).chunks.map(x => x.characters), [150, 150]);
  assert.throws(() => splitParagraphs('a'.repeat(201), 200));
});
test('MCP client can call official links', async () => {
  const client = new Client({ name: 'contenttrue-test', version: '0.1.0' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [new URL('./index.mjs', import.meta.url).pathname] }));
  try {
    assert.equal((await client.listTools()).tools.length, 3);
    const result = await client.callTool({ name: 'get_official_links', arguments: {} });
    assert.equal(JSON.parse(result.content[0].text).checker, 'https://contenttrue.org/');
  } finally { await client.close(); }
});
