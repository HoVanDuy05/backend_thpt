import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ResendMailService } from '../mail/resend-mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: ResendMailService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const taiKhoan = createUserDto.email.split('@')[0];
    const hashedPassword = await bcrypt.hash(createUserDto.matKhau, 10);

    const user = await this.prisma.nguoiDung.create({
      data: {
        ...createUserDto,
        matKhau: hashedPassword,
        taiKhoan,
      },
    });
    this.mailService.sendWelcomeEmail(user).catch(err => console.error('Email failed:', err));
    return user;
  }

  createTeacherProfile(dto: CreateTeacherDto) {
    return this.prisma.hoSoGiaoVien.create({
      data: dto as any,
    });
  }

  createStudentProfile(dto: CreateStudentDto) {
    return this.prisma.hoSoHocSinh.create({
      data: {
        ...dto,
        ngaySinh: dto.ngaySinh ? new Date(dto.ngaySinh) : null,
      } as any,
    });
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  private generateId(prefix: string): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000); // 4 random digits
    return `${prefix}${year}${random}`;
  }

  async createFullStudent(dto: any) {
    const { email, matKhau, isNewAccount, ...profileData } = dto;
    let user;

    const maSoHs = profileData.maSoHs || this.generateId('HS');

    if (isNewAccount) {
      const existingUser = await this.prisma.nguoiDung.findUnique({ where: { email } });
      if (existingUser) throw new BadRequestException(`Email ${email} đã tồn tại trong hệ thống.`);

      const rawPassword = matKhau || this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const taiKhoan = email.split('@')[0];

      user = await this.prisma.nguoiDung.create({
        data: {
          email,
          matKhau: hashedPassword,
          taiKhoan,
          vaiTro: 'HOC_SINH',
          kichHoat: true,
          hoTen: profileData.hoTen,
        }
      });

      // Send email with credentials
      this.mailService.sendAccountDetailsEmail(user, {
        password: rawPassword,
        role: 'HOC_SINH',
        maSo: maSoHs,
      }).catch(e => console.error(e));
    } else {
      user = await this.prisma.nguoiDung.findUnique({ where: { email } });
      if (!user) throw new BadRequestException(`Không tìm thấy người dùng có email ${email}.`);

      // Send profile confirmation email
      this.mailService.sendAccountDetailsEmail(user, {
        role: 'HOC_SINH',
        maSo: maSoHs,
      }).catch(e => console.error(e));
    }

    return this.prisma.hoSoHocSinh.create({
      data: {
        userId: user.id,
        maSoHs: maSoHs,
        hoTen: profileData.hoTen,
        ngaySinh: profileData.ngaySinh ? new Date(profileData.ngaySinh) : null,
        gioiTinh: profileData.gioiTinh,
        noiSinh: profileData.noiSinh,
        danToc: profileData.danToc,
        tonGiao: profileData.tonGiao,
        diaChiThuongTru: profileData.diaChiThuongTru,
        diaChiTamTru: profileData.diaChiTamTru,
        soDienThoai: profileData.soDienThoai,
        cccd: profileData.cccd,
        ngayCapCccd: profileData.ngayCapCccd ? new Date(profileData.ngayCapCccd) : null,
        noiCapCccd: profileData.noiCapCccd,
        hoTenCha: profileData.hoTenCha,
        ngheNghiepCha: profileData.ngheNghiepCha,
        sdtCha: profileData.sdtCha,
        hoTenMe: profileData.hoTenMe,
        ngheNghiepMe: profileData.ngheNghiepMe,
        sdtMe: profileData.sdtMe,
        ngayNhapHoc: profileData.ngayNhapHoc ? new Date(profileData.ngayNhapHoc) : null,
        trangThai: profileData.trangThai || 'DANG_HOC',
        lopId: profileData.lopId
      }
    });
  }

  async createFullTeacher(dto: any) {
    const { email, matKhau, isNewAccount, ...profileData } = dto;
    let user;

    const maSoGv = profileData.maSoGv || this.generateId('GV');

    if (isNewAccount) {
      const existingUser = await this.prisma.nguoiDung.findUnique({ where: { email } });
      if (existingUser) throw new BadRequestException(`Email ${email} đã tồn tại trong hệ thống.`);

      const rawPassword = matKhau || this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const taiKhoan = email.split('@')[0];

      user = await this.prisma.nguoiDung.create({
        data: {
          email,
          matKhau: hashedPassword,
          taiKhoan,
          vaiTro: 'GIAO_VIEN',
          kichHoat: true,
          hoTen: profileData.hoTen,
        }
      });

      this.mailService.sendAccountDetailsEmail(user, {
        password: rawPassword,
        role: 'GIAO_VIEN',
        maSo: maSoGv,
      }).catch(e => console.error(e));
    } else {
      user = await this.prisma.nguoiDung.findUnique({ where: { email } });
      if (!user) throw new BadRequestException(`Không tìm thấy người dùng có email ${email}.`);

      this.mailService.sendAccountDetailsEmail(user, {
        role: 'GIAO_VIEN',
        maSo: maSoGv,
      }).catch(e => console.error(e));
    }

    return this.prisma.hoSoGiaoVien.create({
      data: {
        userId: user.id,
        maSoGv: maSoGv,
        hoTen: profileData.hoTen,
        ngaySinh: profileData.ngaySinh ? new Date(profileData.ngaySinh) : null,
        gioiTinh: profileData.gioiTinh,
        diaChi: profileData.diaChi,
        soDienThoai: profileData.soDienThoai,
        emailLienHe: profileData.emailLienHe,
        cccd: profileData.cccd,
        ngayCapCccd: profileData.ngayCapCccd ? new Date(profileData.ngayCapCccd) : null,
        noiCapCccd: profileData.noiCapCccd,
        trinhDo: profileData.trinhDo || 'DAI_HOC',
        chuyenMon: profileData.chuyenMon,
        ngayVaoLam: profileData.ngayVaoLam ? new Date(profileData.ngayVaoLam) : null
      }
    });
  }

  async createFullStaff(dto: any) {
    const { email, matKhau, isNewAccount, ...profileData } = dto;
    let user;
    const maSo = profileData.maSo || this.generateId('NV');

    if (isNewAccount) {
      const existingUser = await this.prisma.nguoiDung.findUnique({ where: { email } });
      if (existingUser) throw new BadRequestException(`Email ${email} đã tồn tại trong hệ thống.`);

      const rawPassword = matKhau || this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const taiKhoan = email.split('@')[0];

      user = await this.prisma.nguoiDung.create({
        data: {
          email,
          matKhau: hashedPassword,
          taiKhoan,
          vaiTro: 'NHAN_VIEN',
          kichHoat: true,
          hoTen: profileData.hoTen,
        }
      });

      this.mailService.sendAccountDetailsEmail(user, {
        password: rawPassword,
        role: 'NHAN_VIEN',
        maSo: maSo,
      }).catch(e => console.error(e));
    } else {
      user = await this.prisma.nguoiDung.findUnique({ where: { email } });
      if (!user) throw new BadRequestException(`Không tìm thấy người dùng có email ${email}.`);

      this.mailService.sendAccountDetailsEmail(user, {
        role: 'NHAN_VIEN',
        maSo: maSo,
      }).catch(e => console.error(e));
    }

    return this.prisma.hoSoNhanVien.create({
      data: {
        userId: user.id,
        maSo: maSo,
        hoTen: profileData.hoTen,
        ngaySinh: profileData.ngaySinh ? new Date(profileData.ngaySinh) : null,
        gioiTinh: profileData.gioiTinh,
        diaChi: profileData.diaChi,
        soDienThoai: profileData.soDienThoai,
        emailLienHe: profileData.emailLienHe,
        cccd: profileData.cccd
      }
    });
  }

  findAll(params: any = {}) {
    return this.prisma.nguoiDung.findMany(params);
  }

  findByTaiKhoan(taiKhoan: string) {
    return this.prisma.nguoiDung.findUnique({
      where: { taiKhoan },
    });
  }

  findByEmail(email: string) {
    return this.prisma.nguoiDung.findUnique({
      where: { email },
    });
  }

  findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('validation.invalid_user_id');
    }
    return this.prisma.nguoiDung.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('validation.invalid_user_id');
    }
    return this.prisma.nguoiDung.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('validation.invalid_user_id');
    }
    return this.prisma.nguoiDung.delete({
      where: { id },
    });
  }

  async findUserProfile(id: number) {
    return this.prisma.nguoiDung.findUnique({
      where: { id },
      include: {
        hoSoHocSinh: {
          include: {
            lopHoc: {
              include: {
                namHoc: true,
                gvChuNhiem: true,
              },
            },
          },
        },
        hoSoGiaoVien: {
          include: {
            lopChuNhiem: true,
          },
        },
        hoSoNhanVien: true,
        hoSoXaHoi: true,
      },
    });
  }

  createStaffProfile(dto: any) {
    return this.prisma.hoSoNhanVien.create({
      data: dto as any,
    });
  }
}
