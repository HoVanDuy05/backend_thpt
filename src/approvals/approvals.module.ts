import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';

import { MailModule } from '../mail/mail.module';

@Module({
    imports: [MailModule],
    providers: [ApprovalsService],
    controllers: [ApprovalsController],
    exports: [ApprovalsService],
})
export class ApprovalsModule { }
