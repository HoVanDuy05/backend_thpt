import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TrangThaiQuyTrinh,
  LoaiQuyTacBuoc,
  TrangThaiPhien,
  TrangThaiBuocPhien,
  HanhDongPheDuyet,
  LoaiNguoiPheDuyet,
} from '@prisma/client';
import { ResendMailService } from '../mail/resend-mail.service';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private mailService: ResendMailService,
  ) { }

  // ==========================================
  // FLOW MANAGEMENT (ADMIN)
  // ==========================================

  async createFlow(userId: number, data: any) {
    return this.prisma.quyTrinh.create({
      data: {
        ten: data.name,
        moTa: data.description,
        danhMucId: data.category_id ? Number(data.category_id) : null,
        trangThai: data.status?.toUpperCase() || TrangThaiQuyTrinh.NHAP,
        nguoiTaoId: userId,
        cacBuoc: {
          create: data.steps?.map((step: any, index: number) => {
            const isSpecificUser = !isNaN(Number(step.approverType));
            let approverConfig = {};

            if (step.approverType) {
              if (isSpecificUser) {
                approverConfig = {
                  create: {
                    loaiNguoiPheDuyet: LoaiNguoiPheDuyet.NGUOI_DUNG_CU_THE,
                    approverId: Number(step.approverType),
                  },
                };
              } else {
                approverConfig = {
                  create: {
                    loaiNguoiPheDuyet: LoaiNguoiPheDuyet.VAI_TRO,
                    approverRole: step.approverType.replace('ROLE_', ''),
                  },
                };
              }
            }

            return {
              thuTuBuoc: index + 1,
              ten: step.name || `Cấp duyệt ${index + 1}`,
              loaiQuyTac:
                step.rule === 'all'
                  ? LoaiQuyTacBuoc.TAT_CA
                  : LoaiQuyTacBuoc.BAT_KY,
              nguoiDuyets: approverConfig,
            };
          }),
        },
        cacTruong: {
          create: data.fields?.map((field: any, index: number) => ({
            tenTruong: field.label,
            nhan: field.label,
            loai: field.type,
            batBuoc: field.required || false,
            tuyChon: field.options,
            thuTu: index + 1,
          })),
        },
      },
      include: { cacBuoc: true, cacTruong: true },
    });
  }

  async updateFlow(id: number, payload: any) {
    // Frontend sends { data: {...}, urlParams: {...} }, extract the actual data
    const data = payload.data || payload;

    const updateData: any = {};
    if (data.name !== undefined) updateData.ten = data.name;
    if (data.description !== undefined) updateData.moTa = data.description;
    if (data.danhMucId !== undefined)
      updateData.danhMucId = data.danhMucId ? Number(data.danhMucId) : null;
    if (data.trangThai !== undefined || data.status !== undefined) {
      updateData.trangThai = (data.trangThai || data.status).toUpperCase();
    }

    console.log('Updating flow:', id, 'with basic info:', updateData);

    // We use a transaction to ensure atomic update of steps and fields
    return this.prisma.$transaction(async (tx) => {
      // 1. Update basic info
      const result = await tx.quyTrinh.update({
        where: { id },
        data: updateData,
      });

      // 2. Sync Steps if provided
      if (data.steps) {
        console.log('Syncing steps for flow:', id);
        // Simple approach: Delete and recreate
        await tx.buocQuyTrinh.deleteMany({ where: { quyTrinhId: id } });

        for (const [index, step] of data.steps.entries()) {
          const isSpecificUser = !isNaN(Number(step.approverType));
          let approverConfig = {};

          if (step.approverType) {
            if (isSpecificUser) {
              approverConfig = {
                create: {
                  loaiNguoiPheDuyet: LoaiNguoiPheDuyet.NGUOI_DUNG_CU_THE,
                  approverId: Number(step.approverType),
                },
              };
            } else {
              approverConfig = {
                create: {
                  loaiNguoiPheDuyet: LoaiNguoiPheDuyet.VAI_TRO,
                  approverRole: step.approverType.replace('ROLE_', ''),
                },
              };
            }
          }

          await tx.buocQuyTrinh.create({
            data: {
              quyTrinhId: id,
              thuTuBuoc: index + 1,
              ten: step.name || `Cấp duyệt ${index + 1}`,
              loaiQuyTac:
                step.rule === 'all'
                  ? LoaiQuyTacBuoc.TAT_CA
                  : LoaiQuyTacBuoc.BAT_KY,
              nguoiDuyets: approverConfig,
            },
          });
        }
      }

      // 3. Sync Fields if provided
      if (data.fields) {
        console.log('Syncing fields for flow:', id);
        await tx.truongFormQuyTrinh.deleteMany({ where: { quyTrinhId: id } });

        for (const [index, field] of data.fields.entries()) {
          await tx.truongFormQuyTrinh.create({
            data: {
              quyTrinhId: id,
              tenTruong: field.label,
              nhan: field.label,
              loai: field.type,
              batBuoc: field.required || false,
              tuyChon: field.options || undefined,
              thuTu: index + 1,
            },
          });
        }
      }

      return result;
    });
  }

  async addFlowStep(flowId: number, data: any) {
    return this.prisma.buocQuyTrinh.create({
      data: {
        quyTrinhId: flowId,
        thuTuBuoc: data.step_order,
        ten: data.name,
        loaiQuyTac:
          data.rule_type === 'all'
            ? LoaiQuyTacBuoc.TAT_CA
            : LoaiQuyTacBuoc.BAT_KY,
      },
    });
  }

  async addStepApprover(stepId: number, data: any) {
    return this.prisma.nguoiPheDuyetBuoc.create({
      data: {
        buocId: stepId,
        loaiNguoiPheDuyet: data.approver_type, // VAI_TRO, NGUOI_DUNG_CU_THE, NGUOI_DUNG
        approverRole: data.approver_role, // 'GVCN', 'TRUONG_KHOA'
        approverId: data.approver_id,
      },
    });
  }

  async createFlowFields(flowId: number, fields: any[]) {
    return this.prisma.truongFormQuyTrinh.createMany({
      data: fields.map((f) => ({
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
      include: {
        _count: { select: { cacBuoc: true } },
        danhMuc: true, // Include category info
        cacBuoc: {
          include: {
            nguoiDuyets: {
              include: {
                user: {
                  select: {
                    id: true,
                    hoTen: true,
                    taiKhoan: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { thuTuBuoc: 'asc' },
        },
        cacTruong: { orderBy: { thuTu: 'asc' } },
      },
      orderBy: { ngayTao: 'desc' },
    });
  }

  // ==========================================
  // CATEGORY MANAGEMENT
  // ==========================================

  async createCategory(data: any) {
    return this.prisma.danhMucQuyTrinh.create({
      data: {
        ten: data.name,
        moTa: data.description,
      },
    });
  }

  async getCategories() {
    return this.prisma.danhMucQuyTrinh.findMany({
      include: {
        _count: { select: { quyTrinhs: true } },
      },
    });
  }

  async deleteCategory(id: number) {
    return this.prisma.danhMucQuyTrinh.delete({
      where: { id },
    });
  }

  // ==========================================
  // SUBMIT & APPROVAL FLOW
  // ==========================================

  async submitFlowInstance(userId: number, data: any, locale: string = 'vi') {
    const flow = await this.prisma.quyTrinh.findUnique({
      where: { id: data.flow_id },
      include: { cacBuoc: { orderBy: { thuTuBuoc: 'asc' } }, cacTruong: true },
    });

    if (!flow) throw new NotFoundException('Flow not found');
    if (flow.trangThai !== TrangThaiQuyTrinh.HOAT_DONG) {
      throw new BadRequestException('Flow is not active');
    }

    // 1. Validate form fields
    this.validateForm(flow.cacTruong, data.data);

    // 2. Create Instance
    const firstStep = flow.cacBuoc[0];
    if (!firstStep) throw new BadRequestException('Flow has no steps');

    const instance = await this.prisma.phienQuyTrinh.create({
      data: {
        quyTrinhId: flow.id,
        doiTuongLienQuan: data.target_id, // Store target info
        trangThai: TrangThaiPhien.DANG_XU_LY, // Should be PROCESSING immediately if we skip "CHO_DUYET" pending state
        buocHienTai: firstStep.thuTuBuoc,
        nguoiTaoId: userId,
        duLieuForm: JSON.stringify(data.data), // Save submitted data
      },
      include: { nguoiTao: true, quyTrinh: true },
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
    // This is just for return data, logic is handled in getPendingApprovals usually
    const approvers = await this.prisma.nguoiPheDuyetBuoc.findMany({
      where: { buocId: firstStep.id },
    });

    // Send notification to Creator (Confirmation)
    if (instance.nguoiTao?.email) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      this.mailService
        .sendApprovalNotification(
          instance.nguoiTao.email,
          {
            title: flow.ten,
            status: 'Đã gửi yêu cầu',
            link: `${frontendUrl}/${locale}/portal/approvals/${instance.id}`,
          },
          locale,
        )
        .catch((err) => console.error('Failed to send submission email:', err));
    }

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
      include: {
        quyTrinh: { include: { danhMuc: true } },
        nguoiTao: {
          select: { id: true, taiKhoan: true, hoTen: true, email: true },
        },
      },
      orderBy: { ngayTao: 'desc' },
    });
  }

  async getInstanceDetail(id: number) {
    const instance = await this.prisma.phienQuyTrinh.findUnique({
      where: { id },
      include: {
        quyTrinh: {
          include: {
            danhMuc: true,
            cacTruong: { orderBy: { thuTu: 'asc' } },
            cacBuoc: {
              include: {
                nguoiDuyets: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        hoTen: true,
                        taiKhoan: true,
                        email: true,
                      },
                    },
                  },
                },
              },
              orderBy: { thuTuBuoc: 'asc' },
            },
          },
        },
        nguoiTao: {
          select: { id: true, hoTen: true, taiKhoan: true, email: true },
        },
        buocPhiens: {
          include: { buoc: true },
        },
        nhatKy: {
          include: {
            nguoiDung: { select: { id: true, hoTen: true, taiKhoan: true } },
          },
          orderBy: { ngayTao: 'asc' },
        },
      },
    });

    if (!instance) return null;

    // Transform form data into the requested "fields" structure
    let submittedData = {};
    try {
      if (instance.duLieuForm) {
        submittedData = JSON.parse(instance.duLieuForm);
      }
    } catch (e) {
      console.error('Failed to parse duLieuForm for instance', id);
    }

    const fields = instance.quyTrinh.cacTruong.map((field) => {
      const value = submittedData[field.id.toString()] || submittedData[field.tenTruong];

      return {
        submitContent: value || '',
        submitFlowFieldID: field.id,
        detailFlow: {
          detailFlowId: field.id,
          fieldName: field.nhan,
          fieldValue: field.loai,
          optional: (!field.batBuoc).toString(),
          optionValue: field.tuyChon ? JSON.stringify(field.tuyChon) : '',
          order: field.thuTu,
          key: field.tenTruong,
          parentKey: null
        }
      };
    });

    return {
      ...instance,
      fields // Injecting the transformed fields array
    };
  }

  async getPendingApprovals(userId: number) {
    // 1. Get user role
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const isAdmin = user.vaiTro === 'ADMIN';

    // 2. Find instances where current step is PENDING
    return this.prisma.phienQuyTrinh.findMany({
      where: {
        trangThai: TrangThaiPhien.DANG_XU_LY,
        buocPhiens: {
          some: {
            trangThai: TrangThaiBuocPhien.CHO_DUYET,
            ...(isAdmin ? {} : {
              buoc: {
                nguoiDuyets: {
                  some: {
                    OR: [
                      {
                        loaiNguoiPheDuyet: LoaiNguoiPheDuyet.NGUOI_DUNG_CU_THE,
                        approverId: userId,
                      },
                      {
                        loaiNguoiPheDuyet: LoaiNguoiPheDuyet.VAI_TRO,
                        approverRole: user.vaiTro, // e.g. 'GIAO_VIEN'
                      },
                      {
                        loaiNguoiPheDuyet: LoaiNguoiPheDuyet.NGUOI_DUNG, // Anyone (rare case)
                      },
                    ],
                  },
                },
              },
            }),
          },
        },
      },
      include: {
        quyTrinh: true,
        nguoiTao: { select: { id: true, taiKhoan: true, email: true } },
        buocPhiens: {
          where: { trangThai: TrangThaiBuocPhien.CHO_DUYET },
          include: { buoc: true },
        },
      },
      orderBy: { ngayTao: 'desc' },
    });
  }

  async approveStep(
    userId: number,
    instanceId: number,
    data: { note?: string },
    locale: string = 'vi',
  ) {
    const instance = await this.prisma.phienQuyTrinh.findUnique({
      where: { id: instanceId },
      include: {
        nguoiTao: true,
        quyTrinh: { include: { cacBuoc: { orderBy: { thuTuBuoc: 'asc' } } } },
        buocPhiens: { where: { trangThai: TrangThaiBuocPhien.CHO_DUYET } },
      },
    });

    if (!instance) throw new NotFoundException('Instance not found');
    const currentInstanceStep = instance.buocPhiens[0];
    if (!currentInstanceStep)
      throw new BadRequestException('No pending step found');

    const stepDefinition = await this.prisma.buocQuyTrinh.findUnique({
      where: { id: currentInstanceStep.buocId },
      include: { nguoiDuyets: true },
    });

    if (!stepDefinition)
      throw new NotFoundException('Step definition not found');

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
      isStepComplete = true; // Any single approval moves it forward
    } else {
      // Check if all others approved (Simplified for now, usually requires counting required approvers vs actual logs)
      isStepComplete = true;
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

      // Notify creator
      if (instance.nguoiTao?.email) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.mailService
          .sendApprovalNotification(
            instance.nguoiTao.email,
            {
              title: instance.quyTrinh.ten,
              status: 'Đã được duyệt bước: ' + stepDefinition.ten,
              link: `${frontendUrl}/${locale}/portal/approvals/${instanceId}`,
            },
            locale,
          )
          .catch((err) =>
            console.error('Failed to send step approval email:', err),
          );
      }

      // Move to next step
      // Find current step index in ordered steps
      const currentStepIndex = instance.quyTrinh.cacBuoc.findIndex(
        (b) => b.id === stepDefinition.id,
      );
      const nextStep = instance.quyTrinh.cacBuoc[currentStepIndex + 1];

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

        // Notify final success
        if (instance.nguoiTao?.email) {
          const frontendUrl =
            process.env.FRONTEND_URL || 'http://localhost:3000';
          this.mailService
            .sendApprovalNotification(
              instance.nguoiTao.email,
              {
                title: instance.quyTrinh.ten,
                status: 'Đã được duyệt hoàn toàn! 🎉',
                link: `${frontendUrl}/${locale}/portal/approvals/${instanceId}`,
              },
              locale,
            )
            .catch((err) =>
              console.error('Failed to send final approval email:', err),
            );
        }

        return { status: 'approved_completely' };
      }
    }

    return { status: 'partial_approval_recorded' };
  }

  async rejectStep(
    userId: number,
    instanceId: number,
    data: { note?: string },
    locale: string = 'vi',
  ) {
    const instance = await this.prisma.phienQuyTrinh.findUnique({
      where: { id: instanceId },
      include: {
        nguoiTao: true,
        quyTrinh: true,
        buocPhiens: { where: { trangThai: TrangThaiBuocPhien.CHO_DUYET } },
      },
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
        data: {
          trangThai: TrangThaiBuocPhien.TU_CHOI,
          nguoiPheDuyetId: userId,
          ngayPheDuyet: new Date(),
        },
      });
    }

    await this.prisma.phienQuyTrinh.update({
      where: { id: instanceId },
      data: { trangThai: TrangThaiPhien.TU_CHOI }, // Entire flow is rejected
    });

    // Notify creator about rejection
    if (instance.nguoiTao?.email) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      this.mailService
        .sendApprovalNotification(
          instance.nguoiTao.email,
          {
            title: instance.quyTrinh.ten,
            status: locale === 'vi' ? 'Đã bị từ chối ❌' : 'Rejected ❌',
            link: `${frontendUrl}/${locale}/portal/approvals/${instanceId}`,
          },
          locale,
        )
        .catch((err) => console.error('Failed to send rejection email:', err));
    }

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
    if (!submittedData) return; // Allow empty
    // TODO: Implement actual validation based on field definitions
  }
}
