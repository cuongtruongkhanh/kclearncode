/**
 * Kiểm tra kết quả migrate một cách tự động. Chạy SAU `npm run build`:
 *   npm run build && npm run verify
 *
 * Mỗi phép kiểm tra đối chiếu dist/ với dữ liệu gốc trong _backup/raw-json/,
 * nên nếu migrate làm mất bài, mất ảnh hay sót HTML thô thì sẽ fail ở đây.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const POSTS = join(ROOT, 'src', 'content', 'posts');
const RAW = join(ROOT, '_backup', 'raw-json');

let failed = 0;
let passed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`);
  }
}

/** Liệt kê đệ quy mọi file trong một thư mục. */
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error('Chưa có thư mục dist/. Chạy `npm run build` trước.');
  process.exit(1);
}

// Đọc domain từ astro.config.mjs thay vì viết cứng ở đây — nếu không, đổi domain là
// phép kiểm tra canonical bên dưới sẽ so với địa chỉ cũ và báo đạt một cách sai lệch.
const { default: astroConfig } = await import('../astro.config.mjs');
const SITE_URL = astroConfig.site.replace(/\/+$/, '');

// Trừ ra các bài đã chủ ý xoá, để phép kiểm tra "không mất bài nào" vẫn có ý nghĩa:
// nó phải fail khi bài biến mất do lỗi migrate, chứ không fail vì chủ blog cố tình bỏ bài.
const { REMOVED_WP_IDS, REMOVED_POSTS } = await import('./removed-posts.mjs');
const allWpPosts = JSON.parse(await readFile(join(RAW, 'posts.json'), 'utf8'));
const wpPosts = allWpPosts.filter((p) => !REMOVED_WP_IDS.has(p.id));

// Đọc consts.ts dạng text: Node không import được TypeScript, mà nếu bọc try/catch thì
// phép kiểm tra sẽ âm thầm bị bỏ qua — tệ hơn là không có nó.
const constsSrc = await readFile(join(ROOT, 'src', 'consts.ts'), 'utf8');

const mdFiles = (await readdir(POSTS)).filter((f) => f.endsWith('.md'));
const mdSources = new Map();
for (const f of mdFiles) mdSources.set(f, await readFile(join(POSTS, f), 'utf8'));

// Bài viết mới (viết trực tiếp trên Astro, không đến từ WordPress) không có `wpId`.
// Phải cộng thêm vào số bài mong đợi, nếu không mọi phép đếm bên dưới sẽ fail
// mỗi lần chủ blog đăng bài mới — trong khi mục đích của chúng là canh việc *mất* bài.
const nativePosts = [...mdSources].filter(([, src]) => !/^wpId:\s*\d+/m.test(src));
const expectedPosts = wpPosts.length + nativePosts.length;
const distFiles = await walk(DIST);
const htmlFiles = distFiles.filter((f) => f.endsWith('.html'));

// ------------------------------------------------------- 1. Đủ số bài
console.log('\n[1] Số lượng bài viết');
console.log(
  `      (WordPress có ${allWpPosts.length} bài, đã chủ ý xoá ${REMOVED_POSTS.length} → còn ${wpPosts.length}` +
    `, cộng ${nativePosts.length} bài viết mới → cần ${expectedPosts})`,
);
check(
  `Số file .md khớp số bài cần có (${expectedPosts})`,
  mdFiles.length === expectedPosts,
  `có ${mdFiles.length} file .md, cần ${expectedPosts} bài`,
);

// Bài đã xoá thì phải xoá thật, không được sót lại
const resurrected = [...mdSources].filter(([, src]) => {
  const m = src.match(/^wpId:\s*(\d+)/m);
  return m && REMOVED_WP_IDS.has(Number(m[1]));
});
check(
  'Bài đã chủ ý xoá không bị tạo lại',
  resurrected.length === 0,
  resurrected.map(([f]) => f).join(', '),
);

const postPages = htmlFiles.filter((f) => f.includes(`${join('dist', 'posts')}`) || /dist[\\/]posts[\\/]/.test(f));
check(
  `Số trang bài đã build khớp (${expectedPosts})`,
  postPages.length === expectedPosts,
  `build ra ${postPages.length} trang trong dist/posts/`,
);

