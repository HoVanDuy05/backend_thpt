import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { VaiTro } from '@prisma/client';
import { Roles } from './common/decorators/roles.decorator';
import { Public } from './common/decorators/public.decorator';
import { QueryDto } from './common/dto/query.dto';

// Services
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { AcademicService } from './academic/academic.service';
import { AssessmentsService } from './assessments/assessments.service';
import { SubmissionsService } from './submissions/submissions.service';
import { GradingService } from './grading/grading.service';

// DTOs
import { LoginDto } from './auth/dto/login.dto';
import { CreateUserDto } from './users/dto/create-user.dto';
import { CreateTeacherDto } from './users/dto/create-teacher.dto';
import { CreateStudentDto } from './users/dto/create-student.dto';
import { UpdateUserDto } from './users/dto/update-user.dto';
import { CreateNamHocDto } from './academic/dto/create-nam-hoc.dto';
import { UpdateNamHocDto } from './academic/dto/update-nam-hoc.dto';
import { CreateMonHocDto } from './academic/dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './academic/dto/update-mon-hoc.dto';
import { CreateLopHocDto } from './academic/dto/create-lop-hoc.dto';
import { UpdateLopHocDto } from './academic/dto/update-lop-hoc.dto';
import { CreateQuestionDto } from './assessments/dto/create-question.dto';
import { UpdateQuestionDto } from './assessments/dto/update-question.dto';
import { CreateExamDto } from './assessments/dto/create-exam.dto';
import { UpdateExamDto } from './assessments/dto/update-exam.dto';
import { AddQuestionToExamDto } from './assessments/dto/add-question.dto';
import { CreateSubmissionDto } from './submissions/dto/create-submission.dto';
import { SubmitAnswerDto } from './submissions/dto/submit-answer.dto';
import { CreateGradingDto } from './grading/dto/create-grading.dto';
import { UpdateGradingDto } from './grading/dto/update-grading.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly academicService: AcademicService,
    private readonly assessmentsService: AssessmentsService,
    private readonly submissionsService: SubmissionsService,
    private readonly gradingService: GradingService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiTags('Public - Thống kê')
  @Public()
  @Get('stats')
  getStats() {
    return this.appService.getStats();
  }

  // ==================================================================
  // AUTH MODULE
  // ==================================================================
  @ApiTags('Auth - Xác thực')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiTags('Auth - Xác thực')
  @Get('auth/profile')
  getProfile(@Query('userId') userId: string) {
    // Note: In real app, we get from Req user, but for simplicity:
    return this.usersService.findOne(+userId);
  }

  @ApiTags('Auth - Xác thực')
  @Public()
  @Post('auth/register')
  async registerUser(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @ApiTags('Auth - Xác thực')
  @Public()
  @Post('auth/forgot-password')
  @Post('auth/forgot-password')
  async forgotPassword(@Body() body: { email: string; locale?: string }) {
    return this.authService.forgotPassword(body.email, body.locale || 'vi');
  }

  @ApiTags('Auth - Xác thực')
  @Public()
  @Post('auth/reset-password')
  async resetPassword(@Body() body: { token: string; matKhau: string }) {
    return this.authService.resetPassword(body.token, body.matKhau);
  }

  // ==================================================================
  // USERS MODULE
  // ==================================================================
  // Portions of USERS MODULE moved to UsersController to avoid conflicts and DTO issues.

  // ==================================================================
  // ACADEMIC MODULE (ADMIN ONLY)
  // ==================================================================
  @ApiTags('Academic - Năm học')
  @Roles(VaiTro.ADMIN)
  @Post('academic/years')
  createNamHoc(@Body() dto: CreateNamHocDto) {
    return this.academicService.createNamHoc(dto);
  }

  @ApiTags('Academic - Năm học')
  @Roles(VaiTro.ADMIN)
  @Get('academic/years')
  findAllNamHoc(@Query() query: QueryDto) {
    return this.academicService.findAllNamHoc(this.parseQuery(query));
  }

  @ApiTags('Academic - Năm học')
  @Roles(VaiTro.ADMIN)
  @Get('academic/years/:id')
  findOneNamHoc(@Param('id') id: string) {
    return this.academicService.findOneNamHoc(+id);
  }

  @ApiTags('Academic - Năm học')
  @Roles(VaiTro.ADMIN)
  @Put('academic/years/:id')
  updateNamHoc(@Param('id') id: string, @Body() dto: UpdateNamHocDto) {
    return this.academicService.updateNamHoc(+id, dto);
  }

  @ApiTags('Academic - Năm học')
  @Roles(VaiTro.ADMIN)
  @Delete('academic/years/:id')
  removeNamHoc(@Param('id') id: string) {
    return this.academicService.removeNamHoc(+id);
  }

  @ApiTags('Academic - Môn học')
  @Roles(VaiTro.ADMIN)
  @Post('academic/subjects')
  createMonHoc(@Body() dto: CreateMonHocDto) {
    return this.academicService.createMonHoc(dto);
  }

  @ApiTags('Academic - Môn học')
  @Roles(VaiTro.ADMIN)
  @Get('academic/subjects')
  findAllMonHoc(@Query() query: QueryDto) {
    return this.academicService.findAllMonHoc(this.parseQuery(query));
  }

  @ApiTags('Academic - Môn học')
  @Roles(VaiTro.ADMIN)
  @Get('academic/subjects/:id')
  findOneMonHoc(@Param('id') id: string) {
    return this.academicService.findOneMonHoc(+id);
  }

  @ApiTags('Academic - Môn học')
  @Roles(VaiTro.ADMIN)
  @Put('academic/subjects/:id')
  updateMonHoc(@Param('id') id: string, @Body() dto: UpdateMonHocDto) {
    return this.academicService.updateMonHoc(+id, dto);
  }

  @ApiTags('Academic - Môn học')
  @Roles(VaiTro.ADMIN)
  @Delete('academic/subjects/:id')
  removeMonHoc(@Param('id') id: string) {
    return this.academicService.removeMonHoc(+id);
  }

  @ApiTags('Academic - Lớp học')
  @Roles(VaiTro.ADMIN)
  @Post('academic/classes')
  createLopHoc(@Body() dto: CreateLopHocDto) {
    return this.academicService.createLopHoc(dto);
  }

  @ApiTags('Academic - Lớp học')
  @Roles(VaiTro.ADMIN)
  @Get('academic/classes')
  findAllLopHoc(@Query() query: QueryDto) {
    return this.academicService.findAllLopHoc(this.parseQuery(query));
  }

  @ApiTags('Academic - Lớp học')
  @Roles(VaiTro.ADMIN)
  @Get('academic/classes/:id')
  findOneLopHoc(@Param('id') id: string) {
    return this.academicService.findOneLopHoc(+id);
  }

  @ApiTags('Academic - Lớp học')
  @Roles(VaiTro.ADMIN)
  @Put('academic/classes/:id')
  updateLopHoc(@Param('id') id: string, @Body() dto: UpdateLopHocDto) {
    return this.academicService.updateLopHoc(+id, dto);
  }

  @ApiTags('Academic - Lớp học')
  @Roles(VaiTro.ADMIN)
  @Delete('academic/classes/:id')
  removeLopHoc(@Param('id') id: string) {
    return this.academicService.removeLopHoc(+id);
  }

  // ==================================================================
  // ASSESSMENTS MODULE (TEACHER & ADMIN)
  // ==================================================================
  @ApiTags('Assessments - Ngân hàng câu hỏi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Post('assessments/questions')
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.assessmentsService.createQuestion(dto);
  }

  @ApiTags('Assessments - Ngân hàng câu hỏi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Get('assessments/questions')
  findAllQuestions(@Query() query: QueryDto) {
    return this.assessmentsService.findAllQuestions(this.parseQuery(query));
  }

  @ApiTags('Assessments - Ngân hàng câu hỏi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Get('assessments/questions/:id')
  findOneQuestion(@Param('id') id: string) {
    return this.assessmentsService.findOneQuestion(+id);
  }

  @ApiTags('Assessments - Ngân hàng câu hỏi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Put('assessments/questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.assessmentsService.updateQuestion(+id, dto);
  }

  @ApiTags('Assessments - Ngân hàng câu hỏi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Delete('assessments/questions/:id')
  removeQuestion(@Param('id') id: string) {
    return this.assessmentsService.removeQuestion(+id);
  }

  @ApiTags('Assessments - Đề thi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Post('assessments/exams')
  createExam(@Body() dto: CreateExamDto) {
    return this.assessmentsService.createExam(dto);
  }

  @ApiTags('Assessments - Đề thi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Get('assessments/exams')
  findAllExams(@Query() query: QueryDto) {
    return this.assessmentsService.findAllExams(this.parseQuery(query));
  }

  @ApiTags('Assessments - Đề thi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Get('assessments/exams/:id')
  findOneExam(@Param('id') id: string) {
    return this.assessmentsService.findOneExam(+id);
  }

  @ApiTags('Assessments - Đề thi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Put('assessments/exams/:id')
  updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.assessmentsService.updateExam(+id, dto);
  }

  @ApiTags('Assessments - Đề thi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Delete('assessments/exams/:id')
  removeExam(@Param('id') id: string) {
    return this.assessmentsService.removeExam(+id);
  }

  @ApiTags('Assessments - Đề thi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Post('assessments/exams/:id/questions')
  addQuestionToExam(
    @Param('id') id: string,
    @Body() dto: AddQuestionToExamDto,
  ) {
    return this.assessmentsService.addQuestionToExam(+id, dto);
  }

  @ApiTags('Assessments - Đề thi')
  @Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)
  @Delete('assessments/exams/:id/questions/:questionId')
  removeQuestionFromExam(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    return this.assessmentsService.removeQuestionFromExam(+id, +questionId);
  }

  // ==================================================================
  // SUBMISSIONS MODULE
  // ==================================================================
  @ApiTags('Submissions - Nộp bài')
  @Post('submissions')
  createSubmission(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @ApiTags('Submissions - Nộp bài')
  @Get('submissions')
  findAllSubmissions(@Query() query: QueryDto) {
    return this.submissionsService.findAll(this.parseQuery(query));
  }

  @ApiTags('Submissions - Nộp bài')
  @Get('submissions/:id')
  findOneSubmission(@Param('id') id: string) {
    return this.submissionsService.findOne(+id);
  }

  @ApiTags('Submissions - Nộp bài')
  @Post('submissions/:id/answers')
  submitAnswer(@Param('id') id: string, @Body() dto: SubmitAnswerDto) {
    return this.submissionsService.submitAnswer(+id, dto);
  }

  // ==================================================================
  // GRADING MODULE (TEACHER ONLY)
  // ==================================================================
  @ApiTags('Grading - Chấm điểm')
  @Roles(VaiTro.GIAO_VIEN)
  @Post('grading')
  createGrading(@Body() dto: CreateGradingDto) {
    return this.gradingService.create(dto);
  }

  @ApiTags('Grading - Chấm điểm')
  @Roles(VaiTro.GIAO_VIEN)
  @Get('grading')
  findAllGrading(@Query() query: QueryDto) {
    return this.gradingService.findAll(this.parseQuery(query));
  }

  @ApiTags('Grading - Chấm điểm')
  @Roles(VaiTro.GIAO_VIEN)
  @Get('grading/:id')
  findOneGrading(@Param('id') id: string) {
    return this.gradingService.findOne(+id);
  }

  @ApiTags('Grading - Chấm điểm')
  @Roles(VaiTro.GIAO_VIEN)
  @Put('grading/:id')
  updateGrading(@Param('id') id: string, @Body() dto: UpdateGradingDto) {
    return this.gradingService.update(+id, dto);
  }

  @ApiTags('Grading - Chấm điểm')
  @Roles(VaiTro.GIAO_VIEN)
  @Delete('grading/:id')
  removeGrading(@Param('id') id: string) {
    return this.gradingService.remove(+id);
  }
  private parseQuery(query: QueryDto) {
    try {
      const { where, orderBy, include, skip, take } = query;
      return {
        where: where ? JSON.parse(where) : undefined,
        orderBy: orderBy ? JSON.parse(orderBy) : undefined,
        include: include ? JSON.parse(include) : undefined,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
      };
    } catch (error) {
      return {}; // Safely return empty object on parse error
    }
  }
}
