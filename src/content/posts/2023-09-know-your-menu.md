---
title: "Know your menu — gọi tên 5 kiểu icon menu trong web"
description: "Hamburger, Döner, Bento, Kebab, Meatballs — 5 icon menu quen mắt nhưng ít ai gọi đúng tên. Mỗi loại dùng cho việc gì, code thế nào, và test ra sao."
pubDate: 2023-09-19
updatedDate: 2026-07-25
categories: ["Learning"]
tags: ["UI", "frontend", "accessibility"]
heroImage: "/images/posts/know-your-menu/hero-image.png"
heroImageAlt: "Năm icon menu: Hamburger, Döner, Bento, Kebab, Meatballs"
draft: false
wpId: 228
wpSlug: "know-your-menu"
---
Có một tấm ảnh mình lưu từ lâu, và đến giờ vẫn thấy nó hữu ích một cách bất ngờ:

![Năm icon menu: Hamburger, Döner, Bento, Kebab, Meatballs](/images/posts/know-your-menu/hero-image.png)
*Ảnh sưu tầm, tác giả @MichaelBabich*

Năm cái icon này thì ai làm web cũng thấy hàng ngày. Nhưng thử hỏi tên chúng xem — phần lớn
chỉ gọi được cái đầu tiên là "hamburger", còn lại thì "ờ, cái ba chấm ấy", "cái ô vuông ấy".

Chuyện gọi tên nghe có vẻ vặt vãnh, nhưng nó thật sự có ích. Khi mình log bug mà viết
*"kebab menu ở góc phải card không mở"* thì dev hiểu ngay; còn viết *"cái nút ba cái chấm
nhỏ nhỏ ở bên phải"* thì hai bên phải hỏi lại nhau vài lượt. Đặt tên đúng cho một thứ là
bước đầu để nói chuyện về nó cho nhanh.

Nên bài này mình viết kỹ hơn về từng loại: nó là gì, dùng khi nào, code ra sao, và — theo
đúng nghề của mình — có gì đáng test.

---

## 1. 🍔 Hamburger Menu — ba gạch ngang

Ba đường kẻ ngang xếp đều nhau. Icon menu nổi tiếng nhất, và cũng là cái gây tranh cãi
nhiều nhất.

**Dùng khi nào:** menu điều hướng chính (navigation) trên mobile, khi không đủ chỗ hiện
hết các mục. Bấm vào thì mở ra drawer trượt từ cạnh màn hình, hoặc panel phủ toàn trang.

**Điều thú vị:** icon này ra đời từ năm **1981**, do Norm Cox thiết kế cho máy tính Xerox
Star — sớm hơn iPhone tới 26 năm. Ông cố tình vẽ ba gạch cho giống một danh sách rút gọn.

**Nhược điểm cần biết:** hamburger menu *giấu* điều hướng đi. Nhiều nghiên cứu UX cho thấy
mục nào bị nhét vào đây thì lượt bấm giảm rõ rệt so với để hiện ra ngoài. Nếu site chỉ có
3–4 mục chính, cứ hiện thẳng ra còn tốt hơn. Đó là lý do nhiều app giờ chuyển sang tab bar
ở dưới đáy màn hình.

```html
<button
  class="hamburger"
  type="button"
  aria-label="Mở menu điều hướng"
  aria-expanded="false"
  aria-controls="main-nav"
>
  <span></span><span></span><span></span>
</button>

<nav id="main-nav" hidden>
  <a href="/">Trang chủ</a>
  <a href="/blog/">Blog</a>
</nav>
```

```javascript
const btn = document.querySelector('.hamburger');
const nav = document.querySelector('#main-nav');

btn.addEventListener('click', () => {
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!isOpen));
  nav.hidden = isOpen;
});
```

Hai điểm dễ làm sai nhất, đều liên quan đến accessibility:

- **Dùng `<div>` thay vì `<button>`.** `<div>` không focus được bằng `Tab`, không bấm được
  bằng `Enter`/`Space`, và screen reader không đọc nó là nút. Cứ dùng `<button>`.
- **Thiếu `aria-label`.** Icon chỉ là ba cái `<span>` rỗng, không có chữ nào. Không gắn
  nhãn thì screen reader đọc ra "button" — người dùng không biết nút làm gì.

---

