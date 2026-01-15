import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendMailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendWelcomeEmail(user: any, locale: string = 'vi') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontendUrl}/${locale}/auth/login`;
        const subject = locale === 'vi' ? 'Chào mừng bạn đến với Hệ thống Trường học! 🎓' : 'Welcome to School System! 🎓';

        console.log(`[ResendMailService] Sending welcome email to: ${user.email} (locale: ${locale})`);
        try {
            const { data, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [user.email || user.taiKhoan],
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4f46e5;">Chào mừng ${user.hoTen || user.taiKhoan}!</h2>
                        <p>Tài khoản của bạn đã được kích hoạt thành công.</p>
                        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                            Đăng nhập ngay
                        </a>
                    </div>
                `,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send welcome email:`, error);
                throw error;
            }

            console.log(`[ResendMailService] Successfully sent welcome email to ${user.email}`, data);
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send welcome email to ${user.email}:`, error);
            throw error;
        }
    }

    async sendVerificationEmail(user: any, code: string, locale: string = 'vi') {
        const subject = locale === 'vi' ? 'Xác thực tài khoản - Hệ thống Trường học 🔐' : 'Account Verification - School System 🔐';
        console.log(`[ResendMailService] Sending verification email to: ${user.email} (locale: ${locale})`);

        try {
            const { data, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [user.email],
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #4f46e5;">Xác thực tài khoản</h2>
                        <p>Xin chào ${user.hoTen || user.taiKhoan},</p>
                        <p>Mã xác thực của bạn là:</p>
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">Mã này sẽ hết hạn sau 10 phút.</p>
                    </div>
                `,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send verification email:`, error);
                throw error;
            }

            console.log(`[ResendMailService] Successfully sent verification email to ${user.email}`, data);
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send verification email to ${user.email}:`, error);
            throw error;
        }
    }

    async sendResetPasswordEmail(user: any, token: string, locale: string = 'vi') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontendUrl}/${locale}/auth/reset-password?token=${token}`;
        const subject = locale === 'vi' ? 'Khôi phục mật khẩu - Hệ thống Trường học 🔑' : 'Reset Password - School System 🔑';

        console.log(`[ResendMailService] Sending reset password email to: ${user.email} (locale: ${locale})`);
        try {
            const { data, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [user.email],
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #4f46e5;">Khôi phục mật khẩu</h2>
                        <p>Xin chào ${user.hoTen || user.taiKhoan},</p>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>
                        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                            Đặt lại mật khẩu
                        </a>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    </div>
                `,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send reset email:`, error);
                throw error;
            }

            console.log(`[ResendMailService] Successfully sent reset email to ${user.email}`, data);
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send reset email to ${user.email}:`, error);
            throw error;
        }
    }

    async sendApprovalNotification(to: string, data: { title: string, status: string, approverName?: string, link: string }, locale: string = 'vi') {
        const subjectVi = `Cập nhật trạng thái phê duyệt: ${data.title} 📝`;
        const subjectEn = `Approval Status Update: ${data.title} 📝`;
        const subject = locale === 'vi' ? subjectVi : subjectEn;

        console.log(`[ResendMailService] Sending approval status email to: ${to} for: ${data.title} (locale: ${locale})`);
        try {
            const { data: result, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [to],
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #4f46e5;">Cập nhật phê duyệt</h2>
                        <p><strong>Yêu cầu:</strong> ${data.title}</p>
                        <p><strong>Trạng thái:</strong> ${data.status}</p>
                        <p><strong>Người phê duyệt:</strong> ${data.approverName || 'Hệ thống'}</p>
                        <a href="${data.link}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                            Xem chi tiết
                        </a>
                    </div>
                `,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send email:`, error);
                throw error;
            }

            console.log(`[ResendMailService] Successfully sent email to ${to}`, result);
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send email to ${to}:`, error);
            throw error;
        }
    }

    async sendGradeNotification(submission: any, grade: any) {
        console.log(`[ResendMailService] Sending grade notification to: ${submission.hocSinh.email}`);
        try {
            const { data, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [submission.hocSinh.email || submission.hocSinh.taiKhoan],
                subject: 'Thông báo kết quả điểm số bài kiểm tra 📔',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #4f46e5;">Kết quả bài kiểm tra</h2>
                        <p>Xin chào ${submission.hocSinh.hoTen || submission.hocSinh.taiKhoan},</p>
                        <p><strong>Bài kiểm tra:</strong> ${submission.deKiemTra.tieuDe}</p>
                        <p><strong>Điểm số:</strong> ${grade.diemSo}</p>
                        <p><strong>Nhận xét:</strong> ${grade.ghiChu || 'Không có'}</p>
                    </div>
                `,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send grade notification:`, error);
                throw error;
            }

            console.log(`[ResendMailService] Successfully sent grade notification to ${submission.hocSinh.email}`, data);
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send grade notification to ${submission.hocSinh.email}:`, error);
            throw error;
        }
    }
}
