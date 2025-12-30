import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationController } from './controllers/notification.controller';
import { ChatController } from './controllers/chat.controller';
import { NotificationService } from './services/notification.service';
import { ChatService } from './services/chat.service';

@Module({
    imports: [PrismaModule],
    controllers: [NotificationController, ChatController],
    providers: [NotificationService, ChatService],
    exports: [NotificationService, ChatService],
})
export class CommunicationModule { }
