import { Module } from '@nestjs/common';
import { GradingService } from './grading.service';
import { GradingController } from './grading.controller';

@Module({
  controllers: [],
  providers: [GradingService],
  exports: [GradingService], // Exported for AppController
})
export class GradingModule {}
