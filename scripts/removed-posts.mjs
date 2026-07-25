/**
 * Hai danh sách điều khiển việc migrate lại từ _backup/raw-json/.
 * Dùng chung cho migrate.mjs và verify.mjs.
 */

/**
 * Bài đã CHỦ Ý xoá khỏi blog mới, dù vẫn còn trong bản backup WordPress.
 *
 *  - migrate.mjs  không tạo lại file .md
 *  - verify.mjs   trừ ra khi đối chiếu số bài, để phép kiểm tra "không mất bài nào"
 *                 vẫn bắt được lỗi thật thay vì báo giả
 *
 * Xoá tay file .md mà không ghi vào đây thì lần `npm run migrate` sau sẽ tạo lại bài.
 */
export const REMOVED_POSTS = [
  { wpId: 273, slug: 'the-pig-game', reason: 'Chủ blog quyết định bỏ' },
  { wpId: 242, slug: 'http-status-code', reason: 'Chủ blog quyết định bỏ' },
];

/**
 * Bài đã viết lại / sửa tay sau khi migrate. `npm run migrate` sẽ GIỮ NGUYÊN file
 * hiện có thay vì ghi đè bằng nội dung WordPress cũ.
 *
 * Không có danh sách này thì mọi lần chạy migrate là mất hết công viết lại — đúng
 * chuyện đã xảy ra một lần với bài know-your-menu.
 */
export const PROTECTED_SLUGS = new Set([
  'know-your-menu', // viết lại thành bài chi tiết về 5 loại icon menu
]);

export const REMOVED_WP_IDS = new Set(REMOVED_POSTS.map((p) => p.wpId));
