import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { GradingService } from './grading.service';
import { CreateGradingDto } from './dto/create-grading.dto';
import { UpdateGradingDto } from './dto/update-grading.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';

@Roles(VaiTro.GIAO_VIEN) // Only Teachers grade
// @Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post()
  create(@Body() dto: CreateGradingDto) {
    return this.gradingService.create(dto);
  }

  @Get()
  findAll() {
    return this.gradingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradingService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGradingDto) {
    return this.gradingService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradingService.remove(+id);
  }
}
