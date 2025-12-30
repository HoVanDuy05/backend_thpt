import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from '../dto/comment.dto';

@Injectable()
export class CommentService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createCommentDto: CreateCommentDto) {
        return this.prisma.binhLuan.create({
            data: {
                ...createCommentDto,
                nguoiDungId: userId,
            },
            include: {
                nguoiDung: {
                    select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true, maSoHs: true } }, hoSoGiaoVien: { select: { hoTen: true } } }
                }
            }
        });
    }

    async findByPostId(postId: number) {
        return this.prisma.binhLuan.findMany({
            where: { baiVietId: postId },
            orderBy: { ngayTao: 'asc' },
            include: {
                nguoiDung: {
                    select: { id: true, taiKhoan: true, hoSoHocSinh: { select: { hoTen: true } }, hoSoGiaoVien: { select: { hoTen: true } } }
                }
            }
        });
    }

    async remove(id: number, userId: number, isAdmin: boolean) {
        const comment = await this.prisma.binhLuan.findUnique({ where: { id } });
        if (!comment) throw new NotFoundException('Comment not found');

        if (!isAdmin && comment.nguoiDungId !== userId) {
            throw new NotFoundException('You can only delete your own comments');
        }

        return this.prisma.binhLuan.delete({ where: { id } });
    }
}
