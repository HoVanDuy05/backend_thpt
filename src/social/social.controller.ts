import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
    constructor(private readonly socialService: SocialService) { }

    @Post('threads')
    createThread(@Request() req: any, @Body() data: any) {
        return this.socialService.createThread(req.user.id, data);
    }

    @Get('feed')
    getFeed(@Request() req: any, @Query('limit') limit?: string, @Query('cursor') cursor?: string) {
        return this.socialService.getFeed(req.user.id, limit ? +limit : 20, cursor ? +cursor : undefined);
    }

    @Get('threads/:id')
    getThread(@Param('id') id: string) {
        return this.socialService.getThreadDetail(+id);
    }

    @Post('threads/:id/like')
    like(@Request() req: any, @Param('id') id: string) {
        return this.socialService.toggleLike(req.user.id, +id);
    }

    @Post('users/:id/follow')
    follow(@Request() req: any, @Param('id') id: string) {
        return this.socialService.toggleFollow(req.user.id, +id);
    }

    @Get('users/:id/threads')
    getUserThreads(@Param('id') id: string, @Query('limit') limit?: string, @Query('cursor') cursor?: string) {
        return this.socialService.getUserThreads(+id, limit ? +limit : 20, cursor ? +cursor : undefined);
    }

    @Get('search')
    searchThreads(@Query('q') q: string, @Query('limit') limit?: string) {
        return this.socialService.searchThreads(q || '', limit ? +limit : 20);
    }

    @Get('activity')
    getActivity(@Request() req: any, @Query('limit') limit?: string) {
        return this.socialService.getActivity(req.user.id, limit ? +limit : 20);
    }
}