// Không bài nào bị mất: mọi wpId phải xuất hiện đúng 1 lần
const wpIds = new Set(wpPosts.map((p) => p.id));
const mdIds = new Set();
for (const [, src] of mdSources) {
  const m = src.match(/^wpId:\s*(\d+)/m);
  if (m) mdIds.add(Number(m[1]));
}
const missing = [...wpIds].filter((id) => !mdIds.has(id));
check('Không bài nào bị bỏ sót (đối chiếu theo wpId)', missing.length === 0, `thiếu wpId: ${missing.join(', ')}`);

// ------------------------------------------------------- 2. Không sót rác WordPress
console.log('\n[2] Không còn dấu vết WordPress trong nội dung');

// Chỉ soi phần VĂN XUÔI: bỏ nội dung trong code fence và inline code, vì bài viết có thể
// cố ý chứa ví dụ HTML (`<div class="row">`) — đó là nội dung, không phải rác WordPress.
// Riêng <span> màu của Shiki lọt vào code fence đã có phép kiểm tra riêng ở mục [4].
const mdProse = new Map(
  [...mdSources].map(([f, src]) => [f, src.replace(/^```[\s\S]*?^```$/gm, '').replace(/`[^`\n]*`/g, '')]),
);

const banned = [
  ['class WordPress (wp-block-)', /wp-block-/],
  ['đường dẫn wp-content', /kclearncode\.com\/wp-content/],
  ['thẻ span có style inline', /<span style=/],
  ['thẻ div thô', /<div[\s>]/],
  ['shortcode WordPress', /\[caption|\[gallery|\[embed/],
];
for (const [label, re] of banned) {
  const hits = [...mdProse].filter(([, prose]) => re.test(prose)).map(([f]) => f);
  check(`Không còn ${label}`, hits.length === 0, hits.join(', '));
}

// Ảnh: không còn URL trỏ ra internet, TRỪ trong HTML comment ghi chú ảnh đã chết
const externalImages = [];
for (const [f, src] of mdSources) {
  const withoutComments = src.replace(/<!--[\s\S]*?-->/g, '');
  for (const m of withoutComments.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)) {
    externalImages.push(`${f} → ${m[1]}`);
  }
  const hero = withoutComments.match(/^heroImage:\s*"(https?:\/\/[^"]+)"/m);
  if (hero) externalImages.push(`${f} → hero ${hero[1]}`);
}
check(
  'Mọi ảnh đều trỏ về local (không phụ thuộc hosting cũ)',
  externalImages.length === 0,
  externalImages.join('\n      '),
);

// ------------------------------------------------------- 3. Ảnh tồn tại thật
console.log('\n[3] Ảnh có thật trên đĩa');

const referenced = new Set();
for (const [, src] of mdSources) {
  for (const m of src.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) referenced.add(m[1]);
  const hero = src.match(/^heroImage:\s*"(\/images\/[^"]+)"/m);
  if (hero) referenced.add(hero[1]);
}
for (const file of await readdir(join(ROOT, 'public', 'games')).catch(() => [])) {
  const src = await readFile(join(ROOT, 'public', 'games', file), 'utf8');
  for (const m of src.matchAll(/src="(\/images\/[^"]+)"/g)) referenced.add(m[1]);
}

const brokenImages = [];
for (const path of referenced) {
  const onDisk = join(ROOT, 'public', path.replace(/^\//, ''));
  const inDist = join(DIST, path.replace(/^\//, ''));
  if (!existsSync(onDisk) || !existsSync(inDist)) brokenImages.push(path);
}
check(
  `Cả ${referenced.size} ảnh được tham chiếu đều tồn tại trong public/ và dist/`,
  brokenImages.length === 0,
  brokenImages.join('\n      '),
);

// Mọi bài đều có ảnh đại diện (WordPress có đủ 30 featured image)
const noHero = [...mdSources].filter(([, src]) => !/^heroImage:/m.test(src)).map(([f]) => f);
check('Mọi bài đều có heroImage', noHero.length === 0, noHero.join(', '));

// ------------------------------------------------------- 4. Code block
console.log('\n[4] Code block');

const totalFences = [...mdSources].reduce((n, [, src]) => n + (src.match(/^```/gm) ?? []).length, 0);
check('Số dấu ``` là số chẵn (không có fence hở)', totalFences % 2 === 0, `đếm được ${totalFences}`);

