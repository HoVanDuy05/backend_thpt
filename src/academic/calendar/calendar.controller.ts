import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto, UpdateCalendarDto } from './calendar.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) { }

  @Post()
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  create(@Body() data: CreateCalendarDto) {
    return this.calendarService.create(data);
  }

  @Get()
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('lopNamId') lopNamId?: string,
  ) {
    return this.calendarService.findAll({
      from,
      to,
      lopNamId: lopNamId ? +lopNamId : undefined,
    });
  }

  @Get('lopnam/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  findByLopNam(@Param('id') id: string) {
    return this.calendarService.findByLopNam(+id);
  }

  @Get('teacher/:id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  findByTeacher(@Param('id') id: string) {
    return this.calendarService.findByTeacher(+id);
  }

  @Get('student/my-schedule')
  @Roles(VaiTro.HOC_SINH)
  findMySchedule(
    @GetUser('userId') userId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('namHocId') namHocId?: string,
  ) {
    return this.calendarService.findByStudent({
      userId,
      from,
      to,
      namHocId: namHocId ? +namHocId : undefined,
    });
  }

  @Get(':id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(+id);
  }

  @Patch(':id')
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  update(@Param('id') id: string, @Body() data: UpdateCalendarDto) {
    return this.calendarService.update(+id, data);
  }

  @Delete(':id')
  @Roles(VaiTro.ADMIN)
  remove(@Param('id') id: string) {
    return this.calendarService.remove(+id);
  }
}
