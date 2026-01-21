import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

// @Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.submissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(+id);
  }

  @Post(':id/answers')
  submitAnswer(@Param('id') id: string, @Body() dto: SubmitAnswerDto) {
    return this.submissionsService.submitAnswer(+id, dto);
  }
}