## 2. 🥙 Döner Menu — ba gạch ngắn dần

Cũng ba gạch ngang nhưng **dài ngắn khác nhau**, trông như cái phễu. Tên lấy từ món thịt
döner kebab xếp thành hình chóp.

**Dùng khi nào:** biểu tượng cho **filter** (bộ lọc) hoặc **sort** (sắp xếp). Cái phễu thu
hẹp dần chính là ẩn dụ cho việc lọc bớt dữ liệu — trực quan hơn hamburger cho việc này.

Hay thấy nhất là ở trang danh sách sản phẩm, bảng dữ liệu, trang tìm kiếm.

```html
<button type="button" aria-label="Bộ lọc" aria-expanded="false" aria-controls="filters">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <rect x="2" y="4"  width="16" height="2" rx="1" />
    <rect x="5" y="9"  width="10" height="2" rx="1" />
    <rect x="8" y="14" width="4"  height="2" rx="1" />
  </svg>
</button>
```

> Chú ý `aria-hidden="true"` trên `<svg>`: nó nói với screen reader "bỏ qua cái hình này",
> để chỉ đọc `aria-label` của nút. Không có nó thì có trình đọc sẽ đọc lảm nhảm nội dung SVG.

**Đáng test:** khi đã có filter đang bật, icon phải hiện dấu hiệu gì đó (số lượng filter,
một chấm màu). Người dùng quay lại trang sau vài phút mà không thấy đang lọc thì sẽ tưởng
dữ liệu bị thiếu. Đây là bug mình gặp nhiều lần trong thực tế.

---

## 3. 🍱 Bento Menu — lưới ô vuông

Chín ô vuông xếp thành lưới 3×3, giống hộp cơm bento chia ngăn.

**Dùng khi nào:** **chuyển đổi giữa các ứng dụng**, hoặc mở một bảng gồm nhiều lối vào
ngang hàng nhau. Ví dụ quen nhất là nút chuyển app của Google (Gmail → Drive → Calendar…),
hay bảng "tất cả ứng dụng" trong các hệ thống nội bộ.

Điểm khác biệt so với hamburger: hamburger mở ra **một danh sách link theo thứ bậc**, còn
bento mở ra **một lưới các đích ngang cấp**, mỗi đích thường có icon riêng.

```html
<button type="button" aria-label="Chuyển ứng dụng" aria-expanded="false" aria-controls="app-grid">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="4"  cy="4"  r="1.6" /><circle cx="10" cy="4"  r="1.6" /><circle cx="16" cy="4"  r="1.6" />
    <circle cx="4"  cy="10" r="1.6" /><circle cx="10" cy="10" r="1.6" /><circle cx="16" cy="10" r="1.6" />
    <circle cx="4"  cy="16" r="1.6" /><circle cx="10" cy="16" r="1.6" /><circle cx="16" cy="16" r="1.6" />
  </svg>
</button>
```

**Đáng test:** lưới bento thường load dữ liệu động (danh sách app tuỳ quyền của từng user).
Nên test cả trường hợp user chỉ có quyền vào 1 app, và trường hợp API trả về lỗi — lúc đó
lưới phải hiện thông báo, không được hiện một khoảng trống câm lặng.

---

## 4. 🍢 Kebab Menu — ba chấm dọc

Ba dấu chấm xếp **dọc**. Còn gọi là *vertical ellipsis*, hoặc "overflow menu" trong tài
liệu Material Design của Google.

**Dùng khi nào:** menu hành động **cho một đối tượng cụ thể** — một dòng trong bảng, một
card, một email, một tin nhắn. Bấm vào hiện ra các lệnh: Sửa, Xoá, Chia sẻ, Nhân bản…

Đây là loại mình gặp nhiều nhất khi test, vì nó là chỗ chứa những hành động **nguy hiểm**
(xoá dữ liệu) mà lại bị giấu sau một cái nút bé tí.

```html
<div class="row">
  <span class="row__name">bao-cao-q3.xlsx</span>

  <button
    type="button"
    aria-label="Hành động cho bao-cao-q3.xlsx"
    aria-haspopup="menu"
    aria-expanded="false"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4"  r="1.8" />
      <circle cx="10" cy="10" r="1.8" />
      <circle cx="10" cy="16" r="1.8" />
    </svg>
  </button>
</div>
```

