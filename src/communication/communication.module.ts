import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationController } from './controllers/notification.controller';
import { ChatController } from './controllers/chat.controller';
import { NotificationService } from './services/notification.service';
import { ChatService } from './services/chat.service';
import { WebsocketGateway } from './websocket.gateway';

@Module({
    imports: [PrismaModule, JwtModule],
    controllers: [NotificationController, ChatController],
    providers: [NotificationService, ChatService, WebsocketGateway],
    exports: [NotificationService, ChatService, WebsocketGateway],
})
export class CommunicationModule { }
