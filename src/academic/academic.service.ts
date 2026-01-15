import { Injectable } from '@nestjs/common';
// Force TS update
import { CreateNamHocDto } from './dto/create-nam-hoc.dto';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { CreateLopHocDto } from './dto/create-lop-hoc.dto';
import { UpdateNamHocDto } from './dto/update-nam-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { UpdateLopHocDto } from './dto/update-lop-hoc.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) { }

  // --- NamHoc ---
  async createNamHoc(dto: CreateNamHocDto) {
    // If this one is active, deactivate others (optional rule)
    if (dto.dangKichHoat) {
      await this.prisma.namHoc.updateMany({
        where: { dangKichHoat: true },
        data: { dangKichHoat: false }
      });
    }
    return this.prisma.namHoc.create({
      data: dto,
    });
  }

  async findAllNamHoc(params: any = {}) {
    return this.prisma.namHoc.findMany({
      include: {
        cacHocKy: true,
        _count: { select: { cacLop: true } }
      },
      orderBy: { tenNamHoc: 'desc' },
      ...params
    });
  }

  findOneNamHoc(id: number) {
    return this.prisma.namHoc.findUnique({ where: { id } });
  }

  async updateNamHoc(id: number, dto: UpdateNamHocDto) {
    if (dto.dangKichHoat) {
      await this.prisma.namHoc.updateMany({
        where: { id: { not: id }, dangKichHoat: true },
        data: { dangKichHoat: false }
      });
    }
    return this.prisma.namHoc.update({ where: { id }, data: dto });
  }

  removeNamHoc(id: number) {
    return this.prisma.namHoc.delete({ where: { id } });
  }

  // --- MonHoc ---
  createMonHoc(createMonHocDto: CreateMonHocDto) {
    return this.prisma.monHoc.create({
      data: createMonHocDto,
    });
  }

  findAllMonHoc(params: any = {}) {
    return this.prisma.monHoc.findMany(params);
  }

  findOneMonHoc(id: number) {
    return this.prisma.monHoc.findUnique({ where: { id } });
  }

  updateMonHoc(id: number, dto: UpdateMonHocDto) {
    return this.prisma.monHoc.update({ where: { id }, data: dto });
  }

  removeMonHoc(id: number) {
    return this.prisma.monHoc.delete({ where: { id } });
  }

  // --- LopHoc ---
  createLopHoc(createLopHocDto: CreateLopHocDto) {
    return this.prisma.lopHoc.create({
      data: createLopHocDto,
    });
  }

  findAllLopHoc(params: any = {}) {
    return this.prisma.lopHoc.findMany({
      include: {
        namHoc: true,
        gvChuNhiem: true,
      },
      ...params,
    });
  }

  findOneLopHoc(id: number) {
    return this.prisma.lopHoc.findUnique({
      where: { id },
      include: {
        namHoc: true,
        gvChuNhiem: true,
      },
    });
  }

  updateLopHoc(id: number, dto: UpdateLopHocDto) {
    return this.prisma.lopHoc.update({ where: { id }, data: dto });
  }

  removeLopHoc(id: number) {
    return this.prisma.lopHoc.delete({ where: { id } });
  }

  // --- HocKy ---
  async createHocKy(dto: any) {
    // Ensure only one active semester if needed, logic similar to Nam Hoc
    if (dto.dangKichHoat) {
      await this.prisma.hocKy.updateMany({
        where: { dangKichHoat: true },
        data: { dangKichHoat: false }
      });
    }
    return this.prisma.hocKy.create({ data: dto });
  }

  async findAllHocKy(params: any = {}) {
    return this.prisma.hocKy.findMany({
      include: { namHoc: true },
      orderBy: { tenHocKy: 'asc' },
      ...params
    });
  }

  async findOneHocKy(id: number) {
    return this.prisma.hocKy.findUnique({ where: { id } });
  }

  async updateHocKy(id: number, dto: any) {
    if (dto.dangKichHoat) {
      await this.prisma.hocKy.updateMany({
        where: { id: { not: id }, dangKichHoat: true },
        data: { dangKichHoat: false }
      });
    }
    return this.prisma.hocKy.update({ where: { id }, data: dto });
  }

  async removeHocKy(id: number) {
    return this.prisma.hocKy.delete({ where: { id } });
  }
}
