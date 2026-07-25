/**
 * Bước 3: Tải mọi ảnh đang trỏ ra internet về public/images/, rồi rewrite đường dẫn
 * trong src/content/posts/*.md và public/games/*.html thành đường dẫn local.
 *
 * Chạy: node scripts/download-images.mjs
 *
 * Script này CHẠY LẠI ĐƯỢC NHIỀU LẦN: ảnh đã có trên đĩa sẽ bỏ qua, không tải lại.
 * Ảnh nào tải thất bại sẽ được liệt kê rõ ở cuối — KHÔNG im lặng bỏ qua, vì mất ảnh
 * là mất nội dung.
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const ROOT = process.cwd();
const POSTS = join(ROOT, 'src', 'content', 'posts');
const GAMES = join(ROOT, 'public', 'games');
const IMG_ROOT = join(ROOT, 'public', 'images', 'posts');

const MAX_RETRY = 3;
const CONCURRENCY = 6;

/** slug của bài = tên file bỏ tiền tố YYYY-MM- và đuôi .md */
const slugOf = (filename) => basename(filename, '.md').replace(/^\d{4}-\d{2}-/, '');

/** Tên file local an toàn, suy ra từ URL. */
function localName(url, { isHero = false } = {}) {
  const u = new URL(url);
  let name = decodeURIComponent(basename(u.pathname));
  let ext = extname(name).toLowerCase();
  if (!/^\.(jpe?g|png|gif|webp|avif|svg)$/.test(ext)) ext = '.jpg';
  name = basename(name, extname(name));

  // Google Docs / CDN trả URL không có tên file dùng được → đặt tên theo hash ngắn
  if (!name || name.length > 60 || /^AD_4nX/.test(name)) {
    let h = 0;
    for (const ch of url) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    name = `img-${h.toString(36)}`;
  }

  name = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // WP thêm hậu tố kích thước (-1024x950) → bỏ cho tên gọn
  name = name.replace(/-\d{2,4}x\d{2,4}$/, '');

  return `${isHero ? 'hero-' : ''}${name}${ext}`;
}

async function download(url, dest) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) kcblog-migration/1.0',
          Referer: 'https://kclearncode.com/',
          Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        },
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error(`file quá nhỏ (${buf.length} byte), có thể là trang lỗi`);
      await writeFile(dest, buf);
      return { ok: true, bytes: buf.length };
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRY) await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  return { ok: false, error: lastErr.message };
}

/** Chạy các task theo lô để không nã quá nhiều request cùng lúc. */
async function inBatches(tasks, size) {
  const out = [];
  for (let i = 0; i < tasks.length; i += size) {
    out.push(...(await Promise.all(tasks.slice(i, i + size).map((t) => t()))));
  }
  return out;
}

// ------------------------------------------- 1. Thu thập URL cần tải

/** @type {Map<string, {url: string, slug: string, isHero: boolean}>} */
const jobs = new Map();
const files = (await readdir(POSTS)).filter((f) => f.endsWith('.md'));

const addJob = (url, slug, isHero = false) => {
  if (!/^https?:\/\//i.test(url)) return; // đã là đường dẫn local
  const key = `${slug}|${url}`;
  if (!jobs.has(key)) jobs.set(key, { url, slug, isHero });
};

for (const file of files) {
  const src = await readFile(join(POSTS, file), 'utf8');
  const slug = slugOf(file);

  const hero = src.match(/^heroImage:\s*"([^"]+)"/m);
  if (hero) addJob(hero[1], slug, true);

  for (const m of src.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) addJob(m[1], slug);
}

