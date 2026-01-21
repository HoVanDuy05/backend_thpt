import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BannerService } from '../services/banner.service';
import { CreateBannerDto, UpdateBannerDto } from '../dto/banner.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Portal - Banners')
@Controller('portal/banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(VaiTro.ADMIN)
  @ApiOperation({ summary: 'Tạo banner mới (Admin only)' })
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannerService.create(createBannerDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách banner (Public)' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.bannerService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết banner' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(VaiTro.ADMIN)
  @ApiOperation({ summary: 'Cập nhật banner (Admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    return this.bannerService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(VaiTro.ADMIN)
  @ApiOperation({ summary: 'Xóa banner (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.remove(id);
  }
}
