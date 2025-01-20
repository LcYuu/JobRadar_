package com.job_portal.controller;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
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
public class ForgotPasswordTest {

	@Test
	public void testForgotPass_01() {

		// Kiểm tra kết nối tới backend trước khi bắt đầu test
		try {
	        URL url = new URL("http://localhost:8080"); // URL của backend
	        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
	        connection.setRequestMethod("GET");
	        connection.connect();
	        if (connection.getResponseCode() != 200) {
	            throw new RuntimeException("Backend không sẵn sàng");
	        }
	        System.out.println("Backend sẵn sàng!");
	    } catch (IOException e) {
	        System.err.println("Không thể kết nối với backend: " + e.getMessage());
	        return; // Dừng test nếu không thể kết nối
	    }

	    System.setProperty("webdriver.chrome.driver", "D:\\ChromeDev\\chromedriver-win64\\chromedriver.exe");

	    ChromeOptions options = new ChromeOptions();
	    WebDriver driver = new ChromeDriver(options);

	    try {
	        // Truy cập vào trang đăng nhập của frontend
	        driver.get("http://localhost:3000/auth/sign-in");

	        // Nhấn vào "Quên mật khẩu?"
	        WebElement forgotPasswordLink = driver.findElement(By.xpath("//a[normalize-space(text())='Quên mật khẩu?']"));
	        forgotPasswordLink.click();

	        // Đợi đến khi chuyển sang trang quên mật khẩu
	        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
	        wait.until(ExpectedConditions.urlContains("forgot-password"));

	        // Nhập email để nhận OTP
	        WebElement emailInput = driver.findElement(By.xpath("//input[@type='email']"));
	        WebElement submitButton = driver.findElement(By.xpath("//button[normalize-space(text())='Gửi mã xác nhận']"));
	        emailInput.sendKeys("giathuanhl@gmail.com");
	        submitButton.click();

	        WebDriverWait wait2 = new WebDriverWait(driver, Duration.ofSeconds(10));
	        WebElement otpInput = wait2.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@type='text']")));
	        // Sau khi nhận OTP, giả sử bạn đã nhận OTP và nhập vào
	        String otp = "123456"; // Thay bằng mã OTP thật


	        WebElement verifyOtpButton = driver.findElement(By.xpath("//button[normalize-space(text())='Gửi mã OTP']"));
	        otpInput.sendKeys(otp);
	        verifyOtpButton.click();

	        // Sau khi OTP xác nhận thành công, chuyển sang form thay đổi mật khẩu
	        WebElement newPasswordInput = driver.findElement(By.xpath("//input[@id='newPassword']"));
	        WebElement confirmPasswordInput = driver.findElement(By.xpath("//input[@id='confirmPassword']"));
	        WebElement submitNewPasswordButton = driver.findElement(By.xpath("//button[normalize-space(text())='Xác nhận thay đổi']"));

	        // Nhập mật khẩu mới và xác nhận mật khẩu
	        newPasswordInput.sendKeys("Danggiathuan@2003");
	        confirmPasswordInput.sendKeys("Danggiathuan@2003");

	        // Nhấn vào nút thay đổi mật khẩu
	        submitNewPasswordButton.click();

	        // Đợi thông báo thành công
	        WebElement changePasswordSuccessMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//p[normalize-space(text())='Mật khẩu đã được thay đổi thành công']")));
	        
	        assertTrue(changePasswordSuccessMessage.isDisplayed(), "Mật khẩu thay đổi không thành công!");

	        // In ra kết quả
	        System.out.println("Thay đổi mật khẩu thành công!");
	    } catch (Exception e) {
	        e.printStackTrace();
	    } finally {
	        // Đóng trình duyệt sau khi test
	        driver.quit();
	    }
	}
}
