import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { VaiTro, VaiTroToChuc } from '@prisma/client';

@Controller('organizations')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Post()
    @Roles(VaiTro.ADMIN)
    create(@Body() createOrganizationDto: CreateOrganizationDto) {
        return this.organizationService.create(createOrganizationDto);
    }

    @Get()
    @Public()
    findAll() {
        return this.organizationService.findAll();
    }

    @Get(':id')
    @Public()
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.organizationService.findOne(id);
    }

    @Patch(':id')
    @Roles(VaiTro.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateOrganizationDto: UpdateOrganizationDto) {
        return this.organizationService.update(id, updateOrganizationDto);
    }

    @Delete(':id')
    @Roles(VaiTro.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.organizationService.remove(id);
    }

    // Membership endpoints
    @Post(':id/members')
    @Roles(VaiTro.ADMIN)
    addMember(@Param('id', ParseIntPipe) id: number, @Body() addMemberDto: AddMemberDto) {
        return this.organizationService.addMember(id, addMemberDto);
    }

    @Delete(':id/members/:userId')
    @Roles(VaiTro.ADMIN)
    removeMember(@Param('id', ParseIntPipe) id: number, @Param('userId', ParseIntPipe) userId: number) {
        return this.organizationService.removeMember(id, userId);
    }

    @Patch(':id/members/:userId/role')
    @Roles(VaiTro.ADMIN)
    updateMemberRole(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body('vaiTro') vaiTro: VaiTroToChuc,
    ) {
        return this.organizationService.updateMemberRole(id, userId, vaiTro);
    }
}
