---
title: "[Eclipse][Maven] Fix lỗi “Could not get the value for parameter encoding for plugin execution default-resources”"
description: "Issue: Khi tạo mới hoặc update 1 Maven project chúng ta có thể gặp lỗi như sau: Cause: Nguyên nhân có thể do file repository"
pubDate: 2022-12-10
updatedDate: 2022-12-12
categories: ["Eclipse", "Learning", "Selenium"]
tags: ["Java", "Maven", "selenium"]
heroImage: "/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/hero-image-18-e1670819138700.png"
draft: false
wpId: 165
wpSlug: "eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources"
---
![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-18.png)

## Issue:

Khi tạo mới hoặc update 1 Maven project chúng ta có thể gặp lỗi như sau:

![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-4.png)

## Cause:

Nguyên nhân có thể do file repository của máy đang bị lỗi

![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-5.png)

## Solution:

-   Bước 1: Close Eclipse
-   Bước 2: Tìm đến folder home repository (Thường sẽ ở ổ C)

![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-11.png)

Bước 3: Xóa folder repository

![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-14.png)

-   Bước 4: Mở lại Eclipse
-   Bước 5: Click chuột vào project Maven đang báo lỗi và chọn “Project” –> “Clean”.

![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-12.png)

-   Bước 6: Ấn chuột phải vào project và chọn “Maven” –> “Update Project…”.

![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-15.png)

-   Bước 7: Khởi động lại Eclipse
-   Bước 8: Ấn chuột phải vào project và chọn Refresh (F5)

![](/images/posts/eclipsemaven-fix-loi-could-not-get-the-value-for-parameter-encoding-for-plugin-execution-default-resources/image-13.png)

Chúc các bạn thành công 😛
