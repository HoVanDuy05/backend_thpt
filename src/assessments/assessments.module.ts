import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';

@Module({
  controllers: [],
  providers: [AssessmentsService],
  exports: [AssessmentsService], // Exported for AppController
})
export class AssessmentsModule { }
