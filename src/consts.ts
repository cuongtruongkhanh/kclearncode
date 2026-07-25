/**
 * Mã xác thực Google Search Console (thẻ meta). Để chuỗi rỗng là không render thẻ.
 *
 * Vì sao phải dùng thẻ meta chứ không dùng hai cách kia:
 *  - DNS TXT: không được, `workers.dev` là tên miền của Cloudflare, mình không có quyền
 *    thêm record. Đây cũng là lý do KHÔNG chọn "Domain property" trong Search Console.
 *  - Tải file googleXXXX.html: không được, Cloudflare Workers redirect 307 mọi URL `.html`
 *    còn Google thì cần đúng đường dẫn đó trả về 200.
 *
 * Lấy mã ở: Search Console → thêm property dạng **URL prefix** với
 * `https://kclearncode.khanhcuong-hanu.workers.dev/` → chọn cách "HTML tag".
 */
// ⚠️ Google nói rõ: KHÔNG được xoá thẻ này kể cả sau khi đã xác thực thành công.
// Xoá đi là mất quyền truy cập Search Console. Có phép kiểm tra trong scripts/verify.mjs canh việc này.
export const GOOGLE_SITE_VERIFICATION = 'VO1tkVf813xokFgCqSWTuucN9A8-IGQrzkcO7w1kf_c';

/** Thông tin chung của site — sửa ở đây là đổi mọi nơi. */
export const SITE = {
  title: 'KcLearnCode',
  description: 'Blog về đời sống của một công nhân kiểm thử',
  author: 'Trương Khánh Cường',
  lang: 'vi',
  /** Dùng cho <link rel="alternate"> và RSS. */
  rssTitle: 'KcLearnCode — Blog',
} as const;

// "About Me" trỏ thẳng vào bài viết gốc năm 2015 thay vì tạo một trang /about trùng
// nội dung — một URL chuẩn duy nhất, tốt cho SEO. /about chỉ là alias redirect,
// khai báo trong astro.config.mjs.
// Mọi href nội bộ có dấu / ở cuối để khớp `trailingSlash: 'always'` — nếu thiếu,
// Cloudflare Workers redirect 307, tốn thêm một vòng request mỗi lần bấm.
export const NAV = [
  { href: '/', label: 'Trang chủ' },
  { href: '/blog/', label: 'Blog' },
  { href: '/categories/', label: 'Chủ đề' },
  { href: '/posts/about-me/', label: 'About Me' },
] as const;

/** Số bài mỗi trang ở danh sách /blog/ và trang chủ. */
export const POSTS_PER_PAGE = 10;

/** Slug hoá tên category tiếng Việt để làm URL (vd "C#" → "c-sharp"). */
export function categorySlug(name: string): string {
  const special: Record<string, string> = { 'C#': 'c-sharp' };
  if (special[name]) return special[name];
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Định dạng ngày kiểu Việt Nam: 27 tháng 2, 2025 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}
