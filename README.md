# KcLearnCode

**🌐 https://kclearncode.khanhcuong-hanu.workers.dev**

Blog cá nhân, chạy bằng [Astro](https://astro.build). Toàn bộ bài viết đã chuyển từ
WordPress (`kclearncode.com`) sang đây. Hosting miễn phí trên Cloudflare Workers — **chi phí 0đ**.

| | |
|---|---|
| Site | https://kclearncode.khanhcuong-hanu.workers.dev |
| Repo | https://github.com/cuongtruongkhanh/kclearncode |
| Hosting | Cloudflare Workers (Static Assets), deploy tự động khi push lên `main` |
| RSS | https://kclearncode.khanhcuong-hanu.workers.dev/rss.xml |
| Sitemap | https://kclearncode.khanhcuong-hanu.workers.dev/sitemap-index.xml |

---

## Viết bài mới

Chỉ 5 bước, không cần vào trang admin nào:

**1. Tạo file** trong `src/content/posts/`, đặt tên `YYYY-MM-ten-bai.md`:

```
src/content/posts/2026-07-cach-viet-test-tot-hon.md
```

> Tiền tố `YYYY-MM-` chỉ để sắp xếp file cho dễ nhìn trong VS Code. URL sẽ **không**
> có nó — bài trên là `/posts/cach-viet-test-tot-hon`.

**2. Copy phần frontmatter này vào đầu file** rồi sửa:

```yaml
---
title: "Tiêu đề bài viết"
description: "Mô tả 1–2 câu, hiện trên Google và khi share Facebook. Nên dài 120–160 ký tự."
pubDate: 2026-07-25
categories: ["Learning"]
tags: ["playwright", "automation"]
heroImage: "/images/posts/cach-viet-test-tot-hon/hero.jpg"
draft: false
---
```

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `title` | ✅ | Có emoji, dấu tiếng Việt đều được |
| `description` | ✅ | Tối thiểu 10 ký tự |
| `pubDate` | ✅ | Dạng `YYYY-MM-DD` |
| `categories` | | Nên dùng lại tên có sẵn: `Blog`, `Learning`, `Java`, `C#`, `Selenium`, `playwright`, `Eclipse`, `About Me` |
| `tags` | | Tự do |
| `heroImage` | | Ảnh đại diện, hiện đầu bài và khi share |
| `draft` | | `true` = chưa đăng, không xuất hiện trên site |

**3. Ảnh**: bỏ vào `public/images/posts/<ten-bai>/`, rồi dùng đường dẫn tuyệt đối:

```markdown
![Mô tả ảnh](/images/posts/cach-viet-test-tot-hon/so-do.png)
*Chú thích ảnh in nghiêng ngay dưới sẽ được canh giữa*
```

**4. Xem trước**:

```powershell
npm run dev
```

Mở http://localhost:4321 — sửa file là trang tự cập nhật ngay.

**5. Đăng bài**:

```powershell
git add .
git commit -m "post: cach viet test tot hon"
git push
```

Cloudflare tự build và deploy, khoảng 30–60 giây sau là bài lên site.

### Code block

Nhớ ghi tên ngôn ngữ sau dấu ``` để có màu:

````markdown
```javascript
await page.getByRole('button', { name: 'Đăng nhập' }).click();
```
````

Ngôn ngữ dùng được: `javascript`, `typescript`, `python`, `java`, `csharp`, `powershell`,
`bash`, `json`, `xml`, `html`, `css`, `sql`, `yaml`… (Shiki hỗ trợ hàng trăm loại).

---

## Các lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy server xem trước ở http://localhost:4321 |
| `npm run build` | Build ra thư mục `dist/` |
| `npm run preview` | Xem thử bản đã build (giống production nhất) |
| `npm run check` | Kiểm tra lỗi TypeScript và frontmatter sai kiểu |
| `npm run verify` | 56 phép kiểm tra tự động (chạy **sau** `npm run build`) |
| `npm run backup` | Tải lại dữ liệu thô từ WordPress cũ (chỉ dùng khi site cũ còn sống) |
| `npm run migrate` | Dựng lại `.md` từ `_backup/raw-json/` — xem cảnh báo bên dưới |
| `npm run images` | Tải ảnh còn thiếu về local, chạy lại được nhiều lần |

> ⚠️ **`npm run migrate` xoá sạch `src/content/posts/` rồi tạo lại.** Sau khi đã bắt đầu
> viết bài mới thì gần như không cần chạy nữa. Nếu buộc phải chạy:
>
> - Bài **viết mới** (không có trong backup WordPress) sẽ **bị xoá mất**.
> - Bài **sửa tay** sẽ bị ghi đè, **trừ khi** slug của nó nằm trong `PROTECTED_SLUGS`
>   ở [scripts/removed-posts.mjs](scripts/removed-posts.mjs).
> - Đường dẫn ảnh quay về URL WordPress cũ → phải chạy `npm run images` ngay sau đó.
>
> Muốn sửa tay một bài cũ và giữ được sửa đổi qua các lần migrate thì thêm slug của nó
> vào `PROTECTED_SLUGS`.

---

## Cấu trúc

```
src/
  content/posts/       29 bài viết dạng Markdown
  content.config.ts    Schema frontmatter (sai kiểu là build fail ngay)
  consts.ts            Tên site, menu, hàm slug hoá & format ngày
  ../astro.config.mjs  ⚠️ Domain của site (`site:`) — sinh canonical/sitemap/RSS
  layouts/             BaseLayout (SEO, theme), PostLayout (bài viết)
  components/          Header, Footer, PostCard, ThemeToggle
  pages/               Các route: /, /blog/[...page] (phân trang), /posts/…, /categories/…, /rss.xml, /404
  styles/global.css    Toàn bộ CSS (dark/light bằng CSS variables)
public/
  images/posts/        62 ảnh đã tải về từ WordPress
  games/               1 web app tương tác tách riêng (xem mục dưới)
scripts/               Script migrate & kiểm tra
_backup/raw-json/      Dữ liệu gốc từ WordPress REST API — bản lưu, đừng xoá
```

---

## Phân trang

Danh sách bài chia **10 bài mỗi trang**, đổi ở `POSTS_PER_PAGE` trong
[src/consts.ts](src/consts.ts) — số trang tự tính lại, không phải sửa chỗ nào khác.

| URL | Nội dung |
|---|---|
| `/` | 10 bài mới nhất + nút "Bài cũ hơn →" dẫn sang `/blog/2/` |
| `/blog/` | Trang 1 (10 bài) + dãy nút phân trang |
| `/blog/2/`, `/blog/3/`… | Các trang tiếp theo |

Trong mỗi trang, bài vẫn được nhóm theo năm để dễ định vị (blog trải dài 10 năm).

Dãy nút phân trang ở [src/components/Pagination.astro](src/components/Pagination.astro).
Khi vượt 7 trang nó tự rút gọn thành `1 … 4 5 6 … 12` để không tràn ngang trên điện thoại.
Trang có phân trang cũng phát ra `<link rel="prev">` / `<link rel="next">` cho Google hiểu
đây là một chuỗi trang.

---

## Ba điểm đặc biệt cần biết

### 1. Bài game nằm trong iframe

`guess-my-number` không phải bài viết thường — nó là một web app JS có CSS reset toàn cục
(`* { margin: 0 }`, `html { font-size: 62.5% }`, `body { background: #222 }`). Nhúng thẳng vào
bài sẽ phá layout blog, nên game là một trang HTML độc lập trong `public/games/` và được
nhúng lại bằng `<iframe>` — iframe chính là ranh giới cách ly CSS.

Iframe tự báo chiều cao thật ra trang cha qua `postMessage`, xử lý ở
[src/layouts/PostLayout.astro](src/layouts/PostLayout.astro).
Muốn sửa game thì sửa trực tiếp file trong `public/games/`.

### 2. Hai bài đã xoá khỏi blog

`the-pig-game` và `http-status-code` đã bỏ theo yêu cầu, nhưng **vẫn còn trong
`_backup/raw-json/`** (bản lưu WordPress không bị sửa). Chúng được liệt kê ở
`REMOVED_POSTS` trong [scripts/removed-posts.mjs](scripts/removed-posts.mjs) để
`npm run migrate` không tạo lại và `npm run verify` không báo lỗi sai.

Muốn phục hồi thì xoá mục tương ứng khỏi `REMOVED_POSTS` rồi chạy
`npm run migrate && npm run images`.

### 3. Năm ảnh đã mất vĩnh viễn

Bài `python-tu-khong-den-co` có 5 ảnh minh hoạ host ở `cuccode.com`. Trang đó đã xoá ảnh
(HTTP 404) và Wayback Machine cũng không có bản lưu — **mất từ trước khi migrate**, không phải
do chuyển nhà. Chỗ đó hiện là ghi chú:

> 🖼 *Python purpose — ảnh gốc host tại `cuccode.com` đã bị xoá, không có bản lưu.*

URL gốc vẫn lưu trong HTML comment ngay dưới. Nếu tìm được ảnh thay thế, chỉ cần đổi
ghi chú đó thành `![alt](/images/posts/python-tu-khong-den-co/anh-moi.png)`.

---

## Deploy

**Đã setup xong rồi** — site đang chạy tại
https://kclearncode.khanhcuong-hanu.workers.dev, host trên **Cloudflare Workers**
(Static Assets) và kết nối trực tiếp với repo GitHub.

Từ giờ quy trình đăng bài chỉ là:

```powershell
git push
```

Cloudflare tự chạy `npm run build` rồi deploy thư mục `dist/`. HTTPS đã bật sẵn.
Xem tiến độ build ở https://dash.cloudflare.com → **Workers & Pages** → `kclearncode`.

### Cấu hình build trên Cloudflare

Nếu cần tạo lại project (hoặc kiểm tra lại cấu hình hiện tại):

- Build command: `npm run build`
- Deploy / output directory: `dist`
- Không cần biến môi trường nào

### ⚠️ Nếu đổi tên miền

Phải sửa `site` trong [astro.config.mjs](astro.config.mjs):

```js
site: 'https://kclearncode.khanhcuong-hanu.workers.dev',
```

Giá trị này sinh ra **canonical URL, sitemap và link trong RSS**. Đặt sai là Google được
chỉ sang một địa chỉ không tồn tại — đúng lỗi đã xảy ra khi site còn ghi `kclearncode.pages.dev`.
Sửa xong nhớ chạy `npm run build && npm run verify`, đã có 4 phép kiểm tra bắt lỗi này.

### Về dấu `/` ở cuối URL

Cloudflare Workers redirect 307 mọi URL thiếu dấu `/` (ví dụ `/blog` → `/blog/`), và
tự bỏ đuôi `.html`. Vì vậy dự án đặt `trailingSlash: 'always'` và **mọi link nội bộ đều
có dấu `/` ở cuối** — nếu viết thiếu, mỗi lần bấm sẽ tốn thêm một vòng request.

Riêng iframe của bài game vẫn trỏ `/games/<ten>.html` (có đuôi): bản local bắt buộc
phải có `.html`, còn trên Workers thì URL này 307 sang bản không đuôi. Chạy đúng ở cả hai nơi.

### Google Search Console

Vì đã bỏ tên miền `kclearncode.com`, Google phải index lại từ đầu.

> ⚠️ **Phải chọn đúng loại property: "URL prefix", KHÔNG phải "Domain".**
>
> Domain property chỉ xác thực được bằng DNS TXT record, mà `workers.dev` là tên miền của
> **Cloudflare** — mình không có quyền thêm record vào đó. Chọn Domain là đi vào đường cùng.

**Các bước:**

1. Vào https://search.google.com/search-console → **Add property**
2. Chọn ô **URL prefix** (ô bên phải), nhập đầy đủ cả `https://`:
   ```
   https://kclearncode.khanhcuong-hanu.workers.dev/
   ```
3. Trong danh sách cách xác thực, chọn **HTML tag**. Google hiện một thẻ như:
   ```html
   <meta name="google-site-verification" content="MÃ_CỦA_BẠN" />
   ```
4. So mã đó với `GOOGLE_SITE_VERIFICATION` trong [src/consts.ts](src/consts.ts).
   Nếu khác thì thay bằng mã mới, rồi `npm run build` và `git push`.
5. Đợi Cloudflare deploy xong (~1 phút), kiểm tra thẻ đã lên site. Chạy trong terminal
   VS Code (`` Ctrl + ` ``):
   ```powershell
   (Invoke-WebRequest https://kclearncode.khanhcuong-hanu.workers.dev/ -UseBasicParsing).Content | Select-String google-site-verification
   ```
   > Đừng viết `curl ... | Select-String`: trong PowerShell, `curl` là **alias của
   > `Invoke-WebRequest`** nên nó trả về một object chứ không phải HTML, và lệnh sẽ lỗi.
   > Muốn dùng curl thật thì gõ `curl.exe -s <url> | Select-String google-site-verification`.
6. Quay lại Search Console bấm **Verify**
7. Vào **Sitemaps** → submit `sitemap-index.xml`

**Vì sao dùng thẻ meta mà không dùng hai cách kia:**

| Cách | Dùng được? | Lý do |
|---|---|---|
| HTML tag | ✅ | Thẻ nằm ở `/`, host trả về 200 trực tiếp |
| Tải file `googleXXX.html` | ❌ | Cloudflare Workers redirect 307 mọi URL `.html`, Google cần đúng đường dẫn trả 200 |
| DNS TXT record | ❌ | `workers.dev` là tên miền của Cloudflare, không có quyền sửa DNS |

Nhớ cập nhật link blog ở profile GitHub, LinkedIn, Facebook, chữ ký email.

### Về SEO của `workers.dev`

`workers.dev` nằm trong [Public Suffix List](https://publicsuffix.org/list/), nên Google coi
`kclearncode.khanhcuong-hanu.workers.dev` là **một site độc lập** — không bị gộp uy tín với
các site `workers.dev` của người khác. Không cần mua tên miền riêng chỉ vì lo SEO.

---

## Nếu WordPress cũ vẫn còn sống

Nên làm nốt hai việc này trước khi hosting hết hạn:

1. **Xuất file WXR đầy đủ**: `wp-admin` → **Tools** → **Export** → **All content** →
   lưu file `.xml` vào `_backup/`. File này có cả bài nháp/riêng tư mà REST API không trả về.
2. **Chèn thông báo chuyển nhà** trên trang chủ WordPress, dẫn sang địa chỉ mới, để người
   đọc quen biết đi theo.

Không có comment nào cần chuyển: toàn bộ ~100 comment trên site cũ là spam
(quảng cáo, bán sim, link rác).
