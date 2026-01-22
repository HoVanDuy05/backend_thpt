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
        soTiet: data.soTiet || 1,
        phongHoc: data.phongHoc,
        ngay: data.ngay ? new Date(data.ngay) : null,
      } as any,
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
      where.OR = [
        {
          ngay: {
            ...(query.from && { gte: new Date(query.from) }),
            ...(query.to && { lte: new Date(query.to) }),
          },
        },
        {
          ngay: null,
        },
      ];
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
      orderBy: [
        { ngay: 'asc' } as any,
        { thu: 'asc' },
        { tietBatDau: 'asc' }
      ],
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

  async findByStudent(params: { userId: number; from?: string; to?: string; namHocId?: number }) {
    const { userId, from, to, namHocId } = params;

    // 1. Find student profile from userId
    const student = await this.prisma.hoSoHocSinh.findUnique({
      where: { userId },
    });

    if (!student) {
      return [];
    }

    const hocSinhId = student.id;

    // 2. Find student's current session (LopNam)
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

    // 3. Build where clause with date range support
    const where: any = { lopNamId: hocSinhLopNam.lopNamId };
    if (from || to) {
      where.OR = [
        {
          ngay: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        },
        {
          ngay: null, // Always include recurring events
        },
      ];
    }

    return this.prisma.lichHocNew.findMany({
      where,
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
      orderBy: [
        { ngay: 'asc' } as any,
        { thu: 'asc' },
        { tietBatDau: 'asc' }
      ],
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
