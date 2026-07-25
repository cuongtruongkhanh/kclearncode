import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kclearncode.pages.dev',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  redirects: {
    // Alias cho URL dễ nhớ; nội dung thật nằm ở bài viết gốc.
    '/about': '/posts/about-me',
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
