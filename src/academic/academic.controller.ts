import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { CreateNamHocDto } from './dto/create-nam-hoc.dto';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { CreateLopHocDto } from './dto/create-lop-hoc.dto';
import { UpdateNamHocDto } from './dto/update-nam-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { UpdateLopHocDto } from './dto/update-lop-hoc.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';

@Roles(VaiTro.ADMIN) // Only Admin can manage academic structure
// @Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) { }

  // --- NamHoc ---
  @Post('years')
  createNamHoc(@Body() createNamHocDto: CreateNamHocDto) {
    return this.academicService.createNamHoc(createNamHocDto);
  }

  @Get('years')
  findAllNamHoc() {
    return this.academicService.findAllNamHoc();
  }

  @Get('years/:id')
  findOneNamHoc(@Param('id') id: string) {
    return this.academicService.findOneNamHoc(+id);
  }

  @Put('years/:id')
  updateNamHoc(@Param('id') id: string, @Body() dto: UpdateNamHocDto) {
    return this.academicService.updateNamHoc(+id, dto);
  }

  @Delete('years/:id')
  removeNamHoc(@Param('id') id: string) {
    return this.academicService.removeNamHoc(+id);
  }

  // --- MonHoc ---
  @Post('subjects')
  createMonHoc(@Body() createMonHocDto: CreateMonHocDto) {
    return this.academicService.createMonHoc(createMonHocDto);
  }

  @Get('subjects')
  findAllMonHoc() {
    return this.academicService.findAllMonHoc();
  }

  @Get('subjects/:id')
  findOneMonHoc(@Param('id') id: string) {
    return this.academicService.findOneMonHoc(+id);
  }

  @Put('subjects/:id')
  updateMonHoc(@Param('id') id: string, @Body() dto: UpdateMonHocDto) {
    return this.academicService.updateMonHoc(+id, dto);
  }

  @Delete('subjects/:id')
  removeMonHoc(@Param('id') id: string) {
    return this.academicService.removeMonHoc(+id);
  }

  // --- LopHoc ---
  @Post('classes')
  createLopHoc(@Body() createLopHocDto: CreateLopHocDto) {
    return this.academicService.createLopHoc(createLopHocDto);
  }

  @Get('classes')
  findAllLopHoc() {
    return this.academicService.findAllLopHoc();
  }

  @Get('classes/:id')
  findOneLopHoc(@Param('id') id: string) {
    return this.academicService.findOneLopHoc(+id);
  }

  @Put('classes/:id')
  updateLopHoc(@Param('id') id: string, @Body() dto: UpdateLopHocDto) {
    return this.academicService.updateLopHoc(+id, dto);
  }

  @Delete('classes/:id')
  removeLopHoc(@Param('id') id: string) {
    return this.academicService.removeLopHoc(+id);
  }
}
