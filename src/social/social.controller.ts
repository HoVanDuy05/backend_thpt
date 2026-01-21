import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendsService } from '../users/friends/friends.service';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly friendsService: FriendsService,
  ) {}

  @Post('threads')
  createThread(@Request() req: any, @Body() data: any) {
    return this.socialService.createThread(req.user.userId, data);
  }

  @Get('feed')
  getFeed(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.socialService.getFeed(
      req.user.userId,
      limit ? +limit : 20,
      cursor ? +cursor : undefined,
    );
  }

  @Get('threads/:id')
  getThread(@Request() req: any, @Param('id') id: string) {
    return this.socialService.getThreadDetail(+id, req.user?.userId);
  }

  @Post('threads/:id/like')
  like(@Request() req: any, @Param('id') id: string) {
    return this.socialService.toggleLike(req.user.userId, +id);
  }

  @Post('users/:id/follow')
  follow(@Request() req: any, @Param('id') id: string) {
    return this.socialService.toggleFollow(req.user.userId, +id);
  }

  @Get('users/:id/threads')
  getUserThreads(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.socialService.getUserThreads(
      +id,
      req.user?.userId,
      limit ? +limit : 20,
      cursor ? +cursor : undefined,
    );
  }

  @Get('search')
  searchThreads(
    @Request() req: any,
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    return this.socialService.searchThreads(
      q || '',
      req.user?.userId,
      limit ? +limit : 20,
    );
  }

  @Get('activity')
  getActivity(@Request() req: any, @Query('limit') limit?: string) {
    return this.socialService.getActivity(req.user.userId, limit ? +limit : 20);
  }

  @Get('profile/:id')
  getSocialProfile(@Request() req: any, @Param('id') id: string) {
    return this.socialService.getUserSocialProfile(+id, req.user?.userId);
  }

  @Get('trending')
  getTrending() {
    return this.socialService.getTrending();
  }

  @Get('suggested-users')
  getSuggestedUsers(@Request() req: any, @Query('limit') limit?: string) {
    return this.socialService.getSuggestedUsers(
      req.user.userId,
      limit ? +limit : 5,
    );
  }

  // Friend Requests endpoints
  @Get('friend-requests/received')
  getReceivedFriendRequests(@Request() req: any) {
    return this.friendsService.getPendingRequests(req.user.userId);
  }

  @Get('friend-requests/sent')
  getSentFriendRequests(@Request() req: any) {
    return this.friendsService.getSentRequests(req.user.userId);
  }
}
