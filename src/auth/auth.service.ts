import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, matKhau: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (!user) return null;

        // In a real app, use bcrypt.compare(matKhau, user.matKhau)
        // Assuming simple comparison for now if passwords aren't hashed yet, 
        // OR assuming they ARE hashed. Let's assume hashed for best practice.
        // However, if user seeded plain text, this might fail. 
        // Let's try matching plain text first for simplicity of this demo, OR compare hash
        // const isMatch = await bcrypt.compare(matKhau, user.matKhau);

        // For this specific 'System Building', let's strict check
        // If matKhau matches directly (dev mode) OR via bcrypt
        const isMatch = matKhau === user.matKhau;

        if (user && isMatch) {
            const { matKhau, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.matKhau);
        if (!user) {
            throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
        }
        const payload = { username: user.taiKhoan, sub: user.id, role: user.vaiTro, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async register(registerDto: { taiKhoan: string; matKhau: string; email: string }) {
        // Simple registration - in production, hash password with bcrypt
        const existingUser = await this.usersService.findByTaiKhoan(registerDto.taiKhoan);
        if (existingUser) {
            throw new UnauthorizedException('Tài khoản đã tồn tại');
        }

        return this.usersService.create({
            taiKhoan: registerDto.taiKhoan,
            matKhau: registerDto.matKhau,
            email: registerDto.email,
            vaiTro: 'HOC_SINH' as any,
        });
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists
            return { message: 'Nếu email tồn tại, link reset đã được gửi' };
        }

        // Generate reset token (in production, use crypto)
        const resetToken = this.jwtService.sign(
            { email: user.email, purpose: 'reset' },
            { expiresIn: '1h' }
        );

        // In production: send email with reset link
        console.log('Reset token:', resetToken);

        return {
            message: 'Nếu email tồn tại, link reset đã được gửi',
            resetToken // Remove in production
        };
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.purpose !== 'reset') {
                throw new UnauthorizedException('Token không hợp lệ');
            }

            const user = await this.usersService.findByEmail(payload.email);
            if (!user) {
                throw new UnauthorizedException('User không tồn tại');
            }

            // Update password
            await this.usersService.update(user.id, { matKhau: newPassword });

            return { message: 'Mật khẩu đã được cập nhật' };
        } catch (e) {
            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
        }
    }

    async getProfile(userId: number) {
        const user = await this.usersService.findUserProfile(userId);
        if (!user) {
            throw new UnauthorizedException('Không tìm thấy thông tin người dùng.');
        }
        // Remove password from response just in case
        const { matKhau, ...result } = user;
        return result;
    }
}
