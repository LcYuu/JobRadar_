package com.job_portal.controller;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class PostJobTest {

	// @Test
	public void postJobTest() {

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

			WebElement jobListButton = driver.findElement(By.xpath("//button[contains(text(),'Danh sách công việc')]"));
			jobListButton.click();

			Thread.sleep(1000);
			WebElement button = driver.findElement(By.xpath("//button[text()='+ Đăng bài']"));
			button.click();

			WebElement inputField = driver.findElement(By.xpath("//input[@placeholder='Ví dụ: Kỹ sư']"));
			inputField.sendKeys("Trưởng phòng vật tư");

			WebElement radioButton = driver
					.findElement(By.xpath("//input[@name='typeOfWork' and @value='Toàn thời gian']"));
			radioButton.click();

			WebElement inputField1 = driver
					.findElement(By.xpath("//input[@type='number' and @placeholder='Ví dụ: 20000000']"));
			inputField1.sendKeys("15000000");

			WebElement inputFieldPos = driver.findElement(By.xpath("//input[@placeholder='e.g. Software Engineer']"));
			inputFieldPos.sendKeys("Trưởng phòng");

			WebElement dateInput = driver.findElement(By.xpath("//input[@type='date']"));
			// Nhập giá trị ngày theo định dạng YYYY-MM-DD (ví dụ: 2025-05-30)
			dateInput.sendKeys("30-05-2025");

			WebElement addButton = driver.findElement(By.xpath("//button//span[text()='Thêm']"));
			addButton.click();

			Thread.sleep(1000);

			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(1));
			WebElement checkboxLabel = wait.until(ExpectedConditions.visibilityOfElementLocated(
					By.xpath("//span[text()='Communication']/preceding-sibling::input[@type='checkbox']")));
			checkboxLabel.click();

			WebElement addButton1 = driver.findElement(By.xpath("//button//span[text()='Thêm']"));
			addButton1.click();

			WebElement nextButton = driver.findElement(By.xpath("//button[contains(text(),'Bước tiếp theo')]"));
			Actions actions = new Actions(driver);
			actions.moveToElement(nextButton).click().perform();

			WebElement placeholder = driver.findElement(By.xpath("//div[contains(text(), 'Nhập mô tả công việc...')]"));

			// Kiểm tra nếu placeholder có hiển thị
			if (placeholder.isDisplayed()) {
				WebElement editor = driver.findElement(By.cssSelector(".public-DraftEditor-content"));
				editor.sendKeys("Mô tả công việc mới");
			}

			WebElement editor = driver.findElement(By.xpath(
					"//div[contains(text(), 'Nhập trách nhiệm công việc...')]/ancestor::div[contains(@class, 'DraftEditor-root')]/descendant::div[@contenteditable='true']"));
			editor.sendKeys("Không lừa dối");

			WebElement inputElement = driver.findElement(By.xpath("//input[@placeholder='Enter years of experience']"));
			inputElement.sendKeys("1");

			WebElement request = driver.findElement(By.xpath(
					"//div[contains(text(), 'Nhập yêu cầu thêm...')]/ancestor::div[contains(@class, 'DraftEditor-root')]/descendant::div[@contenteditable='true']"));
			request.sendKeys("TN Đại học");

			WebElement nextButton1 = driver.findElement(By.xpath("//button[contains(text(),'Bước tiếp theo')]"));
			Actions actions1 = new Actions(driver);
			actions1.moveToElement(nextButton).click().perform();

			WebElement benefit = driver.findElement(By.xpath(
					"//div[contains(text(), 'Nhập lợi ích...')]/ancestor::div[contains(@class, 'DraftEditor-root')]/descendant::div[@contenteditable='true']"));
			benefit.sendKeys("BHYT");

			WebElement dropdown = driver.findElement(By.id("tinh"));
			Select select = new Select(dropdown);
			select.selectByVisibleText("Thành phố Hồ Chí Minh");

			WebElement dropdown1 = driver.findElement(By.id("quan"));
			Select select1 = new Select(dropdown1);
			select1.selectByVisibleText("Thành phố Thủ Đức");

			WebElement dropdown2 = driver.findElement(By.id("xa"));
			Select select2 = new Select(dropdown2);
			select2.selectByVisibleText("Phường Tăng Nhơn Phú A");

			WebElement addressInput = driver.findElement(By.xpath("//input[@placeholder='Nhập địa chỉ cụ thể']"));

			// Nhập giá trị vào trường input
			addressInput.sendKeys("Số 1 Lê Văn Việt");

			WebElement submitButton = driver
					.findElement(By.xpath("//button[contains(text(), 'Đăng') and contains(@class, 'bg-purple-600')]"));
			submitButton.click();

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void approveJobPostTest() {
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
			emailInput.sendKeys("21110665@student.hcmute.edu.vn");
			passwordInput.sendKeys("Danggiathuan@2003"); // Dữ liệu sai để kiểm tra đăng nhập thất bại

			// Nhấn nút đăng nhập
			loginButton.click();

			Thread.sleep(3000);

			WebElement jobListButton = driver.findElement(By.xpath("//button[contains(text(),'Danh sách công việc')]"));
			jobListButton.click();

			Thread.sleep(1000);
			WebElement jobTitleElement = driver.findElement(By.xpath("//td[@id='job-title' and text()='Trưởng phòng vật tư']"));

			if (jobTitleElement != null) {
				System.out.println("Tìm thấy trạng thái: " + jobTitleElement.getText());

				// Tìm nút "..." và nhấn vào nút đó
				WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(1));
				WebElement ellipsisButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[@id='radix-:r0:']")));

				// Sử dụng JavaScript Executor để nhấp vào phần tử
				JavascriptExecutor executor = (JavascriptExecutor) driver;
				executor.executeScript("arguments[0].click();", ellipsisButton);
			}
			
			// Tìm phần tử "Chi tiết" trong menu
			WebElement detailButton = driver.findElement(By.xpath("//div[normalize-space(text())='Chi tiết']"));
			detailButton.click();
			
			WebElement approveButton = driver.findElement(By.xpath("//button[contains(text(), 'Phê duyệt công việc')]"));
			approveButton.click();

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
