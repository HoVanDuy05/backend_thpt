import { Controller, Get, Post, Body, Param, Request, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { CreateChannelDto, CreateMessageDto } from '../dto/chat.dto';

@ApiTags('Communication - Chat')
@Controller('communication/chat')
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('channels')
    @ApiOperation({ summary: 'Tạo kênh chat mới' })
    createChannel(@Request() req, @Body() createChannelDto: CreateChannelDto) {
        return this.chatService.createChannel(req.user.userId, createChannelDto);
    }

    @Get('channels')
    @ApiOperation({ summary: 'Lấy danh sách kênh chat của tôi' })
    getUserChannels(@Request() req) {
        return this.chatService.getUserChannels(req.user.userId);
    }

    @Get('channels/:id/messages')
    @ApiOperation({ summary: 'Lấy tin nhắn trong kênh' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    getMessages(@Request() req, @Param('id', ParseIntPipe) id: number, @Query('page') page?: number) {
        return this.chatService.getMessages(id, req.user.userId, page || 1);
    }

    @Post('messages')
    @ApiOperation({ summary: 'Gửi tin nhắn' })
    sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
        return this.chatService.sendMessage(req.user.userId, createMessageDto);
    }
}
