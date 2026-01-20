import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
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

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  private async generateId(prefix: string): Promise<string> {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const datePrefix = `${prefix}${yy}${mm}${dd}`;

    let lastRecord;
    if (prefix === 'HS') {
      lastRecord = await this.prisma.hoSoHocSinh.findFirst({
        where: { maSoHs: { startsWith: datePrefix } },
        orderBy: { maSoHs: 'desc' },
      });
    } else if (prefix === 'GV') {
      lastRecord = await this.prisma.hoSoGiaoVien.findFirst({
        where: { maSoGv: { startsWith: datePrefix } },
        orderBy: { maSoGv: 'desc' },
      });
    } else {
      lastRecord = await this.prisma.hoSoNhanVien.findFirst({
        where: { maSo: { startsWith: datePrefix } },
        orderBy: { maSo: 'desc' },
      });
    }

    let nextNumber = 1;
    if (lastRecord) {
      const lastId = prefix === 'HS' ? lastRecord.maSoHs : (prefix === 'GV' ? lastRecord.maSoGv : lastRecord.maSo);
      const lastSeq = parseInt(lastId.slice(-3));
      nextNumber = lastSeq + 1;
    }

    return `${datePrefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  async createFullStudent(dto: any) {
    const { email, matKhau, isNewAccount, ...profileData } = dto;
    let user;

    const maSoHs = profileData.maSoHs || (await this.generateId('HS'));

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

    const profile = await this.prisma.hoSoHocSinh.create({
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

    // Update the NguoiDung record with the maSo for quick access
    await this.prisma.nguoiDung.update({
      where: { id: user.id },
      data: { maSo: maSoHs }
    });

    return profile;
  }

  async createFullTeacher(dto: any) {
    const { email, matKhau, isNewAccount, ...profileData } = dto;
    let user;

    const maSoGv = profileData.maSoGv || (await this.generateId('GV'));

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

    const profile = await this.prisma.hoSoGiaoVien.create({
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

    await this.prisma.nguoiDung.update({
      where: { id: user.id },
      data: { maSo: maSoGv }
    });

    return profile;
  }

  async createFullStaff(dto: any) {
    const { email, matKhau, isNewAccount, ...profileData } = dto;
    let user;
    const maSo = profileData.maSo || (await this.generateId('NV'));

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

    const profile = await this.prisma.hoSoNhanVien.create({
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

    await this.prisma.nguoiDung.update({
      where: { id: user.id },
      data: { maSo: maSo }
    });

    return profile;
  }

  findAll(query: any = {}) {
    const { role, ...rest } = query;
    const where: any = {};
    if (role) {
      where.vaiTro = role;
    }
    return this.prisma.nguoiDung.findMany({
      where,
      select: {
        id: true,
        taiKhoan: true,
        email: true,
        soDienThoai: true,
        kichHoat: true,
        vaiTro: true,
        hoTen: true,
        maSo: true,
        avatar: true,
        ngayTao: true,
        hoSoHocSinh: true,
        hoSoGiaoVien: true,
        hoSoNhanVien: true,
        thanhVienToChucs: true,
      },
      ...rest
    });
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
      select: {
        id: true,
        taiKhoan: true,
        email: true,
        soDienThoai: true,
        kichHoat: true,
        maXacThuc: true,
        googleId: true,
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
                        khoi: true
                      }
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
                            maSo: true
                          }
                        }
                      }
                    }
                  }
                }
              },
              orderBy: {
                lopNam: {
                  namHoc: {
                    ngayBatDau: 'desc' // Most recent first
                  }
                }
              }
            }
          }
        },
        hoSoGiaoVien: {
          include: {
            lopNams: {
              include: {
                lopHoc: true,
                namHoc: true
              }
            }
          }
        },
        hoSoNhanVien: true
      }
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('validation.invalid_user_id');
    }

    const { email, matKhau, vaiTro, hoTen, ...profileData } = dto;
    const updateData: any = {};
    if (email) updateData.email = email;
    if (hoTen) updateData.hoTen = hoTen;
    if (vaiTro) updateData.vaiTro = vaiTro;
    if (matKhau) updateData.matKhau = await bcrypt.hash(matKhau, 10);

    // Get current user to know their role
    const userSnapshot = await this.prisma.nguoiDung.findUnique({ where: { id } });
    if (!userSnapshot) throw new BadRequestException('User not found');

    const role = vaiTro || userSnapshot.vaiTro;

    // Update NguoiDung
    const updatedUser = await this.prisma.nguoiDung.update({
      where: { id },
      data: updateData,
    });

    // List of fields that belong to the base NguoiDung model, not the profile
    const baseUserFields = ['email', 'matKhau', 'vaiTro', 'hoTen', 'isNewAccount', 'urlParams'];

    // Sanitize profileUpdate: remove base user fields and any helper fields like isNewAccount
    const profileUpdate: any = {};
    Object.keys(dto).forEach(key => {
      if (!baseUserFields.includes(key)) {
        profileUpdate[key] = dto[key];
      }
    });

    // Handle date strings and ensure they are valid Date objects or null
    ['ngaySinh', 'ngayCapCccd', 'ngayNhapHoc', 'ngayVaoLam'].forEach(key => {
      if (profileUpdate[key]) {
        const date = new Date(profileUpdate[key]);
        profileUpdate[key] = isNaN(date.getTime()) ? null : date;
      } else if (profileUpdate[key] === '') {
        profileUpdate[key] = null;
      }
    });

    // Handle numeric IDs - ensure empty strings become null
    if (profileUpdate.lopId !== undefined) {
      profileUpdate.lopId = profileUpdate.lopId === '' || profileUpdate.lopId === null ? null : Number(profileUpdate.lopId);
    }

    if (role === 'HOC_SINH') {
      // Whitelist fields for HoSoHocSinh
      const hocSinhFields = [
        'maSoHs', 'ngaySinh', 'gioiTinh', 'noiSinh', 'danToc', 'tonGiao',
        'diaChiThuongTru', 'diaChiTamTru', 'soDienThoai', 'cccd', 'ngayCapCccd',
        'noiCapCccd', 'hoTenCha', 'ngheNghiepCha', 'sdtCha', 'hoTenMe',
        'ngheNghiepMe', 'sdtMe', 'ngayNhapHoc', 'trangThai', 'diaChi'
      ];
      const sanitizedHsData: any = {};
      hocSinhFields.forEach(f => {
        if (profileUpdate[f] !== undefined) sanitizedHsData[f] = profileUpdate[f];
      });

      await this.prisma.hoSoHocSinh.update({
        where: { userId: id },
        data: { ...sanitizedHsData, hoTen: hoTen || updatedUser.hoTen },
      });
    } else if (role === 'GIAO_VIEN') {
      const giaoVienFields = [
        'maSoGv', 'ngaySinh', 'gioiTinh', 'diaChi', 'soDienThoai', 'emailLienHe',
        'cccd', 'ngayCapCccd', 'noiCapCccd', 'trinhDo', 'chuyenMon', 'ngayVaoLam'
      ];
      const sanitizedGvData: any = {};
      giaoVienFields.forEach(f => {
        if (profileUpdate[f] !== undefined) sanitizedGvData[f] = profileUpdate[f];
      });

      await this.prisma.hoSoGiaoVien.update({
        where: { userId: id },
        data: { ...sanitizedGvData, hoTen: hoTen || updatedUser.hoTen },
      });
    } else if (role === 'NHAN_VIEN') {
      const nhanVienFields = [
        'maSo', 'ngaySinh', 'gioiTinh', 'diaChi', 'soDienThoai', 'emailLienHe', 'cccd'
      ];
      const sanitizedNvData: any = {};
      nhanVienFields.forEach(f => {
        if (profileUpdate[f] !== undefined) sanitizedNvData[f] = profileUpdate[f];
      });

      await this.prisma.hoSoNhanVien.update({
        where: { userId: id },
        data: { ...sanitizedNvData, hoTen: hoTen || updatedUser.hoTen },
      });
    }

    return updatedUser;
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
      select: {
        id: true,
        taiKhoan: true,
        email: true,
        soDienThoai: true,
        kichHoat: true,
        vaiTro: true,
        hoTen: true,
        maSo: true,
        avatar: true,
        ngayTao: true,
        hoSoHocSinh: {
          include: {
            cacLopNam: {
              where: { trangThai: 'DANG_HOC' },
              include: {
                lopNam: {
                  include: {
                    lopHoc: {
                      include: {
                        khoi: true,
                      }
                    },
                    gvChuNhiem: {
                      select: {
                        id: true,
                        hoTen: true,
                        maSoGv: true
                      }
                    },
                    namHoc: true,
                  },
                },
              },
            },
            lopHoc: {
              include: {
                namHoc: true,
                gvChuNhiem: {
                  select: {
                    id: true,
                    hoTen: true,
                    maSoGv: true
                  }
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
              }
            }
          },
        },
        hoSoNhanVien: true,
        hoSoXaHoi: true,
      },
    });
  }

  // Legacy methods removed.
}
