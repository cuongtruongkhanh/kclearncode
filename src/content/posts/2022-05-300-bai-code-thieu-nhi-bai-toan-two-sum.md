---
title: "[300 bài code thiếu nhi][Java] Bài toán Two Sum"
description: "Anh em coder chắc ai cũng biết đến bộ bí kíp 300 bài code thiếu nhi giúp cho các Dev thủ đổi đời 😀 Không"
pubDate: 2022-05-04
updatedDate: 2022-12-09
categories: ["Java", "Learning"]
tags: ["300 bai code", "Java", "Learning"]
heroImage: "/images/posts/300-bai-code-thieu-nhi-bai-toan-two-sum/hero-image-2.png"
draft: false
wpId: 132
wpSlug: "300-bai-code-thieu-nhi-bai-toan-two-sum"
---
Anh em coder chắc ai cũng biết đến bộ bí kíp 300 bài code thiếu nhi giúp cho các Dev thủ đổi đời 😀

Không khó để tìm được thần công này trên Google, cụ thể anh em có thể vào [đây](https://300baicode.com/)

### 300 bài code thiếu nhi là gì?

300 Bài code thiếu nhi là tập hợp các câu chuyện vui kể về một người không làm việc trong lĩnh vực IT, sau đó bỏ tất cả, quyết tâm theo đuổi lập trình để đổi đời.

Motif quen thuộc của câu chuyện này là: gần nhà mình có ông làm nghề nọ, một hôm nhặt được cuốn sách 300 bài code thiếu nhi, ông liền bắt đầu học lập trình. Đến nay ông kiếm được hơn nghìn đô một tháng.

![](/images/posts/300-bai-code-thieu-nhi-bai-toan-two-sum/image.png)

![](/images/posts/300-bai-code-thieu-nhi-bai-toan-two-sum/image-1.png)

### 2. Nguồn gốc của cụm từ 300 bài code thiếu nhi:

300 Bài code thiếu nhi xuất hiện lần đầu trên diễn đàn công nghệ vOz vào năm 2019. Cụm từ này nhái lại tên cuốn sách 300 bài hát thiếu nhi trong phim Tây Du Ký: Mối tình ngoại truyện của đạo diễn Châu Tinh Trì.

![300 bai code](/images/posts/300-bai-code-thieu-nhi-bai-toan-two-sum/image-3.png)

Mặc dù 300 bài code thiếu nhi đã được nhắc đến vào năm 2019, lượng tìm kiếm cụm từ này chỉ thực sự tăng vọt trong khoảng 2 tháng đổ lại.

Không chỉ được nhiều Facebook page nhiệt tình “lăng xê”, 300 bài code thiếu nhi cũng xuất hiện trên các video dạy lập trình. Cụm từ này phổ biến một phần ngành vì Công nghệ thông tin đang có tầm ảnh hưởng lớn trong thị trường làm việc trong nước.

Trên các diễn đàn công nghệ, một số người vui tính thường nói đùa “IT là vua của mọi nghề” vì nhu cầu tuyển dụng lập trình viên ngày một cao. Với chuyên môn tốt, kỹ sư ngành IT có thể kiếm được mức lương đáng ngưỡng mộ.

### Đi tìm lời giải cho một số bài toán của 300 bài code

Dù không xuất thân từ Dev nhưng mình vẫn muốn thử sức với 1 số bài code của bí kíp này, nên hôm nay mình sẽ làm thử bài đầu tiên của bí kíp, bài toán Two Sum

Đề bài như sau:

Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**

```text
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

**Example 2:**

```text
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

**Example 3:**

```text
Input: nums = [3,3], target = 6
Output: [0,1]
```

Nôm na ta có thể hiểu bài toán ở đây sẽ cho ta 1 mảng và 1 số target, số target này sẽ bằng tổng của 2 số bên trong của mảng, việc của chúng ta là đưa ra vị trí của 2 số đó bên trong mảng

Ví dụ ta có nums = {2, 7, 11, 15} và target bằng 9 thì output trả về sẽ là [0, 1] vì 2 + 7 = 9

Các bạn hãy thử làm và mình để đáp án ở trang sau của bài 😛

Đây là đáp án cho bài toán:

```java
public class Two_Sum {
	static int target = 9;
	static int[] nums = { 2, 7, 11, 15 };

	public static void main(String[] args) {
		twoSum(nums, target);
	}

	public static int[] twoSum(int[] nums, int target) {
		for (int i = 0; i < nums.length; i++) {
			for (int j = i + 1; j < nums.length; j++) {
				if (nums[i] + nums[j] == target) {
					System.out.println("[" + i + " , " + j + "]");
					return new int[] { i, j };
				}
			}
		}
		return null;

	}

}
```

Với bài toán này chúng ta cần 2 vòng for để tìm được 2 số sao cho tổng của nó bằng với target, và khi tìm được thì return vị trí của 2 số đó.

Chúc các bạn thành công.
