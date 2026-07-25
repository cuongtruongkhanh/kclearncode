---
title: "Vibe Coding Với AI: Khi Bạn Không Biết Gọi Tên Thành Phần Giao Diện Đó Là Gì"
description: "Vibe coding giúp bạn tạo UI chỉ bằng lời nói, nhưng sẽ bế tắc khi bạn không biết thành phần giao diện mình muốn tên là gì. NameThatUI là công cụ giải quyết vấn đề này."
pubDate: 2026-07-25
categories: ["AI"]
tags: ["AI", "vibe coding", "UI", "frontend"]
heroImage: "/images/posts/vibe-coding-va-van-de-goi-ten-thanh-phan-giao-dien/hero.png"
heroImageAlt: "Bong bóng suy nghĩ với câu hỏi “What’s this UI element called?” bên cạnh các thành phần giao diện được đánh dấu hỏi"
draft: false
---

## 🎯 Giới Thiệu

Vài năm trước, muốn dựng một cái giao diện web bạn phải biết HTML, CSS, biết cách canh chỉnh flexbox sao cho nó không "nhảy" tứ tung. Bây giờ thì khác: bạn mở Claude Code, Cursor hay Copilot lên, gõ một câu tiếng Việt lơ lửng kiểu *"làm cho tôi cái form đăng nhập có nút submit màu xanh"* — và mấy giây sau code hiện ra.

Người ta gọi cách làm việc đó là **vibe coding**: bạn không viết code, bạn *mô tả* thứ mình muốn rồi để AI viết.

Nghe rất sướng. Nhưng làm một thời gian bạn sẽ gặp một rào cản rất lạ, và nó không nằm ở AI — nó nằm ở **vốn từ vựng của chính bạn**.

---

## 😵 Vấn Đề: "Cái Đó Kêu Là Gì Ta?"

Tình huống quen thuộc: bạn thấy một trang web có hiệu ứng rất hay, muốn AI làm giống vậy. Nhưng khi mở chat lên, bạn chỉ gõ được đại loại:

> "cái thanh nhỏ nhỏ chạy ở trên cùng trang web, khi mình cuộn xuống thì nó dài ra"

> "cái lớp mờ mờ tối tối nằm phía sau popup ấy"

> "cái ô vuông nhỏ có cái vòng tròn trượt qua trượt lại để bật/tắt"

AI sẽ đoán. Và vì nó đoán, bạn nhận về một thứ *na ná* — rồi bắt đầu vòng lặp đau khổ: "không, không phải cái đó", "gần rồi mà chưa đúng", "bỏ đi làm lại"... Mỗi lượt như vậy tốn thời gian, tốn token, và tốn kiên nhẫn.

Trong khi đó, ba thứ ở trên đều **có tên chính xác**:

| Bạn mô tả | Tên thật |
|---|---|
| Thanh chạy dài ra khi cuộn trang | **Scroll progress indicator** (CSS: `animation-timeline: scroll()`) |
| Lớp mờ tối phía sau popup | **Backdrop / Overlay / Scrim** |
| Ô bật tắt có vòng tròn trượt | **Toggle switch** (không phải checkbox!) |

Chỉ cần gõ đúng chữ **"scroll progress indicator"** thay vì cả một đoạn văn mô tả, AI ra đúng ngay từ lần đầu.

Bài học ở đây: **vibe coding không loại bỏ nhu cầu hiểu biết chuyên môn — nó chuyển nhu cầu đó từ "biết viết code" sang "biết gọi đúng tên"**. Prompt của bạn tốt đến đâu phụ thuộc vào việc bạn có đúng từ khóa hay không.

---

## 🔍 Giải Pháp: NameThatUI

