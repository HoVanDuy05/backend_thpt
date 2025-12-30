import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.nguoiDung.create({
      data: createUserDto,
    });
    // Send welcome email (non-blocking)
    this.mailService.sendWelcomeEmail(user).catch(err => console.error('Email failed:', err));
    return user;
  }

  createTeacherProfile(dto: CreateTeacherDto) {
    return this.prisma.hoSoGiaoVien.create({
      data: dto,
    });
  }

  createStudentProfile(dto: CreateStudentDto) {
    return this.prisma.hoSoHocSinh.create({
      data: {
        ...dto,
        ngaySinh: dto.ngaySinh ? new Date(dto.ngaySinh) : null,
      },
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
    return this.prisma.nguoiDung.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
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
        // Include other profile-related data if needed
      },
    });
  }
}