Để ý `aria-label` có **kèm tên file**. Trong một bảng 50 dòng thì có 50 cái nút ba chấm
giống nhau; nếu nhãn nào cũng chỉ ghi "Hành động" thì người dùng screen reader nghe 50 lần
một câu y hệt, không biết mình đang ở dòng nào. Chi tiết nhỏ nhưng khác biệt lớn.

### Danh sách test mình hay dùng cho kebab menu

Đây là chỗ bug hay trốn nhất trong cả năm loại:

- **Bấm ra ngoài** thì menu phải đóng. Nghe hiển nhiên, nhưng lỗi này gặp thường xuyên.
- **Nhấn `Escape`** phải đóng menu, và focus phải quay về đúng cái nút vừa bấm.
- **Điều hướng bằng `↑` `↓`** trong danh sách lệnh phải chạy được, không chỉ dùng chuột.
- **Mở menu ở dòng cuối bảng**: menu phải tự bật lên phía trên, không bị màn hình cắt mất.
  Đây là bug kinh điển — trên máy dev màn hình to thì không thấy, lên laptop nhỏ mới lộ.
- **Mở menu dòng khác** khi đang có menu mở: cái cũ phải đóng, không được mở hai cái cùng lúc.
- **Vùng bấm tối thiểu 44×44px.** Icon vẽ 20px nhưng nút phải to hơn, không thì trên
  điện thoại bấm mãi không trúng. Đây là ngưỡng theo hướng dẫn của cả Apple và WCAG.
- **Lệnh xoá phải có bước xác nhận.** Một cái menu bị giấu + một cú bấm = mất dữ liệu.
- **Trạng thái theo quyền:** user không có quyền xoá thì lệnh Xoá phải ẩn hoặc disable,
  và nếu disable thì phải nói rõ vì sao.

---

## 5. 🍡 Meatballs Menu — ba chấm ngang

Vẫn ba dấu chấm, nhưng xếp **ngang**. Còn gọi là *horizontal ellipsis*.

**Dùng khi nào:** về công dụng thì gần giống kebab — menu hành động phụ. Khác biệt chủ yếu
là chỗ đặt: meatballs phù hợp khi nằm trên **thanh ngang** (toolbar, header của card), còn
kebab phù hợp khi nằm ở **cột dọc** bên phải danh sách.

Ngoài ra ba chấm ngang `…` còn mang nghĩa **"còn nữa"** rất tự nhiên, vì nó giống hệt dấu
ba chấm trong văn viết. Nên nó cũng hay dùng cho nút "xem thêm" khi toolbar bị chật.

```html
<div class="toolbar">
  <button type="button">Lưu</button>
  <button type="button">Chia sẻ</button>

  <button type="button" aria-label="Thêm tuỳ chọn" aria-haspopup="menu" aria-expanded="false">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="4"  cy="10" r="1.8" />
      <circle cx="10" cy="10" r="1.8" />
      <circle cx="16" cy="10" r="1.8" />
    </svg>
  </button>
</div>
```

---

## Chọn cái nào?

| Icon | Tên | Việc nó làm |
|---|---|---|
| ☰ | Hamburger | Điều hướng chính, thường trên mobile |
| ⩸ | Döner | Bộ lọc, sắp xếp |
| ⠿ | Bento | Chuyển ứng dụng, lưới nhiều lối vào |
| ⋮ | Kebab | Hành động cho một đối tượng, đặt ở cột dọc |
| ⋯ | Meatballs | Hành động phụ, đặt trên thanh ngang |

Một quy tắc chung đáng nhớ: **icon một mình thì luôn mơ hồ.** Kể cả hamburger — icon phổ
biến nhất — vẫn có nghiên cứu cho thấy thêm chữ "Menu" bên cạnh làm tăng lượt bấm.
Nếu bố cục còn chỗ, cứ để chữ. Icon là để tiết kiệm không gian, không phải để đố người dùng.

Và nếu bạn đang test một trong năm cái này: chuột bấm được không phải là xong. Hãy thử bằng
`Tab`, bằng `Enter`, bằng `Escape`, thử ở dòng cuối bảng, và thử trên màn hình điện thoại.
Bug thường không nằm ở chỗ nút có mở hay không — nó nằm ở chỗ mở rồi thì đóng thế nào.
