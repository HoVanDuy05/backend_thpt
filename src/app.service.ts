import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { VaiTro } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getStats() {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalYears,
      totalOrgs,
      totalPosts,
      pendingApprovals,
    ] = await Promise.all([
      this.prisma.nguoiDung.count({ where: { vaiTro: VaiTro.HOC_SINH } }),
      this.prisma.nguoiDung.count({ where: { vaiTro: VaiTro.GIAO_VIEN } }),
      this.prisma.lopHoc.count(),
      this.prisma.namHoc.count(),
      this.prisma.toChuc.count(),
      this.prisma.baiViet.count(),
      this.prisma.phienQuyTrinh.count({ where: { trangThai: 'CHO_DUYET' } }),
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalYears,
      totalOrgs,
      totalPosts,
      pendingApprovals,
    };
  }
}
