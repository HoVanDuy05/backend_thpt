import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from '../dto/notification.dto';
import { PushService } from '../../common/push/push.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.thongBao.create({
      data: createNotificationDto,
    });

    // Trigger background push
    try {
      await this.pushService.sendPushNotification(
        createNotificationDto.nguoiNhanId,
        {
          title: createNotificationDto.tieuDe,
          body: createNotificationDto.noiDung,
          url: createNotificationDto.lienKet,
        },
      );
    } catch (error) {
      console.error('Failed to trigger background push:', error);
    }

    return notification;
  }

  async findByUser(userId: number) {
    return this.prisma.thongBao.findMany({
      where: { nguoiNhanId: userId },
      orderBy: { ngayTao: 'desc' },
    });
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.thongBao.updateMany({
      where: { id, nguoiNhanId: userId },
      data: { daDoc: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.thongBao.updateMany({
      where: { nguoiNhanId: userId, daDoc: false },
      data: { daDoc: true },
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.thongBao.deleteMany({
      // deleteMany ensures ownership check implicitly with where
      where: { id, nguoiNhanId: userId },
    });
  }
}
