---
title: "[300 bài code thiếu nhi][Java] Bài toán Roman to Integer"
description: "Hello, lại là mình đây, hôm nay chúng ta sẽ đến với bài tiếp theo trong series 300 bài code thiếu nhi Nếu bạn nào"
pubDate: 2022-12-04
updatedDate: 2024-05-09
categories: ["Java", "Learning"]
tags: ["300 bai code", "Java", "Learning"]
heroImage: "/images/posts/300-bai-code-thieu-nhijava-bai-toan-roman-to-integer/hero-image-3.png"
draft: false
wpId: 147
wpSlug: "300-bai-code-thieu-nhijava-bai-toan-roman-to-integer"
---
Hello, lại là mình đây, hôm nay chúng ta sẽ đến với bài tiếp theo trong series 300 bài code thiếu nhi

Nếu bạn nào chưa từng có khái niệm gì về bí kíp này thì có thể xem lại bài của mình ở [đây](https://kclearncode.com/learning/300-bai-code-thieu-nhi-bai-toan-two-sum/) nhé

Bài toán hôm nay sẽ là Roman to Integer – Chuyển từ số La Mã sang số thập phân.

Nôm na thì số La Mã sẽ được thể hiện bởi 7 ký tự: `I`, `V`, `X`, `L`, `C`, `D` and `M`.

```text
Symbol       Value
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
```

Ví dụ: Số 2 sẽ được hiển thị là `II` trong số La Mã, số 12 sẽ là `XII` còn số 27 sẽ là `XXVII`

Số La Mã sẽ được viết từ số lớn nhất sang số nhỏ nhất từ trái sang phải, tuy nhiên số 4 sẽ không phải là `IIII`, mà sẽ được viết là `IV`, điều này cũng tương tự như số 9 được viết là `IX` dựa theo các quy định sau:

-   `I` có thể đứng trước `V` (5) và `X` (10) để tạo ra số 4 và 9
-   `X` có thể đứng trước `L` (50) và `C` (100) để tạo ra số 40 và 90.
-   `C` có thể đứng trước `D` (500) và `M` (1000) để tạo ra số 400 và 900.

Bài toán ở đây là đưa ra 1 số La Mã, hãy chuyển nó về số thập phân.

**Ví dụ 1:**

```text
Input: s = "III"
Output: 3
Explanation: III = 3.
```

**Ví dụ 2:**

```text
Input: s = "LVIII"
Output: 58
Explanation: L = 50, V= 5, III = 3.
```

**Ví dụ 3:**

```text
Input: s = "MCMXCIV"
Output: 1994
Explanation: M = 1000, CM = 900, XC = 90 and IV = 4.
```

Lời giải sẽ có ở trang sau nha các bạn 😛

Đây là lời giải cho bài toán Số La Mã:

```java
public class Roman_Number {
	public static void main(String[] args) {
		System.out.println(romanToInt("MCMXCIV"));
	}

	static int romanToInt(String s) {
		int[] nums = new int[s.length()];
		for (int i = 0; i < s.length(); i++) {
			switch (s.charAt(i)) {
			case 'I':
				nums[i] = 1;
				break;
			case 'V':
				nums[i] = 5;
				break;
			case 'X':
				nums[i] = 10;
				break;
			case 'L':
				nums[i] = 50;
				break;
			case 'C':
				nums[i] = 100;
				break;
			case 'D':
				nums[i] = 500;
				break;
			case 'M':
				nums[i] = 1000;
				break;
			default:
				break;
			}
		}
		int number = 0;
		for (int i = 0; i < s.length() - 1; i++) {

			if (nums[i] >= nums[i + 1]) {
				number += nums[i];
			}
			if (nums[i] < nums[i + 1]) {
				number -= nums[i];
			}
		}
		return number + nums[nums.length - 1];
	}
}
```

Chúc các bạn thành công 😀
