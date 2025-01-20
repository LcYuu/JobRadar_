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
public class ApplyJobTest {
	//@Test
	public void testApplyJob() {

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
			WebElement followCompanyButton = wait.until(ExpectedConditions
					.elementToBeClickable(By.xpath("//button[contains(text(), 'Công ty theo dõi')]")));

			followCompanyButton.click();

			WebElement tableRow = wait.until(
					ExpectedConditions.elementToBeClickable(By.xpath("//tr[td/span[text()='Tin học đại dương']]")));

			tableRow.click();

			WebElement jobPost = driver.findElement(By.xpath("//h3[text()='Kỹ sư mạch điện']"));

			jobPost.click();

			WebElement submitButton = driver.findElement(By.xpath("//button[text()='Nộp đơn']"));
			submitButton.click();

			WebElement fullNameField = driver.findElement(By.name("fullName"));
			// Nhập giá trị "Gia Thuận" vào ô nhập liệu
			fullNameField.sendKeys("Gia Thuận");

			WebElement emailField = driver.findElement(By.name("email"));
			// Nhập địa chỉ email vào ô nhập liệu
			emailField.sendKeys("giathuanhl@gmail.com");

			WebElement editableField = driver.findElement(By.xpath("//div[@contenteditable='true']"));
			editableField.sendKeys("Tôi hi vọng được nhận");

			WebElement submitButton_1 = driver.findElement(By.xpath("//button[text()='Gửi']"));
			submitButton_1.click();

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	//@Test
	public void testApproveApplyJob() {

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
			emailInput.sendKeys("danggiathuanhl@gmail.com");
			passwordInput.sendKeys("Danggiathuan@2003"); // Dữ liệu sai để kiểm tra đăng nhập thất bại

			// Nhấn nút đăng nhập
			loginButton.click();

			Thread.sleep(3000);

			WebElement jobListButton = driver.findElement(By.xpath("//button[contains(text(),'Danh sách ứng tuyển')]"));
			jobListButton.click();
			WebElement unapprovedStatus = driver.findElement(By.xpath("//span[text()='Chưa duyệt' and contains(@class, 'bg-red-100') and contains(@class, 'text-red-600')]"));

			  if (unapprovedStatus != null) {
	                System.out.println("Tìm thấy trạng thái: " + unapprovedStatus.getText());

	                // Tìm nút "..." và nhấn vào nút đó
	                WebElement ellipsisButton = driver.findElement(By.xpath("//button[@id='radix-:r0:']"));
	                ellipsisButton.click();
	                System.out.println("Đã nhấn vào nút ...");
	            } else {
	                System.out.println("Không tìm thấy trạng thái 'Chưa duyệt'");
	            }
			
            WebElement approveButton = driver.findElement(By.xpath("//div[text()='Chấp thuận đơn']"));
            approveButton.click();

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	

}
