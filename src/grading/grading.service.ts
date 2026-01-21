import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradingDto } from './dto/create-grading.dto';
import { UpdateGradingDto } from './dto/update-grading.dto';
import { ResendMailService } from '../mail/resend-mail.service';

@Injectable()
export class GradingService {
  constructor(
    private prisma: PrismaService,
    private mailService: ResendMailService,
  ) {}

  async create(dto: CreateGradingDto) {
    const grade = await this.prisma.ketQuaChamDiem.create({
      data: {
        ...dto,
        diemSo: dto.diemSo,
      },
      include: {
        lichSuNopBai: {
          include: {
            hocSinh: true,
            deKiemTra: true,
          },
        },
      },
    });

    // Update submission status to DA_CHAM
    await this.prisma.lichSuNopBai.update({
      where: { id: dto.nopBaiId },
      data: { trangThai: 'DA_CHAM' },
    });

    // Send notification email (non-blocking)
    if (grade.lichSuNopBai) {
      this.mailService
        .sendGradeNotification(grade.lichSuNopBai, grade)
        .catch((err) => console.error('Email failed:', err));
    }

    return grade;
  }

  findAll(params: any = {}) {
    return this.prisma.ketQuaChamDiem.findMany({
      include: {
        lichSuNopBai: true,
        gvCham: true,
      },
      ...params,
    });
  }

  findOne(id: number) {
    return this.prisma.ketQuaChamDiem.findUnique({
      where: { id },
      include: {
        lichSuNopBai: true,
        gvCham: true,
      },
    });
  }

  update(id: number, dto: UpdateGradingDto) {
    return this.prisma.ketQuaChamDiem.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.ketQuaChamDiem.delete({
      where: { id },
    });
  }
}
