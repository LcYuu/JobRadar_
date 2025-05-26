package com.job_portal.utils;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.job_portal.models.JobPost;
import com.job_portal.models.Subscription;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Component
public class EmailUtil {
	
	private static final Logger logger = LoggerFactory.getLogger(EmailUtil.class);
	@Autowired
	private JavaMailSender javaMailSender;

	public void sendOtpEmail(String email, String otp) throws MessagingException {
		MimeMessage mimeMessage = javaMailSender.createMimeMessage();
		MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage,
				MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

		mimeMessageHelper.setTo(email);
		mimeMessageHelper.setSubject("Xác nhận mã OTP");
		mimeMessageHelper.setText(
				"""
						<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
						    <p style="font-size: 18px;">Chào bạn,</p>
						    <p style="font-size: 18px;">Bạn đã yêu cầu xác nhận tài khoản. Đây là mã OTP của bạn:</p>
						    <h2 style="color: #2E86C1; font-size: 28px; text-align: center; margin: 20px 0;">%s</h2>
						    <p style="font-size: 18px;">Vui lòng nhập mã OTP này để xác minh tài khoản của bạn.</p>
						</div>
						"""
						.formatted(otp),
				true);

		javaMailSender.send(mimeMessage);
	}

	public void sendForgotMail(String email, String otp) throws MessagingException {
		MimeMessage mimeMessage = javaMailSender.createMimeMessage();
		MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage,
				MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
		mimeMessageHelper.setTo(email);
		mimeMessageHelper.setSubject("Xác nhận mã OTP");
		mimeMessageHelper.setText(
				"""
						<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
						    <p style="font-size: 18px;">Chào bạn,</p>
						    <p style="font-size: 18px;">Bạn đã vô tình quên mật khẩu. Đây là mã OTP của bạn:</p>
						    <h2 style="color: #2E86C1; font-size: 28px; text-align: center; margin: 20px 0;">%s</h2>
						    <p style="font-size: 18px;">Vui lòng nhập mã OTP này để xác minh tài khoản của bạn.</p>
						</div>
						"""
						.formatted(otp),
				true);
		javaMailSender.send(mimeMessage);
	}

