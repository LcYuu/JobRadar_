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
public class SearchTest {

	//@Test
	public void testSearchCompanySeeker() {

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

			System.out.println("Đăng nhập thành công, chuyển đến trang chính!");

			// Tìm và nhấn nút "Tìm việc"
			WebElement searchJobButton = driver.findElement(By.xpath("//button[normalize-space(text())='Công ty']"));
			searchJobButton.click(); // Nhấn nút "Tìm việc"
			 Thread.sleep(3000);

			WebElement inputField = driver
					.findElement(By.xpath("//input[@placeholder='Nhập tên công ty hoặc từ khóa mong muốn']"));

			// Nhập từ "lập trình" vào ô input
			inputField.sendKeys("lập trình");

			WebElement searchButton = driver.findElement(By.xpath("//button[normalize-space(text())='Tìm kiếm']"));
			searchButton.click();

		} catch (Exception e) {
			e.printStackTrace();
		} 
	}
	
	//@Test
	public void testSearchJobSeeker_01() {

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

			System.out.println("Đăng nhập thành công, chuyển đến trang chính!");

			// Tìm và nhấn nút "Tìm việc"
			WebElement searchJobButton = driver.findElement(By.xpath("//button[normalize-space(text())='Tìm việc']"));
			searchJobButton.click(); // Nhấn nút "Tìm việc"
			 Thread.sleep(3000);

			WebElement inputField = driver
					.findElement(By.xpath("//input[@placeholder='Nhập tên công việc hoặc từ khóa mong muốn']"));

			// Nhập từ "lập trình" vào ô input
			inputField.sendKeys("Lập trình");

			WebElement searchButton = driver.findElement(By.xpath("//button[normalize-space(text())='Tìm kiếm']"));
			searchButton.click();

		} catch (Exception e) {
			e.printStackTrace();
		} 
	}
}
