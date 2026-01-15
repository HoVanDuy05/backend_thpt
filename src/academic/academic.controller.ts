import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { CreateNamHocDto } from './dto/create-nam-hoc.dto';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { CreateLopHocDto } from './dto/create-lop-hoc.dto';
import { UpdateNamHocDto } from './dto/update-nam-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { UpdateLopHocDto } from './dto/update-lop-hoc.dto';
import { CreateHocKyDto } from './dto/create-hoc-ky.dto';
import { UpdateHocKyDto } from './dto/update-hoc-ky.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) { }

  // --- NamHoc ---
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
  updateNamHoc(@Param('id') id: string, @Body() updateNamHocDto: UpdateNamHocDto) {
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
  findAllHocKy() {
    return this.academicService.findAllHocKy();
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
  updateMonHoc(@Param('id') id: string, @Body() updateMonHocDto: UpdateMonHocDto) {
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
  updateLopHoc(@Param('id') id: string, @Body() updateLopHocDto: UpdateLopHocDto) {
    return this.academicService.updateLopHoc(+id, updateLopHocDto);
  }

  @Delete('classes/:id')
  @Roles(VaiTro.ADMIN)
  removeLopHoc(@Param('id') id: string) {
    return this.academicService.removeLopHoc(+id);
  }
}
