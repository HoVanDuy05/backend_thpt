import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { CreateNamHocDto } from './dto/create-nam-hoc.dto';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { CreateLopHocDto } from './dto/create-lop-hoc.dto';
import { UpdateNamHocDto } from './dto/update-nam-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { UpdateLopHocDto } from './dto/update-lop-hoc.dto';
import { CreateHocKyDto } from './dto/create-hoc-ky.dto';
import { UpdateHocKyDto } from './dto/update-hoc-ky.dto';
import { CreateLopNamDto } from './dto/create-lop-nam.dto';
import { UpdateLopNamDto } from './dto/update-lop-nam.dto';
import { CreateKhoiDto } from './dto/create-khoi.dto';
import { UpdateKhoiDto } from './dto/update-khoi.dto';
import { CreatePhanCongGvDto } from './dto/create-phan-cong-gv.dto';
import { UpdatePhanCongGvDto } from './dto/update-phan-cong-gv.dto';
import { CreateDiemDto } from './dto/create-diem.dto';
import { UpdateDiemDto } from './dto/update-diem.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // --- Khoi (Grades) ---
  @Post('grades')
  @Roles(VaiTro.ADMIN)
  createKhoi(@Body() createKhoiDto: CreateKhoiDto) {
    return this.academicService.createKhoi(createKhoiDto);
  }

  @Get('grades')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findAllKhoi() {
    return this.academicService.findAllKhoi();
  }

  @Get('grades/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findOneKhoi(@Param('id') id: string) {
    return this.academicService.findOneKhoi(+id);
  }

  @Put('grades/:id')
  @Roles(VaiTro.ADMIN)
  updateKhoi(@Param('id') id: string, @Body() updateKhoiDto: UpdateKhoiDto) {
    return this.academicService.updateKhoi(+id, updateKhoiDto);
  }

  @Delete('grades/:id')
  @Roles(VaiTro.ADMIN)
  removeKhoi(@Param('id') id: string) {
    return this.academicService.removeKhoi(+id);
  }

  // --- NamHoc ---
  @Post('classes/clone')
  @Roles(VaiTro.ADMIN)
  cloneClasses(@Body() body: { fromNamHocId: number; toNamHocId: number }) {
    return this.academicService.cloneClasses(
      body.fromNamHocId,
      body.toNamHocId,
    );
  }

  // --- LopNam (ClassYear) ---
  @Post('class-years')
  @Roles(VaiTro.ADMIN)
  createLopNam(@Body() createLopNamDto: CreateLopNamDto) {
    return this.academicService.createLopNam(createLopNamDto);
  }

  @Get('class-years')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findAllLopNam(@Query() query: any) {
    return this.academicService.findAllLopNam(query);
  }

  @Get('class-years/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findOneLopNam(@Param('id') id: string) {
    return this.academicService.findOneLopNam(+id);
  }

  @Put('class-years/:id')
  @Roles(VaiTro.ADMIN)
  updateLopNam(
    @Param('id') id: string,
    @Body() updateLopNamDto: UpdateLopNamDto,
  ) {
    return this.academicService.updateLopNam(+id, updateLopNamDto);
  }

  @Delete('class-years/:id')
  @Roles(VaiTro.ADMIN)
  removeLopNam(@Param('id') id: string) {
    return this.academicService.removeLopNam(+id);
  }

  @Post('years')
  @Roles(VaiTro.ADMIN)
  createNamHoc(@Body() createNamHocDto: CreateNamHocDto) {
    return this.academicService.createNamHoc(createNamHocDto);
  }

  @Get('years')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findAllNamHoc() {
    return this.academicService.findAllNamHoc();
  }

  @Get('years/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findOneNamHoc(@Param('id') id: string) {
    return this.academicService.findOneNamHoc(+id);
  }

  @Put('years/:id')
  @Roles(VaiTro.ADMIN)
  updateNamHoc(
    @Param('id') id: string,
    @Body() updateNamHocDto: UpdateNamHocDto,
  ) {
    return this.academicService.updateNamHoc(+id, updateNamHocDto);
  }

  @Delete('years/:id')
  @Roles(VaiTro.ADMIN)
  removeNamHoc(@Param('id') id: string) {
    return this.academicService.removeNamHoc(+id);
  }

  // --- HocKy ---
  @Post('semesters')
  @Roles(VaiTro.ADMIN)
  createHocKy(@Body() createHocKyDto: CreateHocKyDto) {
    return this.academicService.createHocKy(createHocKyDto);
  }

  @Get('semesters')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findAllHocKy(@Query() query: any) {
    return this.academicService.findAllHocKy(query);
  }

  @Get('semesters/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findOneHocKy(@Param('id') id: string) {
    return this.academicService.findOneHocKy(+id);
  }

  @Put('semesters/:id')
  @Roles(VaiTro.ADMIN)
  updateHocKy(@Param('id') id: string, @Body() updateHocKyDto: UpdateHocKyDto) {
    return this.academicService.updateHocKy(+id, updateHocKyDto);
  }

  @Delete('semesters/:id')
  @Roles(VaiTro.ADMIN)
  removeHocKy(@Param('id') id: string) {
    return this.academicService.removeHocKy(+id);
  }

  // --- MonHoc ---
  @Post('subjects')
  @Roles(VaiTro.ADMIN)
  createMonHoc(@Body() createMonHocDto: CreateMonHocDto) {
    return this.academicService.createMonHoc(createMonHocDto);
  }

  @Get('subjects')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findAllMonHoc() {
    return this.academicService.findAllMonHoc();
  }

  @Get('subjects/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findOneMonHoc(@Param('id') id: string) {
    return this.academicService.findOneMonHoc(+id);
  }

  @Put('subjects/:id')
  @Roles(VaiTro.ADMIN)
  updateMonHoc(
    @Param('id') id: string,
    @Body() updateMonHocDto: UpdateMonHocDto,
  ) {
    return this.academicService.updateMonHoc(+id, updateMonHocDto);
  }

  @Delete('subjects/:id')
  @Roles(VaiTro.ADMIN)
  removeMonHoc(@Param('id') id: string) {
    return this.academicService.removeMonHoc(+id);
  }

  // --- LopHoc ---
  @Post('classes')
  @Roles(VaiTro.ADMIN)
  createLopHoc(@Body() createLopHocDto: CreateLopHocDto) {
    return this.academicService.createLopHoc(createLopHocDto);
  }

  @Get('classes')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findAllLopHoc() {
    return this.academicService.findAllLopHoc();
  }

  @Get('classes/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findOneLopHoc(@Param('id') id: string) {
    return this.academicService.findOneLopHoc(+id);
  }

  @Put('classes/:id')
  @Roles(VaiTro.ADMIN)
  updateLopHoc(
    @Param('id') id: string,
    @Body() updateLopHocDto: UpdateLopHocDto,
  ) {
    return this.academicService.updateLopHoc(+id, updateLopHocDto);
  }

  @Delete('classes/:id')
  @Roles(VaiTro.ADMIN)
  removeLopHoc(@Param('id') id: string) {
    return this.academicService.removeLopHoc(+id);
  }

  // --- PhanCongGv (Teacher Assignments) ---
  @Post('assignments')
  @Roles(VaiTro.ADMIN)
  createPhanCongGv(@Body() dto: CreatePhanCongGvDto) {
    return this.academicService.createPhanCongGv(dto);
  }

  @Get('assignments')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  findAllPhanCongGv(@Query() query: any) {
    return this.academicService.findAllPhanCongGv(query);
  }

  @Get('assignments/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  findOnePhanCongGv(@Param('id') id: string) {
    return this.academicService.findOnePhanCongGv(+id);
  }

  @Put('assignments/:id')
  @Roles(VaiTro.ADMIN)
  updatePhanCongGv(@Param('id') id: string, @Body() dto: UpdatePhanCongGvDto) {
    return this.academicService.updatePhanCongGv(+id, dto);
  }

  @Delete('assignments/:id')
  @Roles(VaiTro.ADMIN)
  removePhanCongGv(@Param('id') id: string) {
    return this.academicService.removePhanCongGv(+id);
  }

  // --- Diem (Grades) ---
  @Post('grades-records')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  createDiem(@Body() dto: CreateDiemDto) {
    return this.academicService.createDiem(dto);
  }

  @Get('grades-records')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findAllDiem(@Query() query: any) {
    return this.academicService.findAllDiem(query);
  }

  @Get('grades-records/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN, VaiTro.HOC_SINH)
  findOneDiem(@Param('id') id: string) {
    return this.academicService.findOneDiem(+id);
  }

  @Put('grades-records/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  updateDiem(@Param('id') id: string, @Body() dto: UpdateDiemDto) {
    return this.academicService.updateDiem(+id, dto);
  }

  @Delete('grades-records/:id')
  @Roles(VaiTro.ADMIN)
  removeDiem(@Param('id') id: string) {
    return this.academicService.removeDiem(+id);
  }

  // --- Student Management ---
  @Get('years/:yearId/available-students')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  getAvailableStudentsForYear(@Param('yearId') yearId: string) {
    return this.academicService.getAvailableStudentsForYear(+yearId);
  }

  @Post('classes/:classId/students')
  @Roles(VaiTro.ADMIN)
  addStudentsToClass(
    @Param('classId') classId: string,
    @Body() body: { studentIds: number[] },
  ) {
    return this.academicService.addStudentsToClass(+classId, body.studentIds);
  }
}
