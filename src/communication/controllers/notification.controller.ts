import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dto/notification.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';

@ApiTags('Communication - Notifications')
@Controller('communication/notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
  @ApiOperation({ summary: 'Gửi thông báo (Admin/GiaoVien)' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy thông báo cá nhân' })
  findAll(@Request() req) {
    return this.notificationService.findByUser(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc một thông báo' })
  markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu đã đọc tất cả' })
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.remove(id, req.user.id);
  }
}
