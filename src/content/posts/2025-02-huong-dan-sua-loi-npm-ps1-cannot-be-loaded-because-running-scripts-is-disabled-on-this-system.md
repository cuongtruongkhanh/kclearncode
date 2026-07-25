---
title: "Hướng Dẫn Sửa Lỗi “npm.ps1 cannot be loaded because running scripts is disabled on this system”"
description: "Giới Thiệu Nếu bạn đang sử dụng Node.js trên Windows và gặp lỗi sau khi chạy lệnh npm install hoặc bất kỳ lệnh nào khác"
pubDate: 2025-02-11
updatedDate: 2025-02-27
categories: ["Learning"]
tags: []
heroImage: "/images/posts/huong-dan-sua-loi-npm-ps1-cannot-be-loaded-because-running-scripts-is-disabled-on-this-system/hero-stsmall507x507-pad600x600f8f8f8.u28.jpg"
draft: false
wpId: 290
wpSlug: "huong-dan-sua-loi-npm-ps1-cannot-be-loaded-because-running-scripts-is-disabled-on-this-system"
---
## Giới Thiệu

Nếu bạn đang sử dụng Node.js trên Windows và gặp lỗi sau khi chạy lệnh `npm install` hoặc bất kỳ lệnh nào khác liên quan đến `npm`, có thể bạn sẽ thấy thông báo lỗi như sau:

```powershell
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Lỗi này xuất hiện do Windows PowerShell đang chặn việc chạy các script `.ps1` để đảm bảo an toàn. Bài viết này sẽ hướng dẫn bạn cách khắc phục lỗi này một cách nhanh chóng.

---

## Cách 1: Mở Quyền Chạy Script Tạm Thời (Khuyên Dùng)

Nếu bạn không muốn thay đổi cài đặt bảo mật vĩnh viễn, bạn có thể mở quyền chạy script chỉ trong phiên hiện tại bằng cách:

### Bước 1: Mở PowerShell với quyền Administrator

-   Nhấn **Windows + S**, gõ **PowerShell**
-   Click chuột phải vào **Windows PowerShell** và chọn **Run as Administrator**

### Bước 2: Chạy lệnh sau để tạm thời cho phép chạy script

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Bước 3: Chạy lại lệnh `npm install`

Sau khi thực hiện lệnh trên, hãy thử chạy lại lệnh mà bạn đang thực hiện, ví dụ:

```bash
npm install
```

Nếu thành công, bạn có thể tiếp tục làm việc mà không cần thay đổi gì thêm.

---

## Cách 2: Mở Quyền Chạy Script Vĩnh Viễn

Nếu bạn muốn tránh lỗi này trong tương lai, bạn có thể thiết lập lại chính sách thực thi script như sau:

### Bước 1: Mở PowerShell với quyền Administrator

Thực hiện tương tự như **Cách 1**.

### Bước 2: Chạy lệnh sau để cho phép chạy script trên toàn bộ hệ thống

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Bước 3: Xác nhận thay đổi

-   Khi được hỏi, nhập **Y** rồi nhấn **Enter**.
-   Sau đó, thử chạy lại lệnh `npm install`.

---

## Cách 3: Sử Dụng Command Prompt Thay Vì PowerShell

Nếu bạn không muốn thay đổi chính sách bảo mật của PowerShell, bạn có thể chạy `npm` bằng **Command Prompt** thay vì **PowerShell**:

1.  Mở **Command Prompt** bằng cách nhấn **Windows + R**, nhập `cmd`, rồi nhấn **Enter**.
2.  Điều hướng đến thư mục dự án bằng lệnh `cd path/to/project`.
3.  Chạy lại lệnh `npm install`.

Cách này giúp bạn tránh lỗi mà không cần thay đổi chính sách bảo mật của hệ thống.

---

## Kết Luận

Lỗi `npm.ps1 cannot be loaded because running scripts is disabled on this system` là do chính sách bảo mật của PowerShell ngăn không cho chạy script `.ps1`. Bạn có thể khắc phục nhanh bằng cách:

-   Mở quyền chạy script tạm thời bằng `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
-   Hoặc thiết lập lại chính sách chạy script vĩnh viễn bằng `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
-   Hoặc đơn giản là sử dụng **Command Prompt** thay vì **PowerShell**.

Hy vọng bài viết này giúp bạn khắc phục lỗi thành công và tiếp tục làm việc với Node.js một cách thuận lợi!
