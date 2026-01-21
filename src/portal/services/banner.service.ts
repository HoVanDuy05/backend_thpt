import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path if needed
import { CreateBannerDto, UpdateBannerDto } from '../dto/banner.dto';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  async create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  async findAll(activeOnly: boolean = false) {
    return this.prisma.banner.findMany({
      where: activeOnly ? { kichHoat: true } : {},
      orderBy: { thuTu: 'asc' },
    });
  }

  async findOne(id: number) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async update(id: number, updateBannerDto: UpdateBannerDto) {
    await this.findOne(id);
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
