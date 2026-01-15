import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStudentAccountDto } from './dto/create-student-account.dto';
import { CreateTeacherAccountDto } from './dto/create-teacher-account.dto';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('teachers')
  createTeacher(@Body() dto: CreateTeacherAccountDto) {
    return this.usersService.createFullTeacher(dto);
  }

  @Post('students')
  createStudent(@Body() dto: CreateStudentAccountDto) {
    return this.usersService.createFullStudent(dto);
  }

  @Post('staff')
  createStaff(@Body() dto: CreateStaffAccountDto) {
    return this.usersService.createFullStaff(dto);
  }

  @Get()
  findAll(@Query() query: FindUsersQueryDto) {
    // Automatically include profiles for admin view
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
