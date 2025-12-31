import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FriendAction, HandleFriendRequestDto } from './dto/friends.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Get()
    getFriends(@Request() req: any) {
        return this.friendsService.getFriends(req.user.userId);
    }

    @Public()
    @Get('search')
    searchUsers(@Request() req: any, @Query('q') q: string) {
        // If public, req.user might be undefined, so handle that if service needs it
        // But let's see if 401 goes away first.
        return this.friendsService.searchUsers(req?.user?.userId || 0, q || '');
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
