import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AcademicModule } from './academic/academic.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { GradingModule } from './grading/grading.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { PortalModule } from './portal/portal.module';
import { CommunicationModule } from './communication/communication.module';

import { AuthModule } from './auth/auth.module';

import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AcademicModule,
    AssessmentsModule,
    SubmissionsModule,
    GradingModule,
    AuthModule,
    GradingModule,
    AuthModule,
    MailModule,
    PortalModule,
    CommunicationModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule { }
