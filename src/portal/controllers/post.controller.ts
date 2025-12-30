import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { LoaiBaiViet, VaiTro } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { ExportService } from '../../common/export/export.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@ApiTags('Portal - Posts')
@Controller('portal/posts')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly exportService: ExportService,
    ) { }

    @Post()
    @ApiBearerAuth()
    @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
    @ApiOperation({ summary: 'Tạo bài viết mới (Admin/GiaoVien)' })
    create(@Request() req, @Body() createPostDto: CreatePostDto) {
        return this.postService.create(req.user.id, createPostDto);
    }

    @Get('export')
    @ApiBearerAuth()
    @Roles(VaiTro.ADMIN)
    @ApiOperation({ summary: 'Xuất danh sách bài viết ra Excel' })
    async exportPosts(@Res() res: Response) {
        const posts = await this.postService.findAll(false);
        const columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Tiêu đề', key: 'tieuDe', width: 50 },
            { header: 'Loại', key: 'loai', width: 15 },
            { header: 'Đã xuất bản', key: 'daXuatBan', width: 15 },
            { header: 'Ngày tạo', key: 'ngayTao', width: 20 },
        ];
        return this.exportService.exportToExcel(posts, columns, 'BaiViet', res, 'danh-sach-bai-viet');
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Lấy danh sách bài viết' })
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
    @ApiQuery({ name: 'type', required: false, enum: LoaiBaiViet })
    findAll(@Query('activeOnly') activeOnly?: string, @Query('type') type?: LoaiBaiViet) {
        return this.postService.findAll(activeOnly === 'true', type);
    }

    @Get(':slugOrId')
    @Public()
    @ApiOperation({ summary: 'Lấy chi tiết bài viết (theo ID hoặc Slug)' })
    findOne(@Param('slugOrId') slugOrId: string) {
        return this.postService.findOne(slugOrId);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @Roles(VaiTro.ADMIN, VaiTro.GIAO_VIEN)
    @ApiOperation({ summary: 'Cập nhật bài viết' })
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postService.update(+id, updatePostDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(VaiTro.ADMIN)
    @ApiOperation({ summary: 'Xóa bài viết' })
    remove(@Param('id') id: string) {
        return this.postService.remove(+id);
    }
}
