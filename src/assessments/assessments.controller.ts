import { AddQuestionToExamDto } from './dto/add-question.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { Roles } from '../common/decorators/roles.decorator';
import { VaiTro } from '@prisma/client';

@Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN) // Teachers and Admins manage assessments
// @Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) { }

  @Post('questions')
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.assessmentsService.createQuestion(dto);
  }

  @Get('questions')
  findAllQuestions() {
    return this.assessmentsService.findAllQuestions();
  }

  @Get('questions/:id')
  findOneQuestion(@Param('id') id: string) {
    return this.assessmentsService.findOneQuestion(+id);
  }

  @Put('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.assessmentsService.updateQuestion(+id, dto);
  }

  @Delete('questions/:id')
  removeQuestion(@Param('id') id: string) {
    return this.assessmentsService.removeQuestion(+id);
  }

  @Post('exams')
  createExam(@Body() dto: CreateExamDto) {
    return this.assessmentsService.createExam(dto);
  }

  @Get('exams')
  findAllExams() {
    return this.assessmentsService.findAllExams();
  }

  @Get('exams/:id')
  findOneExam(@Param('id') id: string) {
    return this.assessmentsService.findOneExam(+id);
  }

  @Put('exams/:id')
  updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.assessmentsService.updateExam(+id, dto);
  }

  @Delete('exams/:id')
  removeExam(@Param('id') id: string) {
    return this.assessmentsService.removeExam(+id);
  }

  @Post('exams/:id/questions')
  addQuestionToExam(@Param('id') id: string, @Body() dto: AddQuestionToExamDto) {
    return this.assessmentsService.addQuestionToExam(+id, dto);
  }

  @Delete('exams/:id/questions/:questionId')
  removeQuestionFromExam(@Param('id') id: string, @Param('questionId') questionId: string) {
    return this.assessmentsService.removeQuestionFromExam(+id, +questionId);
  }
}
