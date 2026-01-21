import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Prisma } from '@prisma/client';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() data: Prisma.LichHocCreateInput) {
    return this.calendarService.create(data);
  }

  @Get()
  findAll() {
    return this.calendarService.findAll();
  }

  @Get('class/:id')
  findByClass(@Param('id') id: string) {
    return this.calendarService.findByClass(+id);
  }

  @Get('teacher/:id')
  findByTeacher(@Param('id') id: string) {
    return this.calendarService.findByTeacher(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.LichHocUpdateInput) {
    return this.calendarService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarService.remove(+id);
  }
}
