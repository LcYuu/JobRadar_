package com.job_portal.controller;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;

@SpringBootTest
public class LoginTest {

//    @Test
    public void testLogin_01() {
        // Kiểm tra kết nối tới backend trước khi bắt đầu test
        try {
            URL url = new URL("http://localhost:8080");  // URL của backend
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();
            if (connection.getResponseCode() != 200) {
                throw new RuntimeException("Backend không sẵn sàng");
            }
            System.out.println("Backend sẵn sàng!");
        } catch (IOException e) {
            System.err.println("Không thể kết nối với backend: " + e.getMessage());
            return;  // Dừng test nếu không thể kết nối
        }

        // Đảm bảo đường dẫn đến ChromeDriver là đúng
        System.setProperty("webdriver.chrome.driver", "D:\\ChromeDev\\chromedriver-win64\\chromedriver.exe");  // Cập nhật đường dẫn đúng cho ChromeDriver

        // Khởi tạo WebDriver với ChromeOptions (tùy chọn)
        ChromeOptions options = new ChromeOptions();

        WebDriver driver = new ChromeDriver(options);

        try {
            // Truy cập vào trang đăng nhập của frontend
            driver.get("http://localhost:3000/auth/sign-in");  // Cập nhật URL của frontend React của bạn

            // Tìm các phần tử input và nhập dữ liệu
            WebElement emailInput = driver.findElement(By.xpath("//input[@type='email']"));
            WebElement passwordInput = driver.findElement(By.xpath("//input[@type='password']"));
            WebElement loginButton = driver.findElement(By.xpath("//button[normalize-space(text())='Đăng nhập']"));

            emailInput.sendKeys("giathuanhl@gmail.com");
            passwordInput.sendKeys("Danggiathuan@2003");  // Dữ liệu sai để kiểm tra đăng nhập thất bại

            // Nhấn nút đăng nhập
            loginButton.click();

            // Đợi thông báo lỗi xuất hiện
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
            WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[@id='swal2-title' and text()='Đăng nhập thất bại']")));

            // Kiểm tra thông báo lỗi
            assertTrue(errorMessage.isDisplayed(), "Thông báo lỗi không xuất hiện!");

            // In ra kết quả
            System.out.println("Đăng nhập thất bại!");

        } catch (Exception e) {
            e.printStackTrace();
        } 
    }
    
    @Test
    public void loginFailure_02() {
        
        // Đảm bảo đường dẫn đến ChromeDriver là đúng
        System.setProperty("webdriver.chrome.driver", "D:\\ChromeDev\\chromedriver-win64\\chromedriver.exe");  // Cập nhật đường dẫn đúng cho ChromeDriver

        // Khởi tạo WebDriver với ChromeOptions (tùy chọn)
        ChromeOptions options = new ChromeOptions();

        WebDriver driver = new ChromeDriver(options);

        try {
            // Truy cập vào trang đăng nhập của frontend
            driver.get("http://localhost:3000/auth/sign-in");  // Cập nhật URL của frontend React của bạn

            // Tìm các phần tử input và nhập dữ liệu
            WebElement emailInput = driver.findElement(By.xpath("//input[@type='email']"));
            WebElement passwordInput = driver.findElement(By.xpath("//input[@type='password']"));
            WebElement loginButton = driver.findElement(By.xpath("//button[normalize-space(text())='Đăng nhập']"));

            emailInput.sendKeys("123@gmail.com");
            passwordInput.sendKeys("Danggiathuan@2003");  // Dữ liệu sai để kiểm tra đăng nhập thất bại

            loginButton.click();

            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
            WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[@id='swal2-title' and text()='Đăng nhập thất bại']")));

            // Kiểm tra thông báo lỗi
            assertTrue(errorMessage.isDisplayed(), "Thông báo lỗi không xuất hiện!");

            // In ra kết quả
            System.out.println("Đăng nhập thất bại!");

        } catch (Exception e) {
            e.printStackTrace();
        } 
    }
    
