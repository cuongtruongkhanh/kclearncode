/**
 * Sinh thumbnail WebP cho ảnh hero, dùng cho layout tạp chí ở trang chủ / danh sách.
 *
 * Chạy: node scripts/thumbs.mjs  (đã nối vào `npm run build`)
 *
 * Vì sao cần bước này: ảnh hero nằm trong public/ nên `astro:assets` KHÔNG tối ưu được
 * (nó chỉ xử lý ảnh import từ src/ hoặc ảnh remote khai báo trước). Mà trong đó có ảnh
 * PNG hơn 1MB — trang chủ bày 10 ảnh gốc là gần 4MB, nặng hơn thiết kế cũ cả chục lần.
 *
 * Script CHẠY LẠI ĐƯỢC NHIỀU LẦN: thumb nào mới hơn ảnh gốc thì bỏ qua, không encode lại.
 */
import { readdir, readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const POSTS = join(ROOT, 'src', 'content', 'posts');
const PUBLIC = join(ROOT, 'public');
const OUT_DIR = join(PUBLIC, 'images', 'thumbs');

/**
 * Hai biến thể, khác nhau ở chỗ có cắt hay không:
 *
 *  - `tile` — 720×405 (16:9), CẮT sẵn ở bước build. Ô mosaic và dòng danh sách hiển thị
 *    16:9 bằng object-fit nên phần ngoài khung kia sao cũng bị bỏ; cắt sớm thì đỡ hẳn byte.
 *    Có ảnh gốc dạng dọc, không cắt thì thumb phình lên gấp bốn lần mà nhìn y như nhau.
 *  - `wide` — rộng tối đa 1440, KHÔNG cắt. Dùng cho ảnh hero trong trang bài: ở đó ảnh là
 *    nội dung của tác giả, cắt tự động là làm hỏng bố cục ảnh.
 */
const VARIANTS = {
  tile: { width: 720, height: 405, fit: 'cover' },
  wide: { width: 1440 },
};
const QUALITY = 72;

/** id của bài = tên file bỏ tiền tố YYYY-MM- và đuôi .md — khớp generateId ở content.config.ts */
const idOf = (filename) => filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-/, '');

/** Đường dẫn public của thumb. Quy tắc này lặp lại ở src/consts.ts — đổi thì đổi cả hai. */
const thumbPath = (id, variant) => `/images/thumbs/${id}-${variant}.webp`;

/** mtime, hoặc 0 nếu file không tồn tại. */
async function mtimeOf(path) {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return 0;
  }
}

const files = (await readdir(POSTS)).filter((f) => f.endsWith('.md') && !f.startsWith('_'));

let made = 0;
let skipped = 0;
const problems = [];
/** id bài → kích thước ảnh `wide`, để trang bài đặt width/height chống nhảy layout. */
const sizes = {};

for (const file of files) {
  const src = await readFile(join(POSTS, file), 'utf8');
  const hero = src.match(/^heroImage:\s*["']?(.+?)["']?\s*$/m)?.[1];
  if (!hero) {
    problems.push(`${file}: không có heroImage`);
    continue;
  }

  const srcPath = join(PUBLIC, hero.replace(/^\//, ''));
  if (!existsSync(srcPath)) {
    problems.push(`${file}: không tìm thấy ${hero}`);
    continue;
  }

  const id = idOf(file);
  const srcTime = await mtimeOf(srcPath);

  for (const [variant, resize] of Object.entries(VARIANTS)) {
    const outPath = join(PUBLIC, thumbPath(id, variant).replace(/^\//, ''));

    if ((await mtimeOf(outPath)) > srcTime) {
      skipped++;
    } else {
      await mkdir(dirname(outPath), { recursive: true });
      // withoutEnlargement: ảnh gốc nhỏ hơn khung thì giữ nguyên cỡ, đừng phóng to cho mờ.
      await sharp(srcPath)
        .resize({ ...resize, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outPath);
      made++;
    }

    // Ảnh `wide` hiện nguyên khung (không cắt) trong trang bài, nên phải biết kích thước
    // thật để đặt width/height chống nhảy layout. Đọc lại từ file đã ghi, kể cả lần bỏ qua.
    if (variant === 'wide') {
      const { width, height } = await sharp(outPath).metadata();
      sizes[id] = { width, height };
    }
  }
}

// Manifest phục vụ hai việc: verify.mjs đối chiếu không thiếu file, và PostLayout.astro
// lấy kích thước ảnh `wide`. Sắp key theo thứ tự để diff git gọn khi thêm bài mới.
await writeFile(
  join(OUT_DIR, 'manifest.json'),
  JSON.stringify(
    {
      variants: Object.keys(VARIANTS),
      quality: QUALITY,
      wide: Object.fromEntries(Object.keys(sizes).sort().map((id) => [id, sizes[id]])),
    },
    null,
    2,
  ) + '\n',
);

console.log(`thumbs: tạo mới ${made}, bỏ qua ${skipped} (đã mới hơn ảnh gốc)`);

if (problems.length) {
  console.error('\nCó vấn đề, KHÔNG bỏ qua im lặng:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
