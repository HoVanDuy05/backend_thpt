import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: false,
    },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<number, string> = new Map();
    private userLastSeen: Map<number, string> = new Map();

    constructor(private jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync(token);
            const userId = Number(payload?.sub);

            if (!userId || Number.isNaN(userId)) {
                console.error('WebSocket authentication failed: invalid token payload.sub');
                client.disconnect();
                return;
            }

            this.userSockets.set(userId, client.id);
            client.data.userId = userId;

            // Join user-specific room for multi-device support
            client.join(`user:${userId}`);

            this.server.emit('presence:update', {
                userId,
                online: true,
                lastSeen: this.userLastSeen.get(userId) || null,
            });

            console.log(`User ${userId} connected with socket ${client.id}`);
        } catch (error) {
            console.error('WebSocket authentication failed:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.userSockets.delete(userId);
            const lastSeen = new Date().toISOString();
            this.userLastSeen.set(userId, lastSeen);

            this.server.emit('presence:update', {
                userId,
                online: false,
                lastSeen,
            });
            console.log(`User ${userId} disconnected`);
        }
    }

    @SubscribeMessage('join:channel')
    handleJoinChannel(
        @ConnectedSocket() client: Socket,
        @MessageBody() channelId: number,
    ) {
        client.join(`channel:${channelId}`);
        console.log(`User ${client.data.userId} joined channel ${channelId}`);
    }

    @SubscribeMessage('leave:channel')
    handleLeaveChannel(
        @ConnectedSocket() client: Socket,
        @MessageBody() channelId: number,
    ) {
        client.leave(`channel:${channelId}`);
        console.log(`User ${client.data.userId} left channel ${channelId}`);
    }

    @SubscribeMessage('typing:start')
    handleTypingStart(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: number; userName: string },
    ) {
        client.to(`channel:${data.channelId}`).emit('typing:start', {
            userId: client.data.userId,
            userName: data.userName,
        });
    }

    @SubscribeMessage('typing:stop')
    handleTypingStop(
        @ConnectedSocket() client: Socket,
        @MessageBody() channelId: number,
    ) {
        client.to(`channel:${channelId}`).emit('typing:stop', {
            userId: client.data.userId,
        });
    }

    @SubscribeMessage('message:delivered')
    handleMessageDelivered(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: number; messageId: number },
    ) {
        if (!data?.channelId || !data?.messageId) return;

        this.server.to(`channel:${data.channelId}`).emit('message:delivered', {
            channelId: data.channelId,
            messageId: data.messageId,
            userId: client.data.userId,
            at: new Date().toISOString(),
        });
    }

    @SubscribeMessage('message:seen')
    handleMessageSeen(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: number; messageId: number },
    ) {
        if (!data?.channelId || !data?.messageId) return;

        this.server.to(`channel:${data.channelId}`).emit('message:seen', {
            channelId: data.channelId,
            messageId: data.messageId,
            userId: client.data.userId,
            at: new Date().toISOString(),
        });
    }

    // Emit events from services
    emitNewMessage(channelId: number, message: any) {
        // Emit to channel room (active listeners)
        this.server.to(`channel:${channelId}`).emit('message:new', message);
    }

    emitMessageRead(channelId: number, data: any) {
        this.server.to(`channel:${channelId}`).emit('message:read', data);
    }

    emitNewThread(thread: any) {
        this.server.emit('thread:new', thread);
    }

    emitThreadLike(threadId: number, data: any) {
        this.server.emit('thread:like', { threadId, ...data });
    }

    emitThreadReply(threadId: number, reply: any) {
        this.server.emit('thread:reply', { threadId, reply });
    }

    emitToUser(userId: number, event: string, data: any) {
        // Emit to all devices of this user
        this.server.to(`user:${userId}`).emit(event, data);
    }
}
