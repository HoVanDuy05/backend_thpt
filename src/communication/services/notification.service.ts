import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    async create(createNotificationDto: CreateNotificationDto) {
        return this.prisma.thongBao.create({
            data: createNotificationDto,
        });
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
        return this.prisma.thongBao.deleteMany({ // deleteMany ensures ownership check implicitly with where
            where: { id, nguoiNhanId: userId },
        });
    }
}
