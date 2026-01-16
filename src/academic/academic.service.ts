import { Injectable } from '@nestjs/common';
// Force TS update
import { CreateNamHocDto } from './dto/create-nam-hoc.dto';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { CreateLopHocDto } from './dto/create-lop-hoc.dto';
import { CreateKhoiDto } from './dto/create-khoi.dto';
import { UpdateKhoiDto } from './dto/update-khoi.dto';
import { UpdateNamHocDto } from './dto/update-nam-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { UpdateLopHocDto } from './dto/update-lop-hoc.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) { }

  // --- Khoi ---
  createKhoi(dto: CreateKhoiDto) {
    return this.prisma.khoi.create({ data: dto });
  }

  findAllKhoi() {
    return this.prisma.khoi.findMany({
      include: {
        _count: { select: { lopHocs: true } }
      }
    });
  }

  findOneKhoi(id: number) {
    return this.prisma.khoi.findUnique({
      where: { id },
      include: {
        lopHocs: true
      }
    });
  }

  updateKhoi(id: number, dto: UpdateKhoiDto) {
    return this.prisma.khoi.update({ where: { id }, data: dto });
  }

  removeKhoi(id: number) {
    return this.prisma.khoi.delete({ where: { id } });
  }

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
        khoi: true,
        cacLopNam: {
          include: {
            namHoc: true,
            gvChuNhiem: true
          }
        }
      },
      ...params,
    });
  }

  findOneLopHoc(id: number) {
    return this.prisma.lopHoc.findUnique({
      where: { id },
      include: {
        khoi: true,
        cacLopNam: {
          include: {
            namHoc: true,
            gvChuNhiem: true
          }
        }
      },
    });
  }

  // --- Student Management ---

  async getAvailableStudentsForYear(yearId: number) {
    // 1. Get all students
    // 2. Filter out students who are already in a class for this year
    // Note: This can be optimized with a raw query or clever where clause, 
    // but for now we'll do: Find all students who do NOT have a HocSinhLopNam entry 
    // linked to a LopNam that is linked to this NamHoc.

    return this.prisma.nguoiDung.findMany({
      where: {
        vaiTro: 'HOC_SINH',
        hoSoHocSinh: {
          cacLopNam: {
            none: {
              lopNam: {
                namHocId: yearId
              }
            }
          }
        }
      },
      include: {
        hoSoHocSinh: true
      },
      orderBy: {
        hoTen: 'asc'
      }
    });
  }

  async addStudentsToClass(classId: number, studentIds: number[]) {
    // classId here is effectively the `LopNam` ID because we are adding to a specific class-year instance.
    // However, the frontend might be passing the generic `LopHoc` ID or the `LopNam` ID.
    // Based on the context (Classes within a Year), we should be operating on `LopNam`.
    // Let's assume classId passed here IS the `LopNam` ID (id of table lop_nam).

    // Verify LopNam exists
    const lopNam = await this.prisma.lopNam.findUnique({
      where: { id: classId },
      include: { namHoc: true }
    });

    if (!lopNam) {
      // It might be a LopHoc ID passed, let's try to find the LopNam for this LopHoc + NamHoc? 
      // But for "Add Student", we really need the specific LopNam instance.
      // Let's assume the controller will pass the valid LopNam ID.
      throw new Error(`Class (LopNam) with ID ${classId} not found.`);
    }

    // Logic: Ensure student isn't already in another class for this year?
    // The query 'getAvailable' excludes them, but we should double check or just try/catch unique constraint.
    // The Schema has @@unique([hocSinhId, lopNamId]), preventing dups in SAME class.
    // To prevent dups in SAME YEAR (different class), we rely on the `getAvailable` filter 
    // OR we could enforce it here for safety.

    // Let's enforce safety:
    const yearId = lopNam.namHocId;

    const studentsInYear = await this.prisma.hocSinhLopNam.findMany({
      where: {
        hocSinh: { userId: { in: studentIds } },
        lopNam: { namHocId: yearId }
      },
      select: { hocSinh: { select: { userId: true } } }
    });

    const invalidUserIds = studentsInYear.map(s => s.hocSinh.userId);
    const validUserIds = studentIds.filter(id => !invalidUserIds.includes(id));

    // We need 'hocSinhId' (from HoSoHocSinh table), not 'userId'.
    // The input `studentIds` are likely `userId` or `hoSoHocSinh.id`?
    // Frontend creates student with `userId`. Let's assume input is `userId`.
    // We need to map `userId` -> `hoSoHocSinh.id`.

    const profiles = await this.prisma.hoSoHocSinh.findMany({
      where: { userId: { in: validUserIds } },
      select: { id: true }
    });

    const createData = profiles.map(p => ({
      hocSinhId: p.id,
      lopNamId: classId,
      trangThai: 'DANG_HOC' as const // Enforce literal type
    }));

    if (createData.length === 0) {
      return { count: 0, message: 'No valid students to add (all already in a class for this year).' };
    }

    return this.prisma.hocSinhLopNam.createMany({
      data: createData
    });
  }

  updateLopHoc(id: number, dto: UpdateLopHocDto) {
    return this.prisma.lopHoc.update({ where: { id }, data: dto });
  }

  removeLopHoc(id: number) {
    return this.prisma.lopHoc.delete({ where: { id } });
  }

  async cloneClasses(fromNamHocId: number, toNamHocId: number) {
    // NEW LOGIC: Clone LopNam structure, not LopHoc
    // 1. Get all LopNam from source year
    const sourceLopNams = await this.prisma.lopNam.findMany({
      where: { namHocId: fromNamHocId },
      include: { lopHoc: true }
    });

    if (sourceLopNams.length === 0) {
      throw new Error("Không tìm thấy lớp học nào trong năm học nguồn.");
    }

    // 2. Create LopNam for target year (reuse same LopHoc)
    const dataToCreate = sourceLopNams.map(ln => ({
      lopId: ln.lopId,  // Reuse same class structure
      namHocId: toNamHocId,
      // Don't copy gvChuNhiemId - teachers reassigned each year
    }));

    // 3. Filter out existing to avoid duplicates
    const existing = await this.prisma.lopNam.findMany({
      where: { namHocId: toNamHocId }
    });
    const existingLopIds = new Set(existing.map(ln => ln.lopId));
    const finalData = dataToCreate.filter(d => !existingLopIds.has(d.lopId));

    if (finalData.length === 0) {
      return { count: 0, message: "Tất cả các lớp đã tồn tại trong năm học đích." };
    }

    return this.prisma.lopNam.createMany({
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

  // --- LopNam (ClassYear) ---
  createLopNam(dto: any) {
    return this.prisma.lopNam.create({
      data: dto,
      include: {
        lopHoc: true,
        namHoc: true,
        gvChuNhiem: true,
      }
    });
  }

  findAllLopNam(params: any = {}) {
    const { namHocId, ...otherParams } = params;
    const where: any = {};
    if (namHocId) {
      where.namHocId = parseInt(namHocId as string);
    }

    return this.prisma.lopNam.findMany({
      where,
      include: {
        lopHoc: true,
        namHoc: true,
        gvChuNhiem: true,
        _count: { select: { hocSinhs: true } }
      },
      orderBy: { id: 'desc' },
      ...otherParams,
    });
  }

  findOneLopNam(id: number) {
    return this.prisma.lopNam.findUnique({
      where: { id },
      include: {
        lopHoc: true,
        namHoc: true,
        gvChuNhiem: true,
        _count: { select: { hocSinhs: true } }
      },
    });
  }

  updateLopNam(id: number, dto: any) {
    return this.prisma.lopNam.update({
      where: { id },
      data: dto,
      include: {
        lopHoc: true,
        namHoc: true,
        gvChuNhiem: true,
      }
    });
  }

  removeLopNam(id: number) {
    return this.prisma.lopNam.delete({ where: { id } });
  }
}
