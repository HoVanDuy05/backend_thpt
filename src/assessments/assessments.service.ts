import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { AddQuestionToExamDto } from './dto/add-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Questions ---
  createQuestion(dto: CreateQuestionDto) {
    return this.prisma.nganHangCauHoi.create({
      data: dto,
    });
  }

  findAllQuestions(params: any = {}) {
    return this.prisma.nganHangCauHoi.findMany({
      include: { monHoc: true },
      ...params,
    });
  }

  findOneQuestion(id: number) {
    return this.prisma.nganHangCauHoi.findUnique({
      where: { id },
      include: { monHoc: true },
    });
  }

  updateQuestion(id: number, dto: UpdateQuestionDto) {
    return this.prisma.nganHangCauHoi.update({
      where: { id },
      data: dto,
    });
  }

  removeQuestion(id: number) {
    return this.prisma.nganHangCauHoi.delete({
      where: { id },
    });
  }

  // --- Exams ---
  createExam(dto: CreateExamDto) {
    return this.prisma.deKiemTra.create({
      data: {
        ...dto,
        hanNopBai: dto.hanNopBai ? new Date(dto.hanNopBai) : null,
      },
    });
  }

  findAllExams(params: any = {}) {
    return this.prisma.deKiemTra.findMany({
      include: {
        monHoc: true,
        chiTietDeThis: {
          include: { nganHangCauHoi: true },
        },
      },
      orderBy: { id: 'desc' },
      ...params,
    });
  }

  findOneExam(id: number) {
    return this.prisma.deKiemTra.findUnique({
      where: { id },
      include: {
        monHoc: true,
        chiTietDeThis: {
          include: { nganHangCauHoi: true },
          orderBy: { thuTuCau: 'asc' },
        },
      },
    });
  }

  updateExam(id: number, dto: UpdateExamDto) {
    const data: any = { ...dto };
    if (dto.hanNopBai) {
      data.hanNopBai = new Date(dto.hanNopBai);
    }
    return this.prisma.deKiemTra.update({
      where: { id },
      data: data,
    });
  }

  removeExam(id: number) {
    return this.prisma.deKiemTra.delete({
      where: { id },
    });
  }

  // --- Exam Questions ---
  addQuestionToExam(examId: number, dto: AddQuestionToExamDto) {
    return this.prisma.chiTietDeThi.create({
      data: {
        deThiId: examId,
        cauHoiId: dto.cauHoiId,
        thuTuCau: dto.thuTuCau,
      },
    });
  }

  removeQuestionFromExam(examId: number, questionId: number) {
    return this.prisma.chiTietDeThi.delete({
      where: {
        deThiId_cauHoiId: {
          deThiId: examId,
          cauHoiId: questionId,
        },
      },
    });
  }
}
