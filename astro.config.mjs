import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
      // Nord cho dark mode — khớp theme code block của trang WordPress cũ.
      themes: { light: 'github-light', dark: 'nord' },
      defaultColor: false, // để CSS tự chọn màu theo data-theme, xem src/styles/global.css
      wrap: true,
    },
  },
});