// Số code block trên WordPress phải bằng số fence trong markdown
const wpCodeBlocks = wpPosts.reduce((n, p) => {
  const c = p.content.rendered;
  return n + (c.match(/<pre[\s>]/g) ?? []).length;
}, 0);
const mdCodeBlocks = totalFences / 2;
check(
  `Số code block khớp WordPress (WP: ${wpCodeBlocks} thẻ <pre>, markdown: ${mdCodeBlocks} block)`,
  mdCodeBlocks >= wpCodeBlocks,
  'markdown ít code block hơn WordPress → có thể đã mất code',
);

// Không còn span màu của Shiki lọt vào trong code block
const shikiLeak = [...mdSources].filter(([, src]) => /```[\s\S]*?<span style="color/.test(src)).map(([f]) => f);
check('Không còn <span> màu của Shiki lọt vào code block', shikiLeak.length === 0, shikiLeak.join(', '));

// Code block trong HTML đã build phải được highlight (có class astro-code)
let highlighted = 0;
for (const f of postPages) {
  const html = await readFile(f, 'utf8');
  highlighted += (html.match(/class="astro-code/g) ?? []).length;
}
check(`Code block đã được Shiki highlight trong HTML (${highlighted} block)`, highlighted >= mdCodeBlocks);

// ------------------------------------------------------- 5. Trang & feed
console.log('\n[5] Trang, sitemap, RSS');

for (const p of ['index.html', 'blog/index.html', 'categories/index.html', '404.html', 'rss.xml', 'sitemap-index.xml']) {
  check(`Có ${p}`, existsSync(join(DIST, p)));
}

// ---- Phân trang /blog/: mỗi trang đúng POSTS_PER_PAGE bài, cộng lại đủ tổng số bài
const perPage = Number(constsSrc.match(/POSTS_PER_PAGE\s*=\s*(\d+)/)?.[1] ?? 0);
check('Đọc được POSTS_PER_PAGE từ src/consts.ts', perPage > 0);

const expectedPages = Math.ceil(mdFiles.length / perPage);
const blogPages = [];
for (let n = 1; n <= expectedPages + 1; n++) {
  const f = n === 1 ? join(DIST, 'blog', 'index.html') : join(DIST, 'blog', String(n), 'index.html');
  if (existsSync(f)) blogPages.push({ n, html: await readFile(f, 'utf8') });
}
check(
  `Số trang /blog/ đúng (${expectedPages} trang cho ${mdFiles.length} bài, ${perPage} bài/trang)`,
  blogPages.length === expectedPages,
  `tìm thấy ${blogPages.length} trang`,
);

const perPageCounts = blogPages.map((p) => (p.html.match(/class="post-card__title"/g) ?? []).length);
check(
  `Tổng bài trên các trang /blog/ khớp (${mdFiles.length})`,
  perPageCounts.reduce((a, b) => a + b, 0) === mdFiles.length,
  `đếm được ${perPageCounts.join(' + ')} = ${perPageCounts.reduce((a, b) => a + b, 0)}`,
);
check(
  'Mọi trang trừ trang cuối đều đủ số bài mỗi trang',
  perPageCounts.slice(0, -1).every((c) => c === perPage),
  `số bài từng trang: ${perPageCounts.join(', ')}`,
);

// rel=prev/next phải đúng: trang đầu không có prev, trang cuối không có next
if (blogPages.length > 1) {
  const first = blogPages[0].html;
  const last = blogPages.at(-1).html;
  check('Trang /blog/ đầu tiên không có rel="prev"', !/<link rel="prev"/.test(first));
  check('Trang /blog/ đầu tiên có rel="next"', /<link rel="next"/.test(first));
  check('Trang /blog/ cuối không có rel="next"', !/<link rel="next"/.test(last));
  check('Trang /blog/ cuối có rel="prev"', /<link rel="prev"/.test(last));
}

// Không bài nào bị trùng hoặc thiếu khi trải qua các trang
const slugsOnPages = blogPages.flatMap((p) => [...p.html.matchAll(/href="\/posts\/([^/"]+)\//g)].map((m) => m[1]));
const uniqueSlugs = new Set(slugsOnPages);
check(
  'Không bài nào bị lặp giữa các trang phân trang',
  uniqueSlugs.size === mdFiles.length,
  `${slugsOnPages.length} link tới ${uniqueSlugs.size} bài khác nhau, cần ${mdFiles.length}`,
);

const rss = await readFile(join(DIST, 'rss.xml'), 'utf8');
const rssItems = (rss.match(/<item>/g) ?? []).length;
check(`RSS có đủ ${expectedPosts} bài`, rssItems === expectedPosts, `đếm được ${rssItems} item`);
check('RSS khai báo tiếng Việt', rss.includes('<language>vi-VN</language>'));

// Category: số bài mỗi category phải khớp dữ liệu WordPress
const wpCats = JSON.parse(await readFile(join(RAW, 'categories.json'), 'utf8'));
const catPages = distFiles.filter((f) => /dist[\\/]categories[\\/][^\\/]+[\\/]index\.html$/.test(f));
const wpCatNames = new Set(wpCats.map((c) => c.name.toLowerCase()));
// Category do bài viết mới sinh ra (vd "AI") không có trong dữ liệu WordPress,
// nên phải đếm thêm — nếu không thì mỗi lần thêm chủ đề mới là phép này fail.
const nativeCatNames = new Set();
for (const [, src] of nativePosts) {
  const m = src.match(/^categories:\s*\[(.*)\]/m);
  if (!m) continue;
  for (const raw of m[1].split(',')) {
    const name = raw.trim().replace(/^["']|["']$/g, '').toLowerCase();
    if (name && !wpCatNames.has(name)) nativeCatNames.add(name);
  }
}
const expectedCats =
  wpCats.filter((c) => c.slug !== 'uncategorized' && c.count > 0).length + nativeCatNames.size;
check(
  `Số trang category khớp (${expectedCats} category ngoài "uncategorized")`,
  catPages.length === expectedCats,
  `build ra ${catPages.length} trang`,
);

// ------------------------------------------------------- 6. Game tương tác
console.log('\n[6] Web app tương tác đã tách ra iframe');

// Suy ra danh sách game từ bài viết thật, không viết cứng — thêm/bớt bài game
// là phép kiểm tra tự theo, không phải sửa file này.
const gameSlugs = [...mdSources]
  .filter(([, src]) => /<iframe data-kc-game/.test(src))
  .map(([f]) => f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-/, ''));

console.log(`      (${gameSlugs.length} bài có nhúng game: ${gameSlugs.join(', ') || 'không có'})`);

for (const slug of gameSlugs) {
  const gamePage = join(DIST, 'games', `${slug}.html`);
  check(`Có dist/games/${slug}.html`, existsSync(gamePage));
  if (existsSync(gamePage)) {
    const html = await readFile(gamePage, 'utf8');
    check(`  ${slug}: còn <script> để game chạy được`, /<script/.test(html));
    check(`  ${slug}: còn <style> của game`, /<style/.test(html));
    check(`  ${slug}: có cơ chế tự báo chiều cao`, html.includes('kcGameHeight'));
  }
  const postPage = join(DIST, 'posts', slug, 'index.html');
  check(`  ${slug}: bài viết có nhúng iframe game`, existsSync(postPage) && (await readFile(postPage, 'utf8')).includes(`/games/${slug}.html`));
}

// Không còn file game mồ côi (bài đã xoá nhưng file game vẫn nằm lại)
const gameFilesOnDisk = (await readdir(join(ROOT, 'public', 'games')).catch(() => []))
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''));
const orphanGames = gameFilesOnDisk.filter((g) => !gameSlugs.includes(g));
check('Không có file game mồ côi trong public/games/', orphanGames.length === 0, orphanGames.join(', '));

// ------------------------------------------------------- 7. Tiếng Việt & SEO
console.log('\n[7] Tiếng Việt và SEO');

const home = await readFile(join(DIST, 'index.html'), 'utf8');
check('Trang chủ khai báo lang="vi"', /<html[^>]+lang="vi"/.test(home));

// Thẻ xác thực Google Search Console: Google yêu cầu giữ vĩnh viễn, xoá là mất quyền
// truy cập. Phải nằm trong <head>, trước <body>, đúng như hướng dẫn của Google.
const GOOGLE_SITE_VERIFICATION = constsSrc.match(/GOOGLE_SITE_VERIFICATION\s*=\s*'([^']*)'/)?.[1] ?? null;
check('Đọc được GOOGLE_SITE_VERIFICATION từ src/consts.ts', GOOGLE_SITE_VERIFICATION !== null);

const gsvMatch = home.match(/<meta name="google-site-verification" content="([^"]+)"/);
check('Trang chủ có thẻ xác thực Google Search Console', !!gsvMatch, 'thẻ đã bị xoá → sẽ mất quyền truy cập Search Console');
if (gsvMatch) {
  const headEnd = home.indexOf('</head>');
  check('Thẻ xác thực nằm trong <head>', home.indexOf(gsvMatch[0]) < headEnd && headEnd > 0);
  if (GOOGLE_SITE_VERIFICATION) {
    check('Mã xác thực khớp src/consts.ts', gsvMatch[1] === GOOGLE_SITE_VERIFICATION);
  }
}
check('Trang chủ có meta description', /<meta name="description"/.test(home));
check('Trang chủ có og:image hoặc og:title', /property="og:title"/.test(home));

// Tiếng Việt có dấu không bị lỗi encode (mojibake)
const mojibake = [];
for (const [f, src] of mdSources) {
  if (/Ã¡|Ã¢|Ä'|áº|Ã­Â|â€™|â€œ/.test(src)) mojibake.push(f);
}
check('Không có bài nào bị lỗi encode tiếng Việt', mojibake.length === 0, mojibake.join(', '));

// Mọi bài đều có title và description không rỗng
const badMeta = [];
for (const [f, src] of mdSources) {
  if (!/^title:\s*".+"/m.test(src)) badMeta.push(`${f} (thiếu title)`);
  if (!/^description:\s*".{10,}"/m.test(src)) badMeta.push(`${f} (description quá ngắn)`);
}
check('Mọi bài đều có title và description hợp lệ', badMeta.length === 0, badMeta.join('\n      '));

// Mọi trang bài đều có canonical trỏ đúng domain, và phải có dấu / ở cuối để khớp
// URL mà Cloudflare Workers thực sự trả về (host redirect 307 URL thiếu dấu /).
const badCanonical = [];
const badSlash = [];
for (const f of postPages) {
  const html = await readFile(f, 'utf8');
  const m = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!m || !m[1].startsWith(`${SITE_URL}/`)) badCanonical.push(relative(DIST, f));
  else if (!m[1].endsWith('/')) badSlash.push(m[1]);
}
check(`Mọi trang bài có canonical đúng domain (${SITE_URL})`, badCanonical.length === 0, badCanonical.slice(0, 5).join(', '));
check('Canonical có dấu / ở cuối, khớp URL host trả về', badSlash.length === 0, badSlash.slice(0, 3).join(', '));

// Sitemap và RSS cũng phải dùng domain thật, không phải domain cũ
const sitemap = await readFile(join(DIST, 'sitemap-0.xml'), 'utf8').catch(() => '');
check('Sitemap dùng domain thật', sitemap.includes(`<loc>${SITE_URL}/`), 'sitemap còn trỏ domain cũ');
check('RSS dùng domain thật', (await readFile(join(DIST, 'rss.xml'), 'utf8')).includes(SITE_URL));

// ------------------------------------------------------- 8. Dung lượng
console.log('\n[8] Dung lượng');

let totalBytes = 0;
for (const f of distFiles) totalBytes += (await stat(f)).size;
const mb = totalBytes / 1024 / 1024;
check(`Tổng dung lượng site: ${mb.toFixed(1)} MB`, mb < 500);

const bigFiles = [];
for (const f of distFiles) {
  const size = (await stat(f)).size;
  if (size > 25 * 1024 * 1024) bigFiles.push(`${relative(DIST, f)} (${(size / 1024 / 1024).toFixed(1)} MB)`);
}
check('Không file nào vượt 25 MB (giới hạn mỗi file của Cloudflare)', bigFiles.length === 0, bigFiles.join(', '));
check(`Số file tổng cộng: ${distFiles.length} (giới hạn 20.000 file của Cloudflare)`, distFiles.length < 20000);

// ------------------------------------------------------- Kết luận
console.log(`\n${'─'.repeat(64)}`);
console.log(`Đạt: ${passed}   Không đạt: ${failed}`);
if (failed > 0) {
  console.log('\nCó phép kiểm tra không đạt — xem chi tiết ở trên.');
  process.exit(1);
}
console.log('\n✓ Toàn bộ kiểm tra tự động đã đạt.');
