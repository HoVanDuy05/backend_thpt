import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    TrangThaiQuyTrinh,
    LoaiQuyTacBuoc,
    TrangThaiPhien,
    TrangThaiBuocPhien,
    HanhDongPheDuyet,
    LoaiNguoiPheDuyet
} from '@prisma/client';

@Injectable()
export class ApprovalsService {
    constructor(private prisma: PrismaService) { }

    // ==========================================
    // FLOW MANAGEMENT (ADMIN)
    // ==========================================

    async createFlow(userId: number, data: any) {
        return this.prisma.quyTrinh.create({
            data: {
                ten: data.name,
                moTa: data.description,
                trangThai: data.status?.toUpperCase() || TrangThaiQuyTrinh.NHAP,
                nguoiTaoId: userId,
            },
        });
    }

    async updateFlow(id: number, data: any) {
        return this.prisma.quyTrinh.update({
            where: { id },
            data: {
                ten: data.name,
                moTa: data.description,
                trangThai: data.status?.toUpperCase(),
            },
        });
    }

    async addFlowStep(flowId: number, data: any) {
        return this.prisma.buocQuyTrinh.create({
            data: {
                quyTrinhId: flowId,
                thuTuBuoc: data.step_order,
                ten: data.name,
                loaiQuyTac: data.rule_type === 'all' ? LoaiQuyTacBuoc.TAT_CA : LoaiQuyTacBuoc.BAT_KY,
            },
        });
    }

    async addStepApprover(stepId: number, data: any) {
        return this.prisma.nguoiPheDuyetBuoc.create({
            data: {
                buocId: stepId,
                loaiNguoiPheDuyet: data.approver_type?.toUpperCase() || LoaiNguoiPheDuyet.NGUOI_DUNG,
                approverId: data.approver_id,
            },
        });
    }

    async createFlowFields(flowId: number, fields: any[]) {
        return this.prisma.truongFormQuyTrinh.createMany({
            data: fields.map(f => ({
                quyTrinhId: flowId,
                tenTruong: f.name,
                nhan: f.label,
                loai: f.type.toUpperCase(),
                batBuoc: f.required || false,
                tuyChon: f.options,
                thuTu: f.order,
            })),
        });
    }

    async getFlowFormFields(flowId: number) {
        return this.prisma.truongFormQuyTrinh.findMany({
            where: { quyTrinhId: flowId },
            orderBy: { thuTu: 'asc' },
        });
    }

    async getAllFlows() {
        return this.prisma.quyTrinh.findMany({
            include: { _count: { select: { cacBuoc: true } } },
        });
    }

    // ==========================================
    // SUBMIT & APPROVAL FLOW
    // ==========================================

    async submitFlowInstance(userId: number, data: any) {
        const flow = await this.prisma.quyTrinh.findUnique({
            where: { id: data.flow_id },
            include: { cacBuoc: { orderBy: { thuTuBuoc: 'asc' } }, cacTruong: true },
        });

        if (!flow) throw new NotFoundException('Flow not found');
        if (flow.trangThai !== TrangThaiQuyTrinh.HOAT_DONG) {
            throw new BadRequestException('Flow is not active');
        }

        // 1. Validate form fields
        this.validateForm(flow.cacTruong, data.target_id);

        // 2. Create Instance
        const firstStep = flow.cacBuoc[0];
        if (!firstStep) throw new BadRequestException('Flow has no steps');

        const instance = await this.prisma.phienQuyTrinh.create({
            data: {
                quyTrinhId: flow.id,
                doiTuongLienQuan: data.target_id, // Store target info
                trangThai: TrangThaiPhien.CHO_DUYET,
                buocHienTai: firstStep.thuTuBuoc,
                nguoiTaoId: userId,
            },
        });

        // 3. Create initial instance step
        await this.prisma.buocPhienQuyTrinh.create({
            data: {
                phienId: instance.id,
                buocId: firstStep.id,
                trangThai: TrangThaiBuocPhien.CHO_DUYET,
            },
        });

        // 4. Get approvers to notify
        const approvers = await this.prisma.nguoiPheDuyetBuoc.findMany({
            where: { buocId: firstStep.id },
        });

        return {
            instance,
            notify_approvers: approvers,
        };
    }

    async getMyInstances(userId: number, status?: string) {
        return this.prisma.phienQuyTrinh.findMany({
            where: {
                nguoiTaoId: userId,
                ...(status ? { trangThai: status.toUpperCase() as any } : {}),
            },
            include: { quyTrinh: true },
            orderBy: { ngayTao: 'desc' },
        });
    }

    async getInstanceDetail(id: number) {
        return this.prisma.phienQuyTrinh.findUnique({
            where: { id },
            include: {
                quyTrinh: true,
                buocPhiens: {
                    include: { buoc: true },
                },
                nhatKy: {
                    include: { nguoiDung: { select: { id: true, taiKhoan: true } } },
                    orderBy: { ngayTao: 'asc' },
                },
            },
        });
    }

