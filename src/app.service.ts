import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { VaiTro } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getStats() {
    const [totalStudents, totalTeachers, totalClasses, totalYears] = await Promise.all([
      this.prisma.nguoiDung.count({ where: { vaiTro: VaiTro.HOC_SINH } }),
      this.prisma.nguoiDung.count({ where: { vaiTro: VaiTro.GIAO_VIEN } }),
      this.prisma.lopHoc.count(),
      this.prisma.namHoc.count(),
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalYears,
    };
  }
}
