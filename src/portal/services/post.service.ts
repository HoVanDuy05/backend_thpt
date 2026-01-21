import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';
import { LoaiBaiViet } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return (
      slugify(title, { lower: true, strict: true, locale: 'vi' }) +
      '-' +
      Date.now()
    );
  }

  async create(userId: number, createPostDto: CreatePostDto) {
    const slug =
      createPostDto.duongDan || this.generateSlug(createPostDto.tieuDe);
    return this.prisma.baiViet.create({
      data: {
        ...createPostDto,
        duongDan: slug,
        nguoiTaoId: userId,
      },
    });
  }

  async findAll(
    activeOnly: boolean = false,
    type?: LoaiBaiViet,
    role?: string,
  ) {
    const whereClause: any = {};
    if (activeOnly) {
      whereClause.daXuatBan = true;
    }
    if (type) {
      whereClause.loai = type;
    }

    if (role) {
      // Filter posts where doiTuong includes the role OR doiTuong is null (public)
      whereClause.OR = [
        { doiTuong: { path: '$', array_contains: role } },
        { doiTuong: null },
      ];
    }

    return this.prisma.baiViet.findMany({
      where: whereClause,
      orderBy: { ngayTao: 'desc' },
      include: {
        nguoiTao: {
          select: {
            id: true,
            taiKhoan: true,
            hoSoGiaoVien: { select: { hoTen: true } },
          },
        },
      },
    });
  }

  async findOne(slugOrId: string) {
    let whereClause: any = {};
    if (!isNaN(Number(slugOrId))) {
      whereClause = { id: Number(slugOrId) };
    } else {
      whereClause = { duongDan: slugOrId };
    }

    const post = await this.prisma.baiViet.findFirst({
      // Changed to findFirst to allow OR logic if needed, but here simple findUnique/findFirst
      where: whereClause,
      include: {
        nguoiTao: {
          select: {
            id: true,
            taiKhoan: true,
            hoSoGiaoVien: { select: { hoTen: true } },
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    // Increment view count if accessed publicly (logic can be refined)
    await this.prisma.baiViet.update({
      where: { id: post.id },
      data: { luotXem: { increment: 1 } },
    });

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.baiViet.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.baiViet.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: number) {
    return this.prisma.baiViet.delete({
      where: { id },
    });
  }
}
