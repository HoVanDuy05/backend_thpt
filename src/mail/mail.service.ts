import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendWelcomeEmail(user: any) {
        const url = `http://localhost:3000/auth/login`;

        await this.mailerService.sendMail({
            to: user.email || user.taiKhoan, // Using taiKhoan if email is not provided in schema, but usually it should be an email
            // from: '"Support Team" <support@school.com>', // override default from
            subject: 'Chào mừng bạn đến với Hệ thống Trường học! 🎓',
            template: './welcome', // `.ejs` extension is appended automatically
            context: {
                name: user.hoTen || user.taiKhoan,
                url,
            },
        });
    }

    async sendResetPasswordEmail(user: any, token: string) {
        const url = `http://localhost:3000/auth/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Khôi phục mật khẩu - Hệ thống Trường học 🔑',
            template: './reset-password',
            context: {
                name: user.hoTen || user.taiKhoan,
                url,
            },
        });
    }

    async sendGradeNotification(submission: any, grade: any) {
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
    }

    async sendApprovalNotification(to: string, data: { title: string, status: string, approverName?: string, link: string }) {
        await this.mailerService.sendMail({
            to,
            subject: `Cập nhật trạng thái phê duyệt: ${data.title} 📝`,
            template: './approval-status', // We need to create this template or use a generic one
            context: {
                title: data.title,
                status: data.status,
                approverName: data.approverName || 'Hệ thống',
                link: data.link,
            },
        });
    }
}
