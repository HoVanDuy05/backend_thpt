import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FriendAction, HandleFriendRequestDto } from './dto/friends.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Get()
    getFriends(@Request() req: any) {
        return this.friendsService.getFriends(req.user.id);
    }

    @Get('pending')
    getPending(@Request() req: any) {
        return this.friendsService.getPendingRequests(req.user.id);
    }

    @Get('status/:id')
    getStatus(@Request() req: any, @Param('id') targetId: string) {
        return this.friendsService.checkStatus(req.user.id, +targetId);
    }

    @Post('request/:id')
    sendRequest(@Request() req: any, @Param('id') receiverId: string) {
        return this.friendsService.sendRequest(req.user.id, +receiverId);
    }

    @Put('request/:id')
    handleRequest(
        @Request() req: any,
        @Param('id') requesterId: string,
        @Body() body: HandleFriendRequestDto
    ) {
        if (body.action === FriendAction.ACCEPT) {
            return this.friendsService.acceptRequest(req.user.id, +requesterId);
        } else if (body.action === FriendAction.DECLINE) {
            return this.friendsService.declineRequest(req.user.id, +requesterId);
        } else if (body.action === FriendAction.CANCEL) {
            // In case the sender wants to cancel
            return this.friendsService.cancelRequest(req.user.id, +requesterId);
        }
    }

    @Delete(':id')
    unfriend(@Request() req: any, @Param('id') friendId: string) {
        return this.friendsService.unfriend(req.user.id, +friendId);
    }
}
