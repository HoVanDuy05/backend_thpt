import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { VaiTroToChuc, LoaiToChuc } from '@prisma/client';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

    async create(createOrganizationDto: CreateOrganizationDto) {
        if (!createOrganizationDto.ma) {
            const prefix = 'NH';
            let typeCode = 'KH';
            switch (createOrganizationDto.loaiToChuc) {
                case LoaiToChuc.CHUYEN_MON:
                    typeCode = 'CM';
                    break;
                case LoaiToChuc.HANH_CHINH:
                    typeCode = 'HC';
                    break;
                case LoaiToChuc.DOAN_THE:
                    typeCode = 'DT';
                    break;
            }

            const baseMa = `${prefix}_${typeCode}`;

            const lastOne = await this.prisma.toChuc.findFirst({
                where: { ma: { startsWith: baseMa } },
                orderBy: { ma: 'desc' },
            });

            let nextIndex = 1;
            if (lastOne) {
                const parts = lastOne.ma.split('_');
                const lastIdx = parseInt(parts[parts.length - 1]);
                if (!isNaN(lastIdx)) {
                    nextIndex = lastIdx + 1;
                }
            }

            createOrganizationDto.ma = `${baseMa}_${nextIndex.toString().padStart(5, '0')}`;
        }

        const existing = await this.prisma.toChuc.findUnique({
            where: { ma: createOrganizationDto.ma },
        });

        if (existing) {
            throw new ConflictException('Mã tổ chức đã tồn tại');
        }

        const { parentId, ...rest } = createOrganizationDto;

        return this.prisma.toChuc.create({
            data: {
                ...rest,
                parentId: parentId ? Number(parentId) : null,
            } as any,
        });
    }

    async findAll() {
        return this.prisma.toChuc.findMany({
            include: {
                _count: {
                    select: { thanhViens: true },
                },
                children: {
                    select: { id: true, ten: true, ma: true }
                }
            },
            orderBy: { ngayTao: 'desc' },
        });
    }

    async findOne(id: number) {
        const org = await this.prisma.toChuc.findUnique({
            where: { id },
            include: {
                parent: {
                    select: { id: true, ten: true, ma: true }
                },
                children: {
                    include: {
                        _count: {
                            select: { thanhViens: true }
                        }
                    }
                },
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

        const { parentId, ...rest } = updateOrganizationDto;

        // Prevent self-parenting
        if (parentId && Number(parentId) === id) {
            throw new ConflictException('Một tổ chức không thể là cha của chính nó');
        }

        return this.prisma.toChuc.update({
            where: { id },
            data: {
                ...rest,
                parentId: parentId ? Number(parentId) : null,
            } as any,
        });
    }

    async remove(id: number) {
        const org = await this.findOne(id);
        if (org.thanhViens && org.thanhViens.length > 0) {
            throw new ConflictException('Không thể xóa tổ chức đang có thành viên');
        }
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
