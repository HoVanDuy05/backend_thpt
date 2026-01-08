import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY') || 'BLwohOk-X447v2Y097jpn9f6QHAZh6pQAptJ-UMHmjjdDVUqWk3x8zBSG7j1N5NpHzCDA6zc_Wfq-I3HHUgOWXw';
        const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
        const email = this.configService.get<string>('VAPID_EMAIL') || 'mailto:admin@thpt-nguyenhue.edu.vn';

        if (publicKey && privateKey) {
            webpush.setVapidDetails(email, publicKey, privateKey);
            this.logger.log('VAPID details configured successfully.');
        } else {
            this.logger.warn('VAPID keys (especially private key) are not fully configured. Background push notifications may not reach users.');
        }
    }

    async sendPushNotification(userId: number, payload: { title: string; body: string; icon?: string; url?: string }) {
        const subscriptions = await this.prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            return;
        }

        const pushPayload = JSON.stringify({
            notification: {
                title: payload.title,
                body: payload.body,
                icon: payload.icon || '/favicon.png',
                data: {
                    url: payload.url || '/',
                },
            },
        });

        const tasks = subscriptions.map((sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            return webpush.sendNotification(pushSubscription, pushPayload).catch(async (error) => {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    this.logger.log(`Subscription for user ${userId} expired or not found. Removing from DB.`);
                    await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
                } else {
                    this.logger.error(`Error sending push notification to user ${userId}:`, error);
                }
            });
        });

        await Promise.all(tasks);
    }
}
