import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { VaiTroToChuc } from '@prisma/client';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

    async create(createOrganizationDto: CreateOrganizationDto) {
        const existing = await this.prisma.toChuc.findUnique({
            where: { ma: createOrganizationDto.ma },
        });

        if (existing) {
            throw new ConflictException('Mã tổ chức đã tồn tại');
        }

        return this.prisma.toChuc.create({
            data: createOrganizationDto,
        });
    }

    async findAll() {
        return this.prisma.toChuc.findMany({
            include: {
                _count: {
                    select: { thanhViens: true },
                },
            },
            orderBy: { ngayTao: 'desc' },
        });
    }

    async findOne(id: number) {
        const org = await this.prisma.toChuc.findUnique({
            where: { id },
            include: {
                thanhViens: {
                    include: {
                        nguoiDung: {
                            select: {
                                id: true,
                                hoTen: true,
                                email: true,
                                avatar: true,
                                vaiTro: true,
                            },
                        },
                    },
                },
            },
        });

        if (!org) {
            throw new NotFoundException('Không tìm thấy tổ chức');
        }

        return org;
    }

    async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
        await this.findOne(id);

        if (updateOrganizationDto.ma) {
            const existing = await this.prisma.toChuc.findFirst({
                where: { ma: updateOrganizationDto.ma, NOT: { id } },
            });
            if (existing) {
                throw new ConflictException('Mã tổ chức đã tồn tại');
            }
        }

        return this.prisma.toChuc.update({
            where: { id },
            data: updateOrganizationDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.toChuc.delete({ where: { id } });
    }

    // Membership Management
    async addMember(toChucId: number, addMemberDto: AddMemberDto) {
        await this.findOne(toChucId);

        const existingMember = await this.prisma.thanhVienToChuc.findUnique({
            where: {
                toChucId_nguoiDungId: {
                    toChucId,
                    nguoiDungId: addMemberDto.userId,
                },
            },
        });

        if (existingMember) {
            throw new ConflictException('Người dùng đã là thành viên của tổ chức này');
        }

        return this.prisma.thanhVienToChuc.create({
            data: {
                toChucId,
                nguoiDungId: addMemberDto.userId,
                vaiTroTrongToChuc: addMemberDto.vaiTroTrongToChuc || VaiTroToChuc.THANH_VIEN,
            },
        });
    }

    async removeMember(toChucId: number, userId: number) {
        const existingMember = await this.prisma.thanhVienToChuc.findUnique({
            where: {
                toChucId_nguoiDungId: {
                    toChucId,
                    nguoiDungId: userId,
                },
            },
        });

        if (!existingMember) {
            throw new NotFoundException('Thành viên không tồn tại trong tổ chức này');
        }

        return this.prisma.thanhVienToChuc.delete({
            where: {
                toChucId_nguoiDungId: {
                    toChucId,
                    nguoiDungId: userId,
                },
            },
        });
    }

    async updateMemberRole(toChucId: number, userId: number, vaiTro: VaiTroToChuc) {
        const existingMember = await this.prisma.thanhVienToChuc.findUnique({
            where: {
                toChucId_nguoiDungId: {
                    toChucId,
                    nguoiDungId: userId,
                },
            },
        });

        if (!existingMember) {
            throw new NotFoundException('Thành viên không tồn tại trong tổ chức này');
        }

        return this.prisma.thanhVienToChuc.update({
            where: {
                toChucId_nguoiDungId: {
                    toChucId,
                    nguoiDungId: userId,
                },
            },
            data: { vaiTroTrongToChuc: vaiTro },
        });
    }
}