    async approveStep(userId: number, instanceId: number, data: { note?: string }) {
        const instance = await this.prisma.phienQuyTrinh.findUnique({
            where: { id: instanceId },
            include: {
                quyTrinh: { include: { cacBuoc: true } },
                buocPhiens: { where: { trangThai: TrangThaiBuocPhien.CHO_DUYET } }
            },
        });

        if (!instance) throw new NotFoundException('Instance not found');
        const currentInstanceStep = instance.buocPhiens[0];
        if (!currentInstanceStep) throw new BadRequestException('No pending step found');

        const stepDefinition = await this.prisma.buocQuyTrinh.findUnique({
            where: { id: currentInstanceStep.buocId },
            include: { nguoiDuyets: true },
        });

        if (!stepDefinition) throw new NotFoundException('Step definition not found');

        // Log the action
        await this.prisma.nhatKyPheDuyetQuyTrinh.create({
            data: {
                phienId: instanceId,
                buocId: stepDefinition.id,
                nguoiDungId: userId,
                hanhDong: HanhDongPheDuyet.PHE_DUYET,
                noiDung: data.note,
            },
        });

        // Workflow logic
        let isStepComplete = false;
        if (stepDefinition.loaiQuyTac === LoaiQuyTacBuoc.BAT_KY) {
            isStepComplete = true;
        } else {
            // Check if all others approved
            const otherApprovals = await this.prisma.nhatKyPheDuyetQuyTrinh.count({
                where: {
                    phienId: instanceId,
                    buocId: stepDefinition.id,
                    hanhDong: HanhDongPheDuyet.PHE_DUYET,
                },
            });
            if (otherApprovals >= stepDefinition.nguoiDuyets.length) {
                isStepComplete = true;
            }
        }

        if (isStepComplete) {
            await this.prisma.buocPhienQuyTrinh.update({
                where: { id: currentInstanceStep.id },
                data: {
                    trangThai: TrangThaiBuocPhien.DA_DUYET,
                    nguoiPheDuyetId: userId,
                    ngayPheDuyet: new Date(),
                },
            });

            // Move to next step
            const nextStep = instance.quyTrinh.cacBuoc.find(b => b.thuTuBuoc === instance.buocHienTai + 1);
            if (nextStep) {
                await this.prisma.phienQuyTrinh.update({
                    where: { id: instanceId },
                    data: { buocHienTai: nextStep.thuTuBuoc },
                });
                await this.prisma.buocPhienQuyTrinh.create({
                    data: {
                        phienId: instanceId,
                        buocId: nextStep.id,
                        trangThai: TrangThaiBuocPhien.CHO_DUYET,
                    },
                });
                return { status: 'moved_to_next_step', next_step: nextStep };
            } else {
                await this.prisma.phienQuyTrinh.update({
                    where: { id: instanceId },
                    data: { trangThai: TrangThaiPhien.DA_DUYET },
                });
                return { status: 'approved_completely' };
            }
        }

        return { status: 'partial_approval_recorded' };
    }

    async rejectStep(userId: number, instanceId: number, data: { note?: string }) {
        const instance = await this.prisma.phienQuyTrinh.findUnique({
            where: { id: instanceId },
            include: { buocPhiens: { where: { trangThai: TrangThaiBuocPhien.CHO_DUYET } } },
        });

        if (!instance) throw new NotFoundException('Instance not found');
        const currentInstanceStep = instance.buocPhiens[0];

        // Log rejection
        await this.prisma.nhatKyPheDuyetQuyTrinh.create({
            data: {
                phienId: instanceId,
                buocId: currentInstanceStep?.buocId,
                nguoiDungId: userId,
                hanhDong: HanhDongPheDuyet.TU_CHOI,
                noiDung: data.note,
            },
        });

        // Update step & instance status
        if (currentInstanceStep) {
            await this.prisma.buocPhienQuyTrinh.update({
                where: { id: currentInstanceStep.id },
                data: { trangThai: TrangThaiBuocPhien.TU_CHOI },
            });
        }

        await this.prisma.phienQuyTrinh.update({
            where: { id: instanceId },
            data: { trangThai: TrangThaiPhien.TU_CHOI },
        });

        return { status: 'rejected' };
    }

    async getLogs(instanceId: number) {
        return this.prisma.nhatKyPheDuyetQuyTrinh.findMany({
            where: { phienId: instanceId },
            include: { nguoiDung: { select: { id: true, taiKhoan: true } } },
            orderBy: { ngayTao: 'asc' },
        });
    }

    private validateForm(fields: any[], submittedData: any) {
        if (!submittedData) throw new BadRequestException('Form data is required');
    }
}
