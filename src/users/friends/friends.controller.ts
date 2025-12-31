import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FriendAction, HandleFriendRequestDto } from './dto/friends.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Get()
    getFriends(@Request() req: any) {
        return this.friendsService.getFriends(req.user.userId);
    }

    @Get('search')
    searchUsers(@Request() req: any, @Query('q') q: string) {
        return this.friendsService.searchUsers(req.user.userId, q || '');
    }

    @Get('pending')
    getPending(@Request() req: any) {
        return this.friendsService.getPendingRequests(req.user.userId);
    }

    @Get('status/:id')
    getStatus(@Request() req: any, @Param('id') targetId: string) {
        return this.friendsService.checkStatus(req.user.userId, +targetId);
    }

    @Post('request/:id')
    sendRequest(@Request() req: any, @Param('id') receiverId: string) {
        return this.friendsService.sendRequest(req.user.userId, +receiverId);
    }

    @Put('request/:id')
    handleRequest(
        @Request() req: any,
        @Param('id') requesterId: string,
        @Body() body: HandleFriendRequestDto
    ) {
        if (body.action === FriendAction.ACCEPT) {
            return this.friendsService.acceptRequest(req.user.userId, +requesterId);
        } else if (body.action === FriendAction.DECLINE) {
            return this.friendsService.declineRequest(req.user.userId, +requesterId);
        } else if (body.action === FriendAction.CANCEL) {
            return this.friendsService.cancelRequest(req.user.userId, +requesterId);
        }
    }

    @Delete(':id')
    unfriend(@Request() req: any, @Param('id') friendId: string) {
        return this.friendsService.unfriend(req.user.userId, +friendId);
    }
}