	public void sendBlockAccountEmail(String toEmail, String companyName, String blockedUntil, String blockedReason)
            throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String subject = "Thông báo khóa tài khoản";
        String content = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Thông báo khóa tài khoản</title>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 20px; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1); border: 1px solid #ddd; } /* Added border */
                        .header { text-align: center; background-color: #007bff; color: #ffffff; padding: 20px; border-radius: 12px 12px 0 0; }
                        .header img { max-width: 180px; margin-bottom: 15px; }
                        .content { padding: 30px; text-align: center; }
                        .content p { font-size: 18px; line-height: 1.6; margin-bottom: 15px; }
                        .content strong { font-weight: bold; }
                        .footer { text-align: center; font-size: 14px; color: #777; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://res.cloudinary.com/ddqygrb0g/image/upload/v1741250188/logo1.45a74222c73409492a75_bywgak.jpg" alt="Company Logo">
                            <h2 style="font-size: 24px;">Thông báo khóa tài khoản</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Tài khoản của bạn đã bị khóa đến <strong>%s</strong>.</p>
                            <p>Lí do: <strong>%s</strong></p>
                            <p>Nếu có bất kì thắc mắc hay khiếu nại nào, hãy gửi mail lại chúng tôi.</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 Job Portal. Mọi quyền được bảo lưu.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(companyName, blockedUntil, blockedReason);

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(content, true);

        javaMailSender.send(message);
    }
	
	public void sendUnBlockAccountEmail(String toEmail, String companyName)
            throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String subject = "Thông báo mở khóa tài khoản";
        String content = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Thông báo mở khóa tài khoản</title>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 20px; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1); border: 1px solid #ddd; } /* Added border */
                        .header { text-align: center; background-color: #007bff; color: #ffffff; padding: 20px; border-radius: 12px 12px 0 0; }
                        .header img { max-width: 180px; margin-bottom: 15px; }
                        .content { padding: 30px; text-align: center; }
                        .content p { font-size: 18px; line-height: 1.6; margin-bottom: 15px; }
                        .content strong { font-weight: bold; }
                        .footer { text-align: center; font-size: 14px; color: #777; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://res.cloudinary.com/ddqygrb0g/image/upload/v1741250188/logo1.45a74222c73409492a75_bywgak.jpg" alt="Company Logo">
                            <h2 style="font-size: 24px;">Thông báo mở tài khoản</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Sau khi xem xét, chúng tôi đã quyết định mở lại tài khoản cho công ty bạn.</p>
                            <p>Cảm ơn công ty và hi vọng chúng ta sẽ tiếp tục đồng hành</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 Job Portal. Mọi quyền được bảo lưu.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(companyName);

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(content, true);

        javaMailSender.send(message);
    }
	
	public void sendJobNotifications(Subscription subscription, List<JobPost> jobPost) {
	    logger.info("Bắt đầu tạo và gửi email thông báo cho: {}", subscription.getEmail());
	    try {
	        // Tạo thông tin về email để ghi log
	        StringBuilder emailInfo = new StringBuilder();
	        emailInfo.append("Thông tin email: ")
	                .append("Người nhận: ").append(subscription.getEmail())
	                .append(", Số lượng công việc: ").append(jobPost.size());
	        logger.info(emailInfo.toString());
	        
	        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

	        logger.info("Thiết lập thông tin email cho: {}", subscription.getEmail());
	        helper.setTo(subscription.getEmail());
	        helper.setSubject("Thông báo " + jobPost.size() + " công việc mới phù hợp với bạn!");
	        
	        // Xây dựng nội dung HTML với thiết kế cải tiến
	        StringBuilder htmlContent = new StringBuilder();
	        htmlContent.append("<!DOCTYPE html>");
	        htmlContent.append("<html><head>");
	        htmlContent.append("<meta charset='UTF-8'>");
	        htmlContent.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
	        htmlContent.append("<style>");
	        htmlContent.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }");
	        htmlContent.append(".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }");
	        htmlContent.append(".header { text-align: center; margin-bottom: 20px; }");
	        htmlContent.append(".greeting { font-size: 22px; font-weight: bold; color: #333; }");
	        htmlContent.append(".greeting span { color: #2e7d32; }");
	        htmlContent.append(".job-card { border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 15px; background-color: #fff; transition: transform 0.2s; cursor: pointer; text-decoration: none; color: inherit; display: block; }");
	        htmlContent.append(".job-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }");
	        htmlContent.append(".job-content { display: flex; align-items: flex-start; }");
	        htmlContent.append(".logo-container { width: 70px; min-width: 70px; height: 70px; margin-right: 15px; border-radius: 8px; overflow: hidden; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; }");
	        htmlContent.append(".job-details { flex: 1; }");
	        htmlContent.append(".job-title { margin: 0 0 10px 0; font-size: 18px; color: #0073e6; }");
	        htmlContent.append(".company-name { margin: 0 0 10px 0; font-weight: bold; }");
	        htmlContent.append(".salary { margin: 0 0 10px 0; color: #2e7d32; font-weight: bold; }");
	        htmlContent.append(".location { margin: 0; color: #757575; font-size: 14px; }");
	        htmlContent.append(".footer { margin-top: 30px; text-align: center; color: #757575; font-size: 14px; }");
	        htmlContent.append("</style>");
	        htmlContent.append("</head><body>");
	        htmlContent.append("<div class='container'>");
	        htmlContent.append("<div class='header'>");
	        htmlContent.append("<h2 class='greeting'>Xin chào <span>");
	        htmlContent.append(subscription.getSeeker() != null && subscription.getSeeker().getUserAccount() != null
	                ? subscription.getSeeker().getUserAccount().getUserName() : "Người dùng");
	        htmlContent.append(",</span></h2>");
	        htmlContent.append("<p>Chúng tôi đã tìm được những công việc phù hợp nhất với hồ sơ và kinh nghiệm của bạn. Mời bạn khám phá và ứng tuyển vào cơ hội việc làm ưng ý!</p>");
	        htmlContent.append("</div>");

	        logger.info("Bắt đầu thêm {} công việc vào nội dung email", jobPost.size());
	        for (JobPost job : jobPost) {
	            String jobUrl = "http://localhost:3000/jobs/job-detail/" + job.getPostId();
	            
	            htmlContent.append("<a href='").append(jobUrl).append("' class='job-card'>");
	            htmlContent.append("<div class='job-content'>");

	            // Logo công ty
	            htmlContent.append("<div class='logo-container'>");
	            if (job.getCompany() != null && job.getCompany().getLogo() != null && !job.getCompany().getLogo().isEmpty()) {
	                logger.debug("Thêm logo công ty: {}", job.getCompany().getLogo());
	                htmlContent.append("<img src='").append(job.getCompany().getLogo()).append("' alt='Logo' style='max-width: 100%; max-height: 100%; object-fit: contain;'>");
	            } else {
	                logger.debug("Không có logo công ty cho công việc ID: {}", job.getPostId());
	                // Thêm chữ cái đầu của tên công ty làm avatar
	                String companyName = job.getCompany() != null ? job.getCompany().getCompanyName() : "C";
	                String firstLetter = companyName.substring(0, 1).toUpperCase();
	                htmlContent.append("<div style='width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #0073e6; color: white; font-size: 24px; font-weight: bold;'>").append(firstLetter).append("</div>");
	            }
	            htmlContent.append("</div>");

	            htmlContent.append("<div class='job-details'>");
	            htmlContent.append("<h3 class='job-title'>").append(job.getTitle()).append("</h3>");
	            htmlContent.append("<p class='company-name'>").append(job.getCompany() != null ? job.getCompany().getCompanyName() : "Unknown Company").append("</p>");

	            // Mức lương
	            if (job.getSalary() != null) {
	                htmlContent.append("<p class='salary'>Lương: ").append(job.getSalary()).append("</p>");
	            } else {
	                htmlContent.append("<p class='salary'>Lương: Thoả thuận</p>");
	            }

	            htmlContent.append("<p class='location'>").append(job.getLocation()).append(" ngày để ứng tuyển</p>");
	            htmlContent.append("</div>");
	            htmlContent.append("</div>");
	            htmlContent.append("</a>");
	        }

	        htmlContent.append("<div class='footer'>");
	        htmlContent.append("<p>Truy cập <a href='http://localhost:3000'>trang web của chúng tôi</a> để biết thêm chi tiết.</p>");
	        htmlContent.append("<p>Trân trọng,<br>Đội ngũ Thông báo Công việc</p>");
	        htmlContent.append("</div>");
	        htmlContent.append("</div>");
	        htmlContent.append("</body></html>");
	        
	        logger.info("Đã tạo xong nội dung HTML cho email");
	        helper.setText(htmlContent.toString(), true);
	        
	        logger.info("Bắt đầu gửi email đến: {}", subscription.getEmail());
	        
	        // Thêm thông tin về cấu hình SMTP để gỡ lỗi
	        try {
	            JavaMailSenderImpl mailSender = (JavaMailSenderImpl) javaMailSender;
	            logger.info("Cấu hình SMTP: Server={}, Port={}, Username={}", 
	                    mailSender.getHost(), mailSender.getPort(), mailSender.getUsername());
	        } catch (Exception e) {
	            logger.warn("Không thể lấy thông tin cấu hình SMTP: {}", e.getMessage());
	        }
	        
	        javaMailSender.send(mimeMessage);
	        logger.info("Email đã được gửi thành công đến: {}", subscription.getEmail());
	    } catch (MessagingException e) {
	        logger.error("Lỗi khi gửi email đến {}: {}", subscription.getEmail(), e.getMessage());
	        logger.error("Chi tiết lỗi MessagingException:", e);
	        throw new RuntimeException("Không thể gửi email thông báo công việc", e);
	    } catch (Exception e) {
	        logger.error("Lỗi không xác định khi gửi email đến {}: {}", subscription.getEmail(), e.getMessage());
	        logger.error("Chi tiết lỗi:", e);
	        throw new RuntimeException("Lỗi không xác định khi gửi email", e);
	    }
	}
	
	public void testEmail(String email) {
	    SimpleMailMessage message = new SimpleMailMessage();
	    message.setTo(email);
	    message.setSubject("Test Email");
	    message.setText("This is a test email from Job Portal.");
	    javaMailSender.send(message);
	    System.out.println("Test email sent to: " + email);
	}
}