/**
 * Bước 0: Dump nguyên dữ liệu thô từ WordPress REST API vào _backup/raw-json/
 * Chạy: node scripts/backup-wp.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = 'https://kclearncode.com';
const OUT = join(process.cwd(), '_backup', 'raw-json');

const ENDPOINTS = [
  { name: 'posts', path: '/wp-json/wp/v2/posts', params: { per_page: 100, _embed: 1, status: 'publish' } },
  { name: 'pages', path: '/wp-json/wp/v2/pages', params: { per_page: 100, _embed: 1, status: 'publish' } },
  { name: 'categories', path: '/wp-json/wp/v2/categories', params: { per_page: 100, hide_empty: false } },
  { name: 'tags', path: '/wp-json/wp/v2/tags', params: { per_page: 100, hide_empty: false } },
  { name: 'media', path: '/wp-json/wp/v2/media', params: { per_page: 100 } },
  { name: 'users', path: '/wp-json/wp/v2/users', params: { per_page: 100 } },
];

/** Lấy hết các trang của một endpoint (WP giới hạn 100/lần). */
async function fetchAll({ name, path, params }) {
  const all = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL(path, SITE);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
    url.searchParams.set('page', String(page));

    const res = await fetch(url, { headers: { 'User-Agent': 'kcblog-migration/1.0' } });
    if (!res.ok) {
      // Hết trang thì WP trả 400 rest_post_invalid_page_number
      if (res.status === 400 && page > 1) break;
      throw new Error(`${name} page ${page}: HTTP ${res.status} ${res.statusText}`);
    }

    if (page === 1) {
      totalPages = Number(res.headers.get('x-wp-totalpages') ?? 1);
      const total = res.headers.get('x-wp-total');
      console.log(`  ${name}: ${total ?? '?'} bản ghi, ${totalPages} trang`);
    }

    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    page++;
  }

  return all;
}

await mkdir(OUT, { recursive: true });
console.log(`Backup từ ${SITE} → _backup/raw-json/\n`);

const summary = {};
for (const ep of ENDPOINTS) {
  try {
    const data = await fetchAll(ep);
    await writeFile(join(OUT, `${ep.name}.json`), JSON.stringify(data, null, 2), 'utf8');
    summary[ep.name] = data.length;
    console.log(`  ✓ ${ep.name}.json — ${data.length} bản ghi\n`);
  } catch (err) {
    summary[ep.name] = `LỖI: ${err.message}`;
    console.error(`  ✗ ${ep.name} thất bại: ${err.message}\n`);
  }
}

console.log('--- Tổng kết ---');
for (const [k, v] of Object.entries(summary)) console.log(`${k.padEnd(12)} ${v}`);
