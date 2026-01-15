import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class ResendMailService {
    private resend: Resend;
    private templatePath: string;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.templatePath = path.join(__dirname, 'templates');
    }

    private async renderTemplate(templateName: string, data: any): Promise<string> {
        try {
            const filePath = path.join(this.templatePath, `${templateName}.ejs`);
            return await ejs.renderFile(filePath, data);
        } catch (error) {
            console.error(`[ResendMailService] Error rendering template ${templateName}:`, error);
            // Fallback to minimal layout or throw
            throw error;
        }
    }


    async sendWelcomeEmail(user: any, locale: string = 'vi') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontendUrl}/${locale}/auth/login`;
        const subject = locale === 'vi' ? 'Chào mừng bạn đến với NHers Academy! 🎓' : 'Welcome to NHers Academy! 🎓';
        const title = locale === 'vi' ? 'Chào mừng thành viên mới' : 'Welcome new member';

        const content = `
            <p style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">
                ${locale === 'vi' ? `Chào mừng ${user.hoTen || user.taiKhoan}!` : `Welcome ${user.hoTen || user.taiKhoan}!`}
            </p>
            <p style="margin-bottom: 20px;">
                ${locale === 'vi'
                ? 'Tài khoản của bạn đã được kích hoạt thành công. Chúng tôi rất hào hứng được đồng hành cùng bạn trong hành trình học tập tại NHers Academy.'
                : 'Your account has been successfully activated. We are excited to have you join our learning community at NHers Academy.'}
            </p>
            <p style="background-color: #f0f7ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px; font-size: 14px; color: #1e40af;">
                ${locale === 'vi'
                ? 'Bạn có thể bắt đầu khám phá hệ thống, xem thời khóa biểu và các thông báo mới nhất ngay bây giờ.'
                : 'You can start exploring the system, check your schedule, and see the latest announcements right now.'}
            </p>
        `;

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        console.log(`[ResendMailService] Attempting to send Welcome Email to: ${user.email} from: ${fromEmail}`);

        if (fromEmail === 'onboarding@resend.dev' && user.email !== 'vanduyho919@gmail.com') {
            console.warn(`[ResendMailService] WARNING: Using 'onboarding@resend.dev'. Emails can ONLY be sent to the owner's email address (vanduyho919@gmail.com) in this mode.`);
        }

        try {
            const html = await this.renderTemplate('welcome', {
                name: user.hoTen || user.taiKhoan,
                url: url,
                locale
            });

            const { data: resData, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${fromEmail}>`,
                to: [user.email || user.taiKhoan],
                subject,
                html,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send welcome email to ${user.email}:`, JSON.stringify(error, null, 2));
            } else {
                console.log(`[ResendMailService] Successfully sent welcome email to ${user.email}`, resData);
            }
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send welcome email (CRITICAL):`, error);
        }
    }

    async sendVerificationEmail(user: any, code: string, locale: string = 'vi') {
        const subject = locale === 'vi' ? 'Mã xác thực tài khoản NHers Academy 🔐' : 'Verification Code - NHers Academy 🔐';
        const title = locale === 'vi' ? 'Xác thực bảo mật' : 'Security Verification';

        const content = `
            <p style="margin-bottom: 20px;">
                ${locale === 'vi'
                ? `Xin chào <strong>${user.hoTen || user.taiKhoan}</strong>, vui lòng sử dụng mã dưới đây để hoàn tất quá trình xác thực tài khoản của bạn:`
                : `Hello <strong>${user.hoTen || user.taiKhoan}</strong>, please use the code below to complete your account verification:`}
            </p>
            <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;">
                <span style="color: #4f46e5; font-size: 38px; font-weight: 800; letter-spacing: 12px; margin: 0; font-family: monospace;">${code}</span>
            </div>
            <p style="text-align: center; color: #ef4444; font-size: 14px; font-weight: 600;">
                ${locale === 'vi' ? 'Mã này sẽ hết hạn sau 10 phút.' : 'This code will expire in 10 minutes.'}
            </p>
            <p style="margin-top: 25px; font-size: 14px; color: #6b7280; font-style: italic;">
                ${locale === 'vi'
                ? 'Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ BP Hỗ trợ.'
                : 'If you did not request this, please ignore this email or contact Support.'}
            </p>
        `;

        try {
            const html = await this.renderTemplate('verification', {
                name: user.hoTen || user.taiKhoan,
                code,
                locale
            });

            const { data: resData, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [user.email],
                subject,
                html,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send verification email to ${user.email}:`, error);
            } else {
                console.log(`[ResendMailService] Successfully sent verification email to ${user.email}`, resData);
            }
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send verification email (CRITICAL):`, error);
        }
    }

    async sendResetPasswordEmail(user: any, token: string, locale: string = 'vi') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontendUrl}/${locale}/auth/reset-password?token=${token}`;
        const subject = locale === 'vi' ? 'Yêu cầu khôi phục mật khẩu NHers Academy 🔑' : 'Reset Password Request - NHers Academy 🔑';
        const title = locale === 'vi' ? 'Khôi phục mật khẩu' : 'Password Recovery';

        const content = `
            <p style="margin-bottom: 20px;">
                ${locale === 'vi'
                ? `Xin chào <strong>${user.hoTen || user.taiKhoan}</strong>, chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để tiếp tục:`
                : `Hello <strong>${user.hoTen || user.taiKhoan}</strong>, we received a request to reset your password. Please click the button below to continue:`}
            </p>
            <p style="margin-top: 25px; font-size: 14px; color: #6b7280;">
                ${locale === 'vi'
                ? 'Lưu ý: Liên kết này sẽ có hiệu lực trong vòng 60 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này, tài khoản của bạn vẫn được bảo mật.'
                : 'Note: This link will expire in 60 minutes. If you did not request a password reset, please ignore this email; your account remains secure.'}
            </p>
        `;

        try {
            const html = await this.renderTemplate('reset-password', {
                name: user.hoTen || user.taiKhoan,
                url: url,
                locale
            });

            const { data: resData, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [user.email],
                subject,
                html,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send reset email to ${user.email}:`, error);
            } else {
                console.log(`[ResendMailService] Successfully sent reset email to ${user.email}`, resData);
            }
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send reset email (CRITICAL):`, error);
        }
    }

    async sendApprovalNotification(to: string, data: { title: string, status: string, approverName?: string, link: string }, locale: string = 'vi') {
        const subject = locale === 'vi' ? `Cập nhật phê duyệt: ${data.title} 📝` : `Approval Update: ${data.title} 📝`;
        const title = locale === 'vi' ? 'Trạng thái Phê duyệt' : 'Approval Status';

        const content = `
            <p>Thông báo về yêu cầu của bạn:</p>
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                <p style="margin: 5px 0;"><strong>Yêu cầu:</strong> ${data.title}</p>
                <p style="margin: 5px 0;"><strong>Trạng thái:</strong> <span style="color: #4f46e5; font-weight: 700;">${data.status}</span></p>
                <p style="margin: 5px 0;"><strong>Người xử lý:</strong> ${data.approverName || 'Hệ thống'}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Vui lòng nhấn vào nút bên dưới để xem chi tiết nội dung phản hồi.</p>
        `;

        try {
            const html = await this.renderTemplate('approval-status', {
                title: data.title,
                status: data.status,
                approverName: data.approverName || 'Hệ thống',
                url: data.link,
                locale
            });

            const { data: resData, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [to],
                subject,
                html,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send approval status email to ${to}:`, error);
            } else {
                console.log(`[ResendMailService] Successfully sent approval status email to ${to}`, resData);
            }
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send approval status email (CRITICAL):`, error);
        }
    }

    async sendGradeNotification(submission: any, grade: any) {
        const subject = 'Kết quả điểm số bài kiểm tra - NHers Academy 📔';
        const title = 'Kết quả Học tập';

        const content = `
            <p>Xin chào <strong>${submission.hocSinh.hoTen || submission.hocSinh.taiKhoan}</strong>,</p>
            <p>Giáo viên đã hoàn tất chấm điểm cho bài kiểm tra của bạn:</p>
            
            <div style="background-color: #f0fdf4; border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid #bbf7d0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #166534; text-transform: uppercase;">Điểm số của bạn</p>
                <h1 style="margin: 10px 0; font-size: 48px; color: #15803d;">${grade.diemSo}</h1>
                <p style="margin: 0; font-weight: 600; color: #166534;">${submission.deKiemTra.tieuDe}</p>
            </div>

            <p><strong>Nhận xét từ giáo viên:</strong></p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; font-style: italic; color: #374151;">
                ${grade.ghiChu || 'Không có nhận xét thêm.'}
            </div>
        `;

        try {
            const html = await this.renderTemplate('grading', {
                studentName: submission.hocSinh.hoTen || submission.hocSinh.taiKhoan,
                examTitle: submission.deKiemTra.tieuDe,
                grade: grade.diemSo,
                comment: grade.ghiChu || 'Không có nhận xét thêm.'
            });

            const { data: resData, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [submission.hocSinh.email || submission.hocSinh.taiKhoan],
                subject,
                html,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send grade notification to ${submission.hocSinh.email}:`, error);
            } else {
                console.log(`[ResendMailService] Successfully sent grade notification to ${submission.hocSinh.email}`, resData);
            }
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send grade notification (CRITICAL):`, error);
        }
    }

    async sendAccountDetailsEmail(user: any, details: {
        password?: string,
        role: string,
        maSo: string,
        schoolName?: string,
        className?: string,
        teacherName?: string
    }, locale: string = 'vi') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const loginUrl = `${frontendUrl}/${locale}/auth/login`;
        const subject = locale === 'vi' ? 'Thông tin tài khoản NHers Academy 🎓' : 'NHers Academy Account Details 🎓';
        const title = locale === 'vi' ? 'Thông báo Hồ sơ' : 'Profile Notification';

        const roleName = details.role === 'HOC_SINH' ? 'Học sinh' : details.role === 'GIAO_VIEN' ? 'Giáo viên' : 'Nhân viên';

        const content = `
            <p style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">
                ${locale === 'vi' ? `Chào ${user.hoTen}!` : `Hello ${user.hoTen}!`}
            </p>
            <p>
                ${locale === 'vi'
                ? `Thông tin hồ sơ <strong>${roleName}</strong> của bạn đã được cập nhật tại <strong>${details.schoolName || 'NHers Academy'}</strong>.`
                : `Your <strong>${roleName}</strong> profile has been updated at <strong>${details.schoolName || 'NHers Academy'}</strong>.`}
            </p>
            
            <div style="background-color: #f8fafc; border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; font-size: 14px; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                    Chi tiết tài khoản
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Tài khoản (Email)</td>
                        <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${user.email}</td>
                    </tr>
                    ${details.password ? `
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Mật khẩu tạm thời</td>
                        <td style="padding: 8px 0;"><code style="background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 6px; font-weight: 700;">${details.password}</code></td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Mã định danh</td>
                        <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${details.maSo}</td>
                    </tr>
                    ${details.className ? `
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Lớp học</td>
                        <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${details.className}</td>
                    </tr>
                    ` : ''}
                    ${details.teacherName ? `
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Giáo viên chủ nhiệm</td>
                        <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${details.teacherName}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            <p style="font-size: 14px; color: #6b7280; font-style: italic;">
                ${locale === 'vi'
                ? 'Vui lòng đăng nhập và đổi mật khẩu ngay trong lần sử dụng đầu tiên để bảo mật thông tin.'
                : 'Please login and change your password during your first use for security purposes.'}
            </p>
        `;

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        console.log(`[ResendMailService] Attempting to send Account Details to: ${user.email} from: ${fromEmail}`);

        try {
            const html = await this.renderTemplate('account-details', {
                name: user.hoTen,
                roleName,
                schoolName: details.schoolName || 'NHers Academy',
                email: user.email,
                password: details.password,
                maSo: details.maSo,
                className: details.className,
                teacherName: details.teacherName,
                url: loginUrl,
                locale
            });

            const { data: resData, error } = await this.resend.emails.send({
                from: `${process.env.MAIL_FROM_NAME || 'NHers Academy'} <${fromEmail}>`,
                to: [user.email],
                subject,
                html,
            });

            if (error) {
                console.error(`[ResendMailService] FAILED to send account details email to ${user.email}:`, JSON.stringify(error, null, 2));
            } else {
                console.log(`[ResendMailService] Successfully sent account details email to ${user.email}`, resData);
            }
        } catch (error) {
            console.error(`[ResendMailService] FAILED to send account details email (CRITICAL):`, error);
        }
    }
}