// Ảnh nằm trong trang game đã tách ra (vd con xúc xắc của Pig Game)
const gameFiles = existsSync(GAMES) ? (await readdir(GAMES)).filter((f) => f.endsWith('.html')) : [];
for (const file of gameFiles) {
  const src = await readFile(join(GAMES, file), 'utf8');
  const slug = basename(file, '.html');
  for (const m of src.matchAll(/<img[^>]+src=["']([^"']+)/g)) addJob(m[1], slug);
}

console.log(`Cần tải ${jobs.size} ảnh cho ${files.length} bài + ${gameFiles.length} trang game.\n`);

// ------------------------------------------- 2. Tải về

/** @type {Map<string, string>} url gốc → đường dẫn local (theo từng slug) */
const mapping = new Map();
const failures = [];
let downloaded = 0;
let skipped = 0;

const tasks = [...jobs.values()].map((job) => async () => {
  const dir = join(IMG_ROOT, job.slug);
  await mkdir(dir, { recursive: true });
  const name = localName(job.url, { isHero: job.isHero });
  const dest = join(dir, name);
  const publicPath = `/images/posts/${job.slug}/${name}`;

  if (existsSync(dest) && (await stat(dest)).size > 100) {
    skipped++;
    mapping.set(`${job.slug}|${job.url}`, publicPath);
    return;
  }

  const res = await download(job.url, dest);
  if (res.ok) {
    downloaded++;
    mapping.set(`${job.slug}|${job.url}`, publicPath);
    console.log(`  ✓ ${(res.bytes / 1024).toFixed(0).padStart(5)} KB  ${publicPath}`);
  } else {
    failures.push({ ...job, error: res.error });
    console.error(`  ✗ ${job.slug}: ${res.error}\n      ${job.url.slice(0, 110)}`);
  }
});

await inBatches(tasks, CONCURRENCY);

// ------------------------------------------- 3. Rewrite đường dẫn

let rewritten = 0;
for (const file of files) {
  const path = join(POSTS, file);
  const slug = slugOf(file);
  let src = await readFile(path, 'utf8');
  const before = src;

  for (const [key, local] of mapping) {
    const [mapSlug, url] = [key.slice(0, key.indexOf('|')), key.slice(key.indexOf('|') + 1)];
    if (mapSlug !== slug) continue;
    src = src.split(url).join(local);
  }

  if (src !== before) {
    await writeFile(path, src, 'utf8');
    rewritten++;
  }
}

for (const file of gameFiles) {
  const path = join(GAMES, file);
  const slug = basename(file, '.html');
  let src = await readFile(path, 'utf8');
  const before = src;
  for (const [key, local] of mapping) {
    const [mapSlug, url] = [key.slice(0, key.indexOf('|')), key.slice(key.indexOf('|') + 1)];
    if (mapSlug !== slug) continue;
    src = src.split(url).join(local);
  }
  if (src !== before) {
    await writeFile(path, src, 'utf8');
    rewritten++;
  }
}

// ------------------------------- 3b. Ảnh chết vĩnh viễn → ghi chú hiển thị
//
// Ảnh trả 404 từ host của người khác (và không có bản lưu trên Wayback Machine) là
// mất vĩnh viễn. Để nguyên URL thì người đọc thấy icon ảnh lỗi; xoá hẳn thì mất dấu.
// Nên thay bằng một ghi chú nhìn thấy được, vẫn giữ alt text và URL gốc trong comment.

const dead = failures.filter((f) => /HTTP 404|HTTP 410/.test(f.error));
let deadReplaced = 0;

for (const file of files) {
  const path = join(POSTS, file);
  const slug = slugOf(file);
  const urls = dead.filter((d) => d.slug === slug).map((d) => d.url);
  if (!urls.length) continue;

  let src = await readFile(path, 'utf8');
  for (const url of urls) {
    const re = new RegExp(`!\\[([^\\]]*)\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
    src = src.replace(re, (_m, alt) => {
      deadReplaced++;
      const label = alt.trim() || 'Ảnh minh hoạ';
      return `> 🖼 *${label} — ảnh gốc host tại \`${new URL(url).host}\` đã bị xoá, không có bản lưu.*\n<!-- ảnh gốc đã chết: ${url} -->`;
    });
  }
  await writeFile(path, src, 'utf8');
}

// ------------------------------------------- 4. Báo cáo

console.log(`\n--- Tổng kết ---`);
console.log(`Tải mới:        ${downloaded}`);
console.log(`Đã có, bỏ qua:  ${skipped}`);
console.log(`Thất bại:       ${failures.length}`);
console.log(`File đã rewrite đường dẫn: ${rewritten}`);

if (deadReplaced) console.log(`Ảnh chết đã thay bằng ghi chú:  ${deadReplaced}`);

if (failures.length) {
  console.log(`\n⚠ ${failures.length} ẢNH TẢI THẤT BẠI:`);
  for (const f of failures) {
    const isDead = /HTTP 404|HTTP 410/.test(f.error);
    console.log(`\n   bài:  ${f.slug}`);
    console.log(`   lỗi:  ${f.error}${isDead ? '  → đã thay bằng ghi chú trong bài' : '  → URL vẫn còn nguyên trong .md'}`);
    console.log(`   url:  ${f.url}`);
  }
  const notDead = failures.filter((f) => !/HTTP 404|HTTP 410/.test(f.error));
  if (notDead.length) {
    console.log(`\n   ${notDead.length} ảnh lỗi tạm thời (không phải 404) — nên chạy lại script để thử tải tiếp.`);
    process.exitCode = 1;
  } else {
    console.log('\n   Tất cả đều là 404 (ảnh của bên thứ ba đã bị xoá, Wayback Machine cũng không có bản lưu).');
    console.log('   Bài viết vẫn đọc được, chỗ ảnh có ghi chú rõ ràng. Nếu muốn, tự chèn ảnh thay thế sau.');
  }
} else {
  console.log('\n✓ Toàn bộ ảnh đã về local. Không còn phụ thuộc hosting cũ.');
}
