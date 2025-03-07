package com.job_portal.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Component
public class EmailUtil {
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
}