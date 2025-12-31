import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('teachers')
  createTeacher(@Body() dto: any) {
    if ('taiKhoan' in dto) {
      return this.usersService.createFullTeacher(dto);
    }
    return this.usersService.createTeacherProfile(dto);
  }

  @Post('students')
  createStudent(@Body() dto: any) { // Temporarily using any to bypass DTO strict check check for now, can implement DTO switching logic or just use new endpoint
    if ('taiKhoan' in dto) {
      return this.usersService.createFullStudent(dto);
    }
    return this.usersService.createStudentProfile(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
