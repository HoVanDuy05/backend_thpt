import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.LichHocCreateInput) {
    return this.prisma.lichHoc.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.lichHoc.findMany({
      include: {
        lopHoc: true,
        monHoc: true,
        gvDay: true,
      },
    });
  }

  async findByClass(lopId: number) {
    return this.prisma.lichHoc.findMany({
      where: { lopId },
      include: {
        monHoc: true,
        gvDay: true,
      },
      orderBy: [{ thu: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async findByTeacher(gvDayId: number) {
    return this.prisma.lichHoc.findMany({
      where: { gvDayId },
      include: {
        lopHoc: true,
        monHoc: true,
      },
      orderBy: [{ thu: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async findOne(id: number) {
    return this.prisma.lichHoc.findUnique({
      where: { id },
      include: {
        lopHoc: true,
        monHoc: true,
        gvDay: true,
      },
    });
  }

  async update(id: number, data: Prisma.LichHocUpdateInput) {
    return this.prisma.lichHoc.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.lichHoc.delete({
      where: { id },
    });
  }
}
