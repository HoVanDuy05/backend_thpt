import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomeEmail(user: any, locale: string = 'vi') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/${locale}/auth/login`;
    const subject =
      locale === 'vi'
        ? 'Chào mừng bạn đến với Hệ thống Trường học! 🎓'
        : 'Welcome to School System! 🎓';

    console.log(
      `[MailService] Sending welcome email to: ${user.email} (locale: ${locale})`,
    );
    try {
      await this.mailerService.sendMail({
        to: user.email || user.taiKhoan,
        subject,
        template: './welcome',
        context: {
          name: user.hoTen || user.taiKhoan,
          url,
        },
      });
      console.log(
        `[MailService] Successfully sent welcome email to ${user.email}`,
      );
    } catch (error) {
      console.error(
        `[MailService] FAILED to send welcome email to ${user.email}:`,
        error,
      );
      throw error;
    }
  }

  async sendResetPasswordEmail(
    user: any,
    token: string,
    locale: string = 'vi',
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/${locale}/auth/reset-password?token=${token}`;
    const subject =
      locale === 'vi'
        ? 'Khôi phục mật khẩu - Hệ thống Trường học 🔑'
        : 'Reset Password - School System 🔑';

    console.log(
      `[MailService] Sending reset password email to: ${user.email} (locale: ${locale})`,
    );
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject,
        template: './reset-password',
        context: {
          name: user.hoTen || user.taiKhoan,
          url,
        },
      });
      console.log(
        `[MailService] Successfully sent reset email to ${user.email}`,
      );
    } catch (error) {
      console.error(
        `[MailService] FAILED to send reset email to ${user.email}:`,
        error,
      );
      throw error;
    }
  }

  async sendGradeNotification(submission: any, grade: any) {
    console.log(
      `[MailService] Sending grade notification to: ${submission.hocSinh.email}`,
    );
    try {
      await this.mailerService.sendMail({
        to: submission.hocSinh.email || submission.hocSinh.taiKhoan,
        subject: 'Thông báo kết quả điểm số bài kiểm tra 📔',
        template: './grading',
        context: {
          studentName: submission.hocSinh.hoTen || submission.hocSinh.taiKhoan,
          examTitle: submission.deKiemTra.tieuDe,
          grade: grade.diemSo,
          comment: grade.ghiChu,
        },
      });
      console.log(
        `[MailService] Successfully sent grade notification to ${submission.hocSinh.email}`,
      );
    } catch (error) {
      console.error(
        `[MailService] FAILED to send grade notification to ${submission.hocSinh.email}:`,
        error,
      );
      throw error;
    }
  }

  async sendApprovalNotification(
    to: string,
    data: {
      title: string;
      status: string;
      approverName?: string;
      link: string;
    },
    locale: string = 'vi',
  ) {
    const subjectVi = `Cập nhật trạng thái phê duyệt: ${data.title} 📝`;
    const subjectEn = `Approval Status Update: ${data.title} 📝`;
    const subject = locale === 'vi' ? subjectVi : subjectEn;

    console.log(
      `[MailService] Sending approval status email to: ${to} for: ${data.title} (locale: ${locale})`,
    );
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: './approval-status',
        context: {
          title: data.title || 'Hồ sơ',
          status: data.status,
          approverName: data.approverName || 'Hệ thống',
          url: data.link,
        },
      });
      console.log(`[MailService] Successfully sent email to ${to}`);
    } catch (error) {
      console.error(`[MailService] FAILED to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(user: any, code: string, locale: string = 'vi') {
    const subject =
      locale === 'vi'
        ? 'Xác thực tài khoản - Hệ thống Trường học 🔐'
        : 'Account Verification - School System 🔐';
    console.log(
      `[MailService] Sending verification email to: ${user.email} (locale: ${locale})`,
    );
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject,
        template: './verification',
        context: {
          name: user.hoTen || user.taiKhoan,
          code,
        },
      });
      console.log(
        `[MailService] Successfully sent verification email to ${user.email}`,
      );
    } catch (error) {
      console.error(
        `[MailService] FAILED to send verification email to ${user.email}:`,
        error,
      );
      throw error;
    }
  }

  async sendAccountDetailsEmail(
    user: any,
    details: {
      password?: string;
      role: string;
      maSo: string;
      schoolName?: string;
      className?: string;
      teacherName?: string;
    },
    locale: string = 'vi',
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/${locale}/auth/login`;
    const subject =
      locale === 'vi'
        ? 'Thông tin tài khoản NHers Academy 🎓'
        : 'NHers Academy Account Details 🎓';

    const roleName =
      details.role === 'HOC_SINH'
        ? 'Học sinh'
        : details.role === 'GIAO_VIEN'
          ? 'Giáo viên'
          : 'Nhân viên';

    console.log(`[MailService] Sending Account Details to: ${user.email}`);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject,
        template: './account-details',
        context: {
          name: user.hoTen,
          roleName,
          schoolName: details.schoolName || 'NHers Academy',
          email: user.email,
          password: details.password,
          maSo: details.maSo,
          className: details.className,
          teacherName: details.teacherName,
          url: loginUrl,
          locale,
        },
      });
      console.log(
        `[MailService] Successfully sent account details email to ${user.email}`,
      );
    } catch (error) {
      console.error(
        `[MailService] FAILED to send account details email to ${user.email}:`,
        error,
      );
      // Don't throw to prevent blocking user creation? Better to log.
    }
  }
}
