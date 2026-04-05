import { readFileSync, writeFileSync } from 'fs';

// ============ 1. Figma API Fetch ============

// .env.local에서 토큰 로드
try {
  const env = readFileSync('./.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  });
} catch {}

const TOKEN = process.env.FIGMA_TOKEN;
const FILE_ID = 'Ggxs3Hsa0jAQy4m0780dlC';
const NODE_ID = '1:2';

if (!TOKEN) {
  console.error('FIGMA_TOKEN 환경변수가 필요합니다.');
  console.error('.env.local에 FIGMA_TOKEN=your_token 을 추가하세요.');
  process.exit(1);
}

const url = `https://api.figma.com/v1/files/${FILE_ID}/nodes?ids=${NODE_ID.replace(':', '-')}`;
console.log('Figma API 호출 중...');

const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });

if (!res.ok) {
  console.error(`API 오류: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const data = await res.json();
writeFileSync('./figma_card.json', JSON.stringify(data, null, 2));
console.log('→ figma_card.json 저장 완료');

// ============ 2. Parse ============

const root = data.nodes['1:2'].document;

const TAG_NAMES = new Set(['engineer', 'designer', 'advocator', 'civil servants', 'writer', 'marketing', 'legal']);

const CATEGORY_MAP = {
  'オープンガバメント': 'open gov',
  'オープンデータ': 'open data',
  'シビックテック': 'civic tech',
  'オープンソース': 'open source',
};

function getText(node) {
  if (!node) return '';
  if (node.type === 'TEXT') return node.characters?.trim() ?? '';
  for (const child of node.children ?? []) {
    const t = getText(child);
    if (t) return t;
  }
  return '';
}

function findChild(node, name) {
  return node.children?.find(c => c.name === name);
}

function getLinks(node) {
  const links = [];
  if (node.type === 'TEXT') {
    const url = node.style?.hyperlink?.url;
    const text = node.characters?.trim();
    if (url && text && text !== '🔗') {
      links.push({ text, url });
    }
    return links;
  }
  for (const child of node.children ?? []) {
    links.push(...getLinks(child));
  }
  return links;
}

function getTags(node) {
  const tags = [];
  if (node.type === 'INSTANCE' && TAG_NAMES.has(node.name)) {
    tags.push(node.name);
    return tags;
  }
  for (const child of node.children ?? []) {
    tags.push(...getTags(child));
  }
  return tags;
}

function parseCard(cardNode) {
  const title = getText(findChild(cardNode, 'Heading 3'));
  const container = findChild(cardNode, 'Container');
  const descNode = container ? findChild(container, 'Strong:margin') : null;
  const description = descNode ? getText(descNode) : '';
  const margins = container?.children?.filter(c => c.name === 'Margin') ?? [];
  const tags = margins[0] ? getTags(margins[0]) : [];
  const content = margins[1] ? getText(margins[1]) : '';
  const listNode = container ? findChild(container, 'List:margin') : null;
  const links = listNode ? getLinks(listNode) : [];

  return { title, description, content, tags, links };
}

function parseSectionTitle(text) {
  const type = text.includes('プロジェクトカード') ? 'project' : 'job';
  let category = '';
  for (const [ja, en] of Object.entries(CATEGORY_MAP)) {
    if (text.includes(ja)) { category = en; break; }
  }
  return { type, category };
}

function walk(node, context, results) {
  if (node.name === 'Heading 2') {
    const text = getText(node);
    if (text) {
      const { type, category } = parseSectionTitle(text);
      context.type = type;
      context.category = category;
    }
  }

  if (node.name === 'Background+Border+Shadow') {
    const card = parseCard(node);
    const { tags, ...cardData } = card;
    results.push({
      ...cardData,
      type: context.type,
      category: context.category,
      tags,
      image: '',
    });
    return;
  }

  for (const child of node.children ?? []) {
    walk(child, context, results);
  }
}

const context = { type: 'project', category: '' };
const results = [];
walk(root, context, results);

console.log(`총 카드 수: ${results.length}`);
writeFileSync('./figma-cards-output.json', JSON.stringify(results, null, 2));
console.log('→ figma-cards-output.json 저장 완료');
