import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCalendarDto, UpdateCalendarDto } from './calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateCalendarDto) {
    console.log('Creating calendar entry with data:', JSON.stringify(data, null, 2));
    return this.prisma.lichHocNew.create({
      data: {
        lopNamId: data.lopNamId,
        monHocId: data.monHocId,
        gvDayId: data.gvDayId,
        thu: data.thu,
        tietBatDau: data.tietBatDau,
        soTiet: data.soTiet,
        phongHoc: data.phongHoc,
        ngay: data.ngay ? new Date(data.ngay) : null,
      },
      include: {
        lopNam: {
          include: {
            lopHoc: true,
            namHoc: true,
          },
        },
        monHoc: true,
        gvDay: true,
      },
    });
  }

  async findAll(query?: { from?: string; to?: string; lopNamId?: number }) {
    const where: any = {};
    if (query?.lopNamId) where.lopNamId = query.lopNamId;
    if (query?.from || query?.to) {
      where.ngay = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      };
    }

    return this.prisma.lichHocNew.findMany({
      where,
      include: {
        lopNam: {
          include: {
            lopHoc: true,
            namHoc: true,
          },
        },
        monHoc: true,
        gvDay: true,
      },
      orderBy: [{ ngay: 'asc' }, { thu: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async findByLopNam(lopNamId: number) {
    return this.prisma.lichHocNew.findMany({
      where: { lopNamId },
      include: {
        monHoc: true,
        gvDay: true,
      },
      orderBy: [{ thu: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async findByTeacher(gvDayId: number) {
    return this.prisma.lichHocNew.findMany({
      where: { gvDayId },
      include: {
        lopNam: {
          include: {
            lopHoc: true,
            namHoc: true,
          },
        },
        monHoc: true,
      },
      orderBy: [{ thu: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async findByStudent(hocSinhId: number, namHocId?: number) {
    // Find student's current LopNam
    const hocSinhLopNam = await this.prisma.hocSinhLopNam.findFirst({
      where: {
        hocSinhId,
        ...(namHocId && {
          lopNam: {
            namHocId,
          },
        }),
        trangThai: 'DANG_HOC',
      },
      include: {
        lopNam: {
          include: {
            lopHoc: true,
            namHoc: true,
          },
        },
      },
      orderBy: {
        ngayVao: 'desc',
      },
    });

    if (!hocSinhLopNam) {
      return [];
    }

    return this.prisma.lichHocNew.findMany({
      where: { lopNamId: hocSinhLopNam.lopNamId },
      include: {
        monHoc: true,
        gvDay: true,
        lopNam: {
          include: {
            lopHoc: true,
            namHoc: true,
          },
        },
      },
      orderBy: [{ thu: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async findOne(id: number) {
    return this.prisma.lichHocNew.findUnique({
      where: { id },
      include: {
        lopNam: {
          include: {
            lopHoc: true,
            namHoc: true,
          },
        },
        monHoc: true,
        gvDay: true,
      },
    });
  }

  async update(id: number, data: UpdateCalendarDto) {
    return this.prisma.lichHocNew.update({
      where: { id },
      data,
      include: {
        lopNam: {
          include: {
            lopHoc: true,
            namHoc: true,
          },
        },
        monHoc: true,
        gvDay: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.lichHocNew.delete({
      where: { id },
    });
  }
}
