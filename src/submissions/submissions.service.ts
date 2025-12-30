import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) { }

  create(dto: CreateSubmissionDto) {
    return this.prisma.lichSuNopBai.create({
      data: dto,
    });
  }

  findAll(params: any = {}) {
    return this.prisma.lichSuNopBai.findMany({
      include: {
        hocSinh: true,
        deKiemTra: true,
      },
      ...params,
    });
  }

  findOne(id: number) {
    return this.prisma.lichSuNopBai.findUnique({
      where: { id },
      include: {
        hocSinh: true,
        deKiemTra: true,
        chiTietTraLois: {
          include: { nganHangCauHoi: true }
        },
      },
    });
  }

  submitAnswer(submissionId: number, dto: SubmitAnswerDto) {
    return this.prisma.chiTietTraLoiTracNghiem.create({
      data: {
        nopBaiId: submissionId,
        cauHoiId: dto.cauHoiId,
        cauTraLoiCuaHs: dto.cauTraLoiCuaHs,
        laDung: dto.laDung,
      },
    });
  }
}
