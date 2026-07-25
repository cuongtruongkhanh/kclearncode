---
title: "Cách chạy TC automation ở chế độ ẩn danh (Incognito Mode) sử dụng Selenium, Specflow và C#"
description: "Kiểm thử tự động là một phần quan trọng của vòng đời phát triển phần mềm, giúp đảm bảo tính chặt chẽ và đáng tin"
pubDate: 2023-11-26
categories: ["C#", "Learning"]
tags: []
heroImage: "/images/posts/cach-chay-tc-automation-o-che-do-an-danh-incognito-mode-su-dung-selenium-specflow-va-c/hero-incognito.jpeg"
draft: false
wpId: 237
wpSlug: "cach-chay-tc-automation-o-che-do-an-danh-incognito-mode-su-dung-selenium-specflow-va-c"
---
Kiểm thử tự động là một phần quan trọng của vòng đời phát triển phần mềm, giúp đảm bảo tính chặt chẽ và đáng tin cậy của ứng dụng. Đôi khi, việc mô phỏng hành vi người dùng trong chế độ ẩn danh là cần thiết để kiểm thử hiệu quả các kịch bản khác nhau. Trong hướng dẫn này, chúng ta sẽ tìm hiểu cách chạy bài kiểm tra tự động trong chế độ incognito bằng cách sử dụng Selenium, SpecFlow và C#.

## Yêu Cầu:

-   Visual Studio (hoặc bất kỳ môi trường phát triển C# nào khác)
-   Selenium WebDriver
-   SpecFlow

## Bước 1: Gắn Thẻ cho Các Bài Kiểm Tra

Đầu tiên, hãy gắn thẻ cho các bài kiểm tra cần chạy trong chế độ incognito. Trong các tệp đặc trưng của bạn, thêm thẻ `@RunIncognito` vào các kịch bản cần chạy trong chế độ incognito:

```text
@ui @RunIncognito
Scenario: Tiêu đề kịch bản của bạn
    Given ...
    When ...
    Then ...
```

## Bước 2: Hook cho Kịch Bản

Trong lớp `ScenarioHooks` của bạn, sử dụng `ScenarioContext` của SpecFlow để xác định xem một kịch bản có được gắn thẻ với `@RunIncognito` hay không:

```csharp
[BeforeScenario("ui")]
public void InitialiseBrowser(ScenarioContext scenarioContext)
{
    bool runIncognito = scenarioContext.ScenarioInfo.Tags.Contains("RunIncognito");

    var driverManager = new DriverManager();
    var driver = driverManager.GetScenarioDriver(scenarioContext, runIncognito);

    _objectContainer.RegisterInstanceAs(driver);
    Log.Info("Đã đăng ký đối tượng trong ObjectContainer");
}
```

## Bước 3: Sửa Đổi Phương Thức GetDriver

Trong lớp `DriverManager` của bạn hoặc bất kỳ nơi nào bạn khởi tạo WebDriver, sửa đổi phương thức `GetDriver` để chấp nhận tham số `runIncognito`:

```csharp
public IWebDriver GetDriver(bool geolocationDisabled, bool runIncognito)
{
    // Mã hiện tại của bạn...

    _runIncognito = runIncognito;

    // Mã hiện tại của bạn...
}
```

## Bước 4: Tùy Chọn Chrome

Cuối cùng, trong các tùy chọn cụ thể cho Chrome, thêm đối số `--incognito` nếu kịch bản cần chạy trong chế độ incognito:

```csharp
private ChromeOptions GetChromeOptions()
{
    ChromeOptions options = new ChromeOptions();

    // Các tùy chọn hiện tại của bạn...

    if (_runIncognito)
    {
        options.AddArgument("--incognito");
    }

    // Các tùy chọn hiện tại của bạn...

    return options;
}
```

## Kết Luận

Bằng cách tuân theo những bước này, bạn có thể tích hợp chế độ incognito vào khung kiểm thử tự động của mình sử dụng Selenium và SpecFlow. Việc đánh dấu kịch bản và sửa đổi quá trình khởi tạo WebDriver cho phép linh hoạt trong việc thực hiện kiểm thử, làm cho bộ kiểm thử tự động của bạn trở nên mạnh mẽ và dễ điều chỉnh theo các yêu cầu kiểm thử khác nhau.

Chúc bạn kiểm thử vui vẻ!