    @Test
    public void loginFailure_03() {
        
        // Đảm bảo đường dẫn đến ChromeDriver là đúng
        System.setProperty("webdriver.chrome.driver", "D:\\ChromeDev\\chromedriver-win64\\chromedriver.exe");  // Cập nhật đường dẫn đúng cho ChromeDriver

        // Khởi tạo WebDriver với ChromeOptions (tùy chọn)
        ChromeOptions options = new ChromeOptions();

        WebDriver driver = new ChromeDriver(options);

        try {
            // Truy cập vào trang đăng nhập của frontend
            driver.get("http://localhost:3000/auth/sign-in");  // Cập nhật URL của frontend React của bạn

            // Tìm các phần tử input và nhập dữ liệu
            WebElement emailInput = driver.findElement(By.xpath("//input[@type='email']"));
            WebElement passwordInput = driver.findElement(By.xpath("//input[@type='password']"));
            WebElement loginButton = driver.findElement(By.xpath("//button[normalize-space(text())='Đăng nhập']"));

            emailInput.sendKeys("giathuanhl@gmail.com");
            passwordInput.sendKeys("danggiathuan");  // Dữ liệu sai để kiểm tra đăng nhập thất bại

            loginButton.click();

            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
            WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[@id='swal2-title' and text()='Đăng nhập thất bại']")));

            // Kiểm tra thông báo lỗi
            assertTrue(errorMessage.isDisplayed(), "Thông báo lỗi không xuất hiện!");

            // In ra kết quả
            System.out.println("Đăng nhập thất bại!");

        } catch (Exception e) {
            e.printStackTrace();
        } 
    }
    @Test
    public void loginFailure_04() {
        
        // Đảm bảo đường dẫn đến ChromeDriver là đúng
        System.setProperty("webdriver.chrome.driver", "D:\\ChromeDev\\chromedriver-win64\\chromedriver.exe");  // Cập nhật đường dẫn đúng cho ChromeDriver

        // Khởi tạo WebDriver với ChromeOptions (tùy chọn)
        ChromeOptions options = new ChromeOptions();

        WebDriver driver = new ChromeDriver(options);

        try {
            // Truy cập vào trang đăng nhập của frontend
            driver.get("http://localhost:3000/auth/sign-in");  // Cập nhật URL của frontend React của bạn

            // Tìm các phần tử input và nhập dữ liệu
            WebElement emailInput = driver.findElement(By.xpath("//input[@type='email']"));
            WebElement passwordInput = driver.findElement(By.xpath("//input[@type='password']"));
            WebElement loginButton = driver.findElement(By.xpath("//button[normalize-space(text())='Đăng nhập']"));

            emailInput.sendKeys("giathuanhl@gmail.com");
            passwordInput.sendKeys("Danggiathuan1@2003");  // Dữ liệu sai để kiểm tra đăng nhập thất bại

            loginButton.click();

            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
            WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[@id='swal2-title' and text()='Đăng nhập thất bại']")));

            // Kiểm tra thông báo lỗi
            assertTrue(errorMessage.isDisplayed(), "Thông báo lỗi không xuất hiện!");

            // In ra kết quả
            System.out.println("Đăng nhập thất bại!");

        } catch (Exception e) {
            e.printStackTrace();
        } 
    }
//    @Test
//    public void testLoginWithGoogle() {
//        // Đảm bảo đường dẫn đến ChromeDriver là đúng
//        System.setProperty("webdriver.chrome.driver", "D:\\ChromeDev\\chromedriver-win64\\chromedriver.exe");  // Cập nhật đường dẫn đúng cho ChromeDriver
//
//        // Khởi tạo WebDriver với ChromeOptions (tùy chọn)
//        ChromeOptions options = new ChromeOptions();
//        options.addArguments("--disable-web-security");
//        options.addArguments("--no-sandbox");
//        options.addArguments("--disable-features=VizDisplayCompositor"); // Để giải quyết một số vấn đề bảo mật khác
//
//        WebDriver driver = new ChromeDriver(options);
//
//        try {
//            // Truy cập vào trang đăng nhập của frontend
//            driver.get("http://localhost:3000/auth/sign-in");  // Cập nhật URL của frontend React của bạn
//
//            // Tìm nút đăng nhập bằng Google và nhấn vào@
//            WebElement googleLoginButton = driver.findElement(By.className("nsm7Bb-HzV7m-LgbsSe-BPrWId"));
//            googleLoginButton.click();
//
//            // Chờ cho cửa sổ đăng nhập Google hiển thị (có thể sử dụng iframe hoặc popup)
//            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(100000));
//            WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("identifier")));  // Tìm ô nhập email
//
//            // Nhập email và nhấn nút tiếp theo
//            emailInput.sendKeys("thienvysenpai@gmail.com");
//            driver.findElement(By.id("identifier")).click();
//
//            // Chờ để nhập mật khẩu
//            WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("password")));
//            passwordInput.sendKeys("your-password");
//            driver.findElement(By.id("passwordNext")).click();
//
//            // Chờ đến khi đăng nhập thành công và trang chủ tải xong
//            wait.until(ExpectedConditions.urlContains("dashboard")); // Chờ URL chứa "dashboard" để xác nhận đã đăng nhập
//
//            // Kiểm tra xem trang đã chuyển đến trang chủ sau khi đăng nhập chưa
//            assertTrue(driver.getCurrentUrl().contains("dashboard"), "Đăng nhập Google không thành công!");
//
//            // In ra kết quả
//            System.out.println("Đăng nhập qua Google thành công!");
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        } finally {
//            // Đóng trình duyệt
//            driver.quit();
//        }
//    }

}
