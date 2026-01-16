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

  async cloneClasses(fromNamHocId: number, toNamHocId: number) {
    // 1. Get source classes
    const sourceClasses = await this.prisma.lopHoc.findMany({
      where: { namHocId: fromNamHocId },
    });

    if (sourceClasses.length === 0) {
      throw new Error("Không tìm thấy lớp học nào trong năm học nguồn.");
    }

    // 2. Create target classes
    // We can use createMany if database supports it (MySQL does).
    // But we need to map data.
    const dataToCreate = sourceClasses.map(cls => ({
      tenLop: cls.tenLop,
      namHocId: toNamHocId,
      // We do NOT copy gvChuNhiemId because teachers change every year usually.
      // But user demand "Clone Structure", so names are key.
    }));

    // Optional: Check existence to avoid dupes?
    // For simplicity/speed requested by user, we just create. 
    // If exact name exists in target year, what happens? 
    // Allow duplicate names? Schema doesn't enforce unique tenLop per namHoc (checked ViewFile).
    // So duplicates are possible but confusing.
    // Ideally we skip existing names.

    /* 
    // Better logic: Filter out existing
    const existing = await this.prisma.lopHoc.findMany({ where: { namHocId: toNamHocId } });
    const existingNames = new Set(existing.map(c => c.tenLop));
    const finalData = dataToCreate.filter(d => !existingNames.has(d.tenLop));
    */

    const existing = await this.prisma.lopHoc.findMany({ where: { namHocId: toNamHocId } });
    const existingNames = new Set(existing.map(c => c.tenLop));
    const finalData = dataToCreate.filter(d => !existingNames.has(d.tenLop));

    if (finalData.length === 0) {
      return { count: 0, message: "Tất cả các lớp đã tồn tại trong năm học đích." };
    }

    return this.prisma.lopHoc.createMany({
      data: finalData,
    });
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
