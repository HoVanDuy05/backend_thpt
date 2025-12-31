import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
    constructor(private readonly approvalsService: ApprovalsService) { }

    // ==========================================
    // Flow management (admin)
    // ==========================================

    @Get('flow')
    getAllFlows() {
        return this.approvalsService.getAllFlows();
    }

    @Get('categories')
    getCategories() {
        return this.approvalsService.getCategories();
    }

    @Post('categories')
    createCategory(@Body() data: any) {
        return this.approvalsService.createCategory(data);
    }

    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string) {
        return this.approvalsService.deleteCategory(+id);
    }

    @Post('flow')
    createFlow(@Request() req: any, @Body() data: any) {
        return this.approvalsService.createFlow(req.user.userId, data);
    }

    @Put('flow/:id')
    updateFlow(@Param('id') id: string, @Body() data: any) {
        return this.approvalsService.updateFlow(+id, data);
    }

    @Post('flow/:id/step')
    addStep(@Param('id') id: string, @Body() data: any) {
        return this.approvalsService.addFlowStep(+id, data);
    }

    @Post('flow/:stepId/approver')
    addApprover(@Param('stepId') stepId: string, @Body() data: any) {
        return this.approvalsService.addStepApprover(+stepId, data);
    }

    @Post('flow/:id/fields')
    createFields(@Param('id') id: string, @Body() data: { fields: any[] }) {
        return this.approvalsService.createFlowFields(+id, data.fields);
    }

    @Get('flow/:id/form-fields')
    getFormFields(@Param('id') id: string) {
        return this.approvalsService.getFlowFormFields(+id);
    }

    // ==========================================
    // Submit & approval flow
    // ==========================================

    @Post('submit-flow')
    submitInstance(@Request() req: any, @Body() data: any) {
        return this.approvalsService.submitFlowInstance(req.user.userId, data);
    }

    @Get('my-flow')
    getMyFlows(@Request() req: any, @Query('status') status?: string) {
        return this.approvalsService.getMyInstances(req.user.userId, status);
    }

    @Get('flow-instance/:id')
    getInstance(@Param('id') id: string) {
        return this.approvalsService.getInstanceDetail(+id);
    }

    @Post('flow-instance/:id/approve')
    approve(@Request() req: any, @Param('id') id: string, @Body() data: any) {
        return this.approvalsService.approveStep(req.user.userId, +id, data);
    }

    @Post('flow-instance/:id/reject')
    reject(@Request() req: any, @Param('id') id: string, @Body() data: any) {
        return this.approvalsService.rejectStep(req.user.userId, +id, data);
    }

    @Get('flow-instance/:id/logs')
    getLogs(@Param('id') id: string) {
        return this.approvalsService.getLogs(+id);
    }
}