Đây là lúc [namethatui.com](https://namethatui.com/) trở nên hữu ích. Nó là một **từ điển hình ảnh cho các thành phần giao diện** — hoạt động ngược so với từ điển thường:

- **Từ điển thường:** bạn có từ → tra ra nghĩa.
- **NameThatUI:** bạn có *hình dung mơ hồ trong đầu* → tra ra **tên chuẩn**.

Cách dùng cực đơn giản: vào trang, gõ vào ô tìm kiếm bằng ngôn ngữ bình dân thứ bạn đang hình dung — ví dụ *"the dark see-through layer behind a popup"* — và nó trả về tên chính thức của thành phần đó.

**Vài điểm mình thấy đáng giá:**

- **Trả về cả tên trong code, không chỉ tên gọi.** Mỗi thành phần đi kèm ký hiệu API thật — ví dụ `animation-timeline: scroll()` cho web, hay `NSColorWell` cho macOS. Đây chính là thứ bạn dán thẳng vào prompt.
- **Có sẵn prompt mẫu.** Nhiều entry kèm luôn câu prompt để bạn copy đưa cho AI.
- **Phân loại theo nền tảng.** Có mục riêng cho Web elements và cho macOS components (AppKit / SwiftUI) — kèm bảng đối chiếu tên bình dân sang tên framework.
- **Giải thích các cặp dễ nhầm.** Có mục kiểu *"Switch vs. Checkbox vs. Radio"* — ba thứ trông tương tự nhưng ngữ nghĩa khác nhau, và chọn sai thì AI sinh ra code sai kiểu tương tác.
- **Double-click để tra nghĩa.** Nhấp đôi vào bất kỳ từ nào trên trang sẽ hiện định nghĩa tiếng Anh đơn giản.
- **"Surprise me".** Nút xem thành phần ngẫu nhiên — rảnh thì bấm chơi, tự nhiên nhớ thêm được vài cái tên.

---

## 🛠️ Quy Trình Mình Đề Xuất

Khi muốn thêm hoặc sửa một thành phần UI mà chưa biết gọi nó là gì:

1. **Mô tả cho chính mình** thứ bạn thấy — nó nằm ở đâu, làm gì khi tương tác.
2. **Tra trên NameThatUI** bằng đúng cách mô tả bình dân đó.
3. **Lấy tên chuẩn + ký hiệu API** trong kết quả.
4. **Viết prompt bằng tên chuẩn:**

   ❌ *"thêm cái thanh nhỏ ở trên cùng để biết mình cuộn tới đâu"*

   ✅ *"Thêm scroll progress indicator ở đầu trang, dùng CSS `animation-timeline: scroll()`, cao 3px, màu accent của theme"*

5. **So sánh kết quả** — nếu chưa đúng, giờ bạn đã có từ vựng để tinh chỉnh chính xác ("đổi thành sticky header thay vì fixed header") chứ không phải mô tả lại từ đầu.

Điểm lợi kép: sau vài lần tra, bạn **thật sự học được** những từ này. Lần sau không cần tra nữa — và bạn cũng nói chuyện được với designer hay dev khác bằng cùng một ngôn ngữ.

---

## 💡 Nhìn Rộng Ra Một Chút

Chuyện này không chỉ đúng với UI. Nó là một mẫu chung khi làm việc với AI:

> **Chất lượng output tỉ lệ thuận với độ chính xác của từ vựng trong input.**

Bạn muốn AI tối ưu database — biết chữ "N+1 query" sẽ đi xa hơn việc nói "sao nó chạy chậm quá". Bạn muốn AI sửa test flaky — biết chữ "race condition", "implicit wait" sẽ ra đúng hướng nhanh hơn.

Vibe coding hạ thấp rào cản *thực thi*, nhưng nó lại **đề cao rào cản diễn đạt**. AI có thể viết code thay bạn, nhưng chưa thể đọc được thứ đang mơ hồ trong đầu bạn. Còn khoảng cách đó thì những công cụ như NameThatUI vẫn còn chỗ đứng.

---

## ✅ Kết

- Vibe coding giúp bạn dựng UI nhanh, nhưng bị nghẽn ở chỗ bạn không biết gọi tên thành phần mình muốn.
- [NameThatUI](https://namethatui.com/) là từ điển hình ảnh giải quyết đúng vấn đề đó: mô tả bình dân → tên chuẩn + ký hiệu API.
- Prompt bằng tên chuẩn thay vì mô tả dài dòng: ít vòng lặp sửa hơn, kết quả đúng hơn ngay từ đầu.
- Và quan trọng nhất: mỗi lần tra là một lần bạn học thêm một từ. Đó là phần AI không làm hộ được.
