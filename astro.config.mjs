import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // Domain thật của site. Giá trị này sinh ra canonical URL, sitemap và link trong RSS —
  // đặt sai là Google được chỉ sang địa chỉ không tồn tại. Đổi domain thì sửa ở đây.
  site: 'https://kclearncode.khanhcuong-hanu.workers.dev',

  // Cloudflare Workers redirect 307 mọi URL về dạng có dấu / ở cuối, nên khai báo
  // 'always' để canonical/sitemap khớp đúng URL mà host thực sự trả về.
  trailingSlash: 'always',

  integrations: [sitemap()],

  redirects: {
    // Alias cho URL dễ nhớ; nội dung thật nằm ở bài viết gốc.
    '/about': '/posts/about-me/',
  },

  markdown: {
    shikiConfig: {
      // Nord cho dark mode — khớp theme code block của trang WordPress cũ, và giờ cũng là
      // bảng màu của cả trang (xem src/styles/global.css).
      //
      // github-light cho ca ngày. Đã thử đổi sang theme nào ít bão hoà hơn cho khớp Nord
      // (min-light, vitesse-light, rose-pine-dawn, one-light) và ĐO tương phản từng token:
      // tất cả đều tệ hơn, vitesse-light tô chú thích #999999 chỉ 2.5:1 là không đọc được.
      // github-light là bộ có tương phản tốt nhất trong số đó, nên giữ. Bù lại, khối code ở
      // ca ngày lấy nền trắng để mọi token đạt 4.5:1 (xem --bg-code trong global.css).
      themes: { light: 'github-light', dark: 'nord' },
      defaultColor: false, // để CSS tự chọn màu theo data-theme, xem src/styles/global.css
      wrap: true,
    },
  },

  adapter: cloudflare(),
});