import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';

@Module({
  controllers: [],
  providers: [SubmissionsService],
  exports: [SubmissionsService], // Exported for AppController
})
export class SubmissionsModule {}
