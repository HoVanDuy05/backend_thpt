import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, matKhau: string): Promise<any> {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { email },
      select: {
        id: true,
        taiKhoan: true,
        email: true,
        matKhau: true, // Include matKhau ONLY for validation
        kichHoat: true,
        vaiTro: true,
        hoTen: true,
        maSo: true,
        avatar: true,
        ngayTao: true,
        hoSoHocSinh: {
          include: {
            cacLopNam: {
              include: {
                lopNam: {
                  include: {
                    lopHoc: {
                      include: {
                        khoi: true,
                      },
                    },
                    namHoc: true,
                    gvChuNhiem: {
                      include: {
                        nguoiDung: {
                          select: {
                            id: true,
                            taiKhoan: true,
                            email: true,
                            vaiTro: true,
                            hoTen: true,
                            maSo: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: {
                lopNam: {
                  namHoc: {
                    ngayBatDau: 'desc',
                  },
                },
              },
            },
          },
        },
        hoSoGiaoVien: {
          include: {
            lopChuNhiem: true,
            lopNams: {
              include: {
                lopHoc: true,
                namHoc: true,
              },
            },
          },
        },
        hoSoNhanVien: true,
      },
    });

    if (!user || !user.matKhau) {
      return null;
    }

    const isMatch =
      user.matKhau && (await bcrypt.compare(matKhau, user.matKhau));
    // Fallback for plain text if needed during development transition
    const isPlainMatch = matKhau === user.matKhau;

    if (isMatch || isPlainMatch) {
      const { matKhau, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, req?: Request) {
    const user = await this.validateUser(loginDto.email, loginDto.matKhau);

    if (!user) {
      throw new UnauthorizedException('validation.invalid_credentials');
    }

    // Check activation
    if (!user.kichHoat) {
      throw new UnauthorizedException('validation.account_not_activated');
    }

    // Record login history
    if (req) {
      await this.prisma.lichSuDangNhap.create({
        data: {
          userId: user.id,
          ipAddress: req.ip,
          thietBi: req.headers['user-agent'] || 'Unknown',
          trangThai: true,
        },
      });
    }

    const payload = {
      username: user.taiKhoan,
      sub: user.id,
      role: user.vaiTro,
      email: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(
    registerDto: {
      email: string;
      matKhau: string;
      hoTen: string;
      soDienThoai: string;
    },
    locale: string = 'vi',
  ) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('validation.email_in_use');
    }

    // Generate taiKhoan from email
    const taiKhoan =
      registerDto.email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

    // Generate verification code
    const maXacThuc = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await this.prisma.nguoiDung.create({
      data: {
        taiKhoan,
        email: registerDto.email,
        matKhau: registerDto.matKhau,
        hoTen: registerDto.hoTen,
        soDienThoai: registerDto.soDienThoai,
        maXacThuc,
        kichHoat: false,
        vaiTro: 'HOC_SINH',
      },
    });

    // Send verification email
    this.mailService
      .sendVerificationEmail(user, maXacThuc, locale)
      .catch((err) => console.error('Verification email failed:', err));

    return user;
  }

  async verifyCode(email: string, code: string, locale: string = 'vi') {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('validation.user_not_found');
    }

    if (user.maXacThuc !== code) {
      throw new UnauthorizedException('validation.invalid_verification_code');
    }

    await this.prisma.nguoiDung.update({
      where: { id: user.id },
      data: {
        kichHoat: true,
        maXacThuc: null,
      },
    });

    // Send welcome email after successful activation
    this.mailService
      .sendWelcomeEmail(user, locale)
      .catch((err) => console.error('Welcome email failed:', err));

    return { message: 'validation.activation_success' };
  }

  async resendCode(email: string, locale: string = 'vi') {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('validation.user_not_found');
    }

    if (user.kichHoat) {
      throw new BadRequestException('validation.account_already_activated');
    }

    const maXacThuc = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.nguoiDung.update({
      where: { id: user.id },
      data: { maXacThuc },
    });

    this.mailService
      .sendVerificationEmail(user, maXacThuc, locale)
      .catch((err) => console.error('Verification email failed:', err));

    return { message: 'validation.code_resent' };
  }

  async forgotPassword(email: string, locale: string = 'vi') {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'Nếu email tồn tại, link reset đã được gửi' };
    }

    // Generate reset token (in production, use crypto)
    const resetToken = this.jwtService.sign(
      { email: user.email, purpose: 'reset' },
      { expiresIn: '1h' },
    );

    // In production: send email with reset link
    this.mailService
      .sendResetPasswordEmail(user, resetToken, locale)
      .catch((err) => console.error('Reset email failed:', err));

    return { message: 'Nếu email tồn tại, link reset đã được gửi' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.purpose !== 'reset') {
        throw new UnauthorizedException('validation.invalid_token');
      }

      const user = await this.usersService.findByEmail(decoded.email);
      if (!user) {
        throw new UnauthorizedException('validation.user_not_found');
      }

      // Update password (in production, hash it)
      await this.prisma.nguoiDung.update({
        where: { id: user.id },
        data: { matKhau: newPassword },
      });

      return { message: 'Mật khẩu đã được cập nhật' };
    } catch (error) {
      throw new UnauthorizedException('validation.token_expired');
    }
  }

  // Google OAuth methods
  async validateGoogleUser(googleProfile: any) {
    const { googleId, email, hoTen, anhDaiDien } = googleProfile;

    // Try to find user by googleId
    let user = await this.prisma.nguoiDung.findUnique({
      where: { googleId: googleId },
      include: {
        hoSoGiaoVien: true,
        hoSoHocSinh: true,
        hoSoNhanVien: true,
      },
    });

    // If not found, try by email
    if (!user && email) {
      user = await this.prisma.nguoiDung.findUnique({
        where: { email },
        include: {
          hoSoGiaoVien: true,
          hoSoHocSinh: true,
          hoSoNhanVien: true,
        },
      });

      // Link Google account to existing user
      if (user) {
        user = await this.prisma.nguoiDung.update({
          where: { id: user.id },
          data: { googleId },
          include: {
            hoSoGiaoVien: true,
            hoSoHocSinh: true,
            hoSoNhanVien: true,
          },
        });
      }
    }

    // Create new user if not found
    if (!user) {
      const taiKhoan = email.split('@')[0] + '_' + Date.now();
      user = await this.prisma.nguoiDung.create({
        data: {
          taiKhoan,
          email,
          googleId,
          vaiTro: 'HOC_SINH', // Default role
        },
        include: {
          hoSoGiaoVien: true,
          hoSoHocSinh: true,
          hoSoNhanVien: true,
        },
      });

      // Create student profile
      await this.prisma.hoSoHocSinh.create({
        data: {
          userId: user.id,
          maSoHs: `HS${Date.now()}`,
          hoTen: hoTen || email.split('@')[0],
        },
      });
    }

    return user;
  }

  async googleLogin(user: any, req?: Request) {
    // Record login history
    if (req) {
      await this.prisma.lichSuDangNhap.create({
        data: {
          userId: user.id,
          ipAddress: req.ip,
          thietBi: req.headers['user-agent'] || 'Unknown',
          trangThai: true,
        },
      });
    }

    const payload = {
      username: user.taiKhoan,
      sub: user.id,
      role: user.vaiTro,
      email: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findUserProfile(userId);
    if (!user) {
      throw new UnauthorizedException('validation.user_not_found');
    }
    // Password is already excluded from findUserProfile, return user directly
    return user;
  }

  async updateProfile(userId: number, dto: any) {
    // 1. Update basic User info (Name, Avatar) - Shared
    const dataNguoiDung: any = {};
    if (typeof dto?.hoTen === 'string') dataNguoiDung.hoTen = dto.hoTen;
    if (typeof dto?.avatar === 'string') dataNguoiDung.avatar = dto.avatar;

    if (Object.keys(dataNguoiDung).length > 0) {
      await this.prisma.nguoiDung.update({
        where: { id: userId },
        data: dataNguoiDung,
      });
    }

    // 2. Update Social Profile (HoSoXaHoi)
    const socialData: any = {};

    // Map 'tieuSu' (Bio)
    if (typeof dto?.tieuSu === 'string') socialData.tieuSu = dto.tieuSu;

    // Map 'ngaySinh' to 'ngaySinhHienThi'
    if (dto?.ngaySinh) socialData.ngaySinhHienThi = new Date(dto.ngaySinh);

    // Map 'diaChi' to 'diaChiHienThi'
    if (typeof dto?.diaChi === 'string') socialData.diaChiHienThi = dto.diaChi;

    if (typeof dto?.soThich === 'string') socialData.soThich = dto.soThich;

    // Upsert HoSoXaHoi
    if (Object.keys(socialData).length > 0) {
      await this.prisma.hoSoXaHoi.upsert({
        where: { userId },
        create: { userId, ...socialData },
        update: socialData,
      });
    }

    // NOTE: We intentionally DO NOT update HoSoHocSinh/HoSoGiaoVien here anymore.
    // Official records should be updated via a separate Administrative API.

    return this.getProfile(userId);
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    if (!avatarUrl)
      throw new UnauthorizedException('validation.invalid_avatar');
    await this.prisma.nguoiDung.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
    return this.getProfile(userId);
  }
}
