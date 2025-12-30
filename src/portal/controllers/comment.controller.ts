import { Controller, Get, Post, Body, Param, Delete, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/comment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { VaiTro } from '@prisma/client';

@ApiTags('Portal - Comments')
@Controller('portal/comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Viết bình luận' })
    create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
        return this.commentService.create(req.user.id, createCommentDto);
    }

    @Get('post/:postId')
    @Public()
    @ApiOperation({ summary: 'Lấy bình luận theo bài viết' })
    findByPostId(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentService.findByPostId(postId);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa bình luận' })
    remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        const isAdmin = req.user.role === VaiTro.ADMIN;
        return this.commentService.remove(id, req.user.id, isAdmin);
    }
}
