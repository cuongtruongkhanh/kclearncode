---
title: "Ứng dụng Method Chaining – Fluent Interface trong Automation test"
description: "Tự động hóa việc kiểm thử là một phần quan trọng của quá trình phát triển phần mềm, và việc xây dựng mã kiểm thử"
pubDate: 2023-11-23
categories: ["C#", "Selenium"]
tags: ["Learning", "selenium"]
heroImage: "/images/posts/ung-dung-method-chaining-fluent-interface-trong-automation-test/hero-fluent252525252525252525252520interface2525252525252525252.png"
draft: false
wpId: 233
wpSlug: "ung-dung-method-chaining-fluent-interface-trong-automation-test"
---
Tự động hóa việc kiểm thử là một phần quan trọng của quá trình phát triển phần mềm, và việc xây dựng mã kiểm thử hiệu quả là một thách thức. Một trong những cách tiếp cận phổ biến để làm cho mã kiểm thử trở nên đơn giản, dễ đọc và linh hoạt là sử dụng Fluent Interface hay còn gọi là Method Chaining.

Fluent Interface là một phong cách lập trình thiết kế để tạo ra mã nguồn dễ đọc, dễ hiểu và trực quan. Nó giúp tạo ra các chuỗi lệnh mà nhìn vào đó giống như là đang đọc một đoạn văn bản, rất gần với ngôn ngữ tự nhiên.

Một ví dụ cụ thể về Fluent Interface có thể được thấy trong quy trình kiểm thử tự động của ứng dụng web, sử dụng thư viện Selenium và ngôn ngữ lập trình C#. Dưới đây là một đoạn mã mẫu:

```csharp
public class WebPage
{
    private IWebDriver driver;

    public WebPage(IWebDriver driver)
    {
        this.driver = driver;
    }

    public WebPage Open(string url)
    {
        driver.Navigate().GoToUrl(url);
        return this;
    }

    public WebPage ClickElement(By element)
    {
        driver.FindElement(element).Click();
        return this;
    }

    public WebPage FillForm(By inputField, string value)
    {
        driver.FindElement(inputField).SendKeys(value);
        return this;
    }

    public WebPage SubmitForm(By submitButton)
    {
        driver.FindElement(submitButton).Submit();
        return this;
    }
}
```

Với Fluent Interface, bạn có thể sử dụng mã kiểm thử một cách tự nhiên và đơn giản như sau:

```text
WebPage testPage = new WebPage(driver);

testPage
    .Open("https://example.com")
    .FillForm(By.Id("username"), "testuser")
    .FillForm(By.Id("password"), "testpassword")
    .SubmitForm(By.Id("loginButton"))
    .ClickElement(By.CssSelector(".logoutButton"));
```

Mỗi phương thức trả về chính đối tượng mà nó thuộc về, trong trường hợp này là `WebPage`. Điều này cho phép bạn gọi các phương thức liên tục mà không cần phải tạo ra các biến trung gian, tạo nên một chuỗi lệnh rõ ràng và dễ hiểu.

Fluent Interface không chỉ giúp làm cho mã kiểm thử dễ đọc, mà còn làm cho nó dễ bảo trì và mở rộng. Bạn có thể thêm hoặc sửa đổi các phương thức mà không làm ảnh hưởng đến cấu trúc tổng thể của mã. Điều này giúp cho việc duy trì mã kiểm thử trở nên dễ dàng hơn, đặc biệt khi cần thêm các bước kiểm thử mới vào quy trình.
