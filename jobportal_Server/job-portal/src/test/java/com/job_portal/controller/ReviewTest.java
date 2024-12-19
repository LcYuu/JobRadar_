package com.job_portal.controller;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ReviewTest {

	//@Test
	public void testReview_01() {

		// Đảm bảo đường dẫn đến ChromeDriver là đúng
		System.setProperty("webdriver.chrome.driver", "D:\\ChromeDev\\chromedriver-win64\\chromedriver.exe");

		// Khởi tạo WebDriver với ChromeOptions (tùy chọn)
		ChromeOptions options = new ChromeOptions();
		WebDriver driver = new ChromeDriver(options);

		try {
			// Truy cập vào trang đăng nhập của frontend
			driver.get("http://localhost:3000/auth/sign-in"); // Cập nhật URL của frontend React của bạn

			// Tìm các phần tử input và nhập dữ liệu
			WebElement emailInput = driver.findElement(By.xpath("//input[@type='email']"));
			WebElement passwordInput = driver.findElement(By.xpath("//input[@type='password']"));
			WebElement loginButton = driver.findElement(By.xpath("//button[normalize-space(text())='Đăng nhập']"));

			// Nhập dữ liệu đăng nhập
			emailInput.sendKeys("giathuanhl@gmail.com");
			passwordInput.sendKeys("Danggiathuan@2003"); // Dữ liệu sai để kiểm tra đăng nhập thất bại

			// Nhấn nút đăng nhập
			loginButton.click();

			// Đợi cho trang chuyển hướng (hoặc kiểm tra URL hiện tại)
			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
			wait.until(ExpectedConditions.urlToBe("http://localhost:3000/")); // Đảm bảo URL chuyển đến trang chính

			String username = "Gia Thuan";

			// Sau khi đăng nhập thành công, click vào phần tử chứa giá trị trong biến
			// username
			WebElement giaThuanElement = wait
					.until(ExpectedConditions.elementToBeClickable(By.xpath("//span[text()='" + username + "']")));
			giaThuanElement.click(); // Thực hiện thao tác click
			
			Thread.sleep(3000);
			
			 // Tìm nút "Công ty theo dõi" bằng CSS Selector
			WebElement followCompanyButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(text(), 'Công ty theo dõi')]")));

	        // Nhấn vào nút
	        followCompanyButton.click();
	        
	        WebElement tableRow = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//tr[td/span[text()='Tin học đại dương']]")));

	        // Nhấn vào dòng <tr>
	        tableRow.click();
	        
	        WebElement button = driver.findElement(By.cssSelector("button.cursor-pointer svg[data-testid='StarRoundedIcon']"));
	        button.click();
	        
	        WebElement textarea = driver.findElement(By.xpath("//textarea[@placeholder='Nhập đánh giá của bạn...']"));

            // Nhập văn bản vào textarea
            textarea.sendKeys("Công ty okee");
            WebElement checkbox = driver.findElement(By.id("anonymous"));

            // Nhấn vào checkbox
            checkbox.click();
            
            WebElement button1 = driver.findElement(By.xpath("//button[text()='Gửi đánh giá']"));

            // Nhấn vào nút
            button1.click();

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
