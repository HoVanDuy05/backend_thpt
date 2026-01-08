import { Body, Controller, Delete, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Push Notifications')
@Controller('communication/push')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PushController {
    constructor(private prisma: PrismaService) { }

    @Post('subscribe')
    @ApiOperation({ summary: 'Subscribe to push notifications' })
    async subscribe(@Request() req, @Body() subscription: any) {
        const userId = Number(req.user?.userId);
        const { endpoint, keys, thietBi } = subscription;

        // Check if subscription already exists
        const existing = await this.prisma.pushSubscription.findFirst({
            where: { userId, endpoint }
        });

        if (existing) {
            return { message: 'Already subscribed' };
        }

        return this.prisma.pushSubscription.create({
            data: {
                userId,
                endpoint,
                p256dh: keys?.p256dh || subscription.p256dh,
                auth: keys?.auth || subscription.auth,
                thietBi: thietBi || 'Unknown Device',
            },
        });
    }

    @Post('unsubscribe')
    @ApiOperation({ summary: 'Unsubscribe from push notifications' })
    async unsubscribe(@Request() req, @Body('endpoint') endpoint: string) {
        const userId = Number(req.user?.userId);
        return this.prisma.pushSubscription.deleteMany({
            where: { userId, endpoint },
        });
    }

    @Get('status')
    @ApiOperation({ summary: 'Check push subscription status' })
    async status(@Request() req) {
        const userId = Number(req.user?.userId);
        const count = await this.prisma.pushSubscription.count({
            where: { userId },
        });
        return { isSubscribed: count > 0 };
    }
}
