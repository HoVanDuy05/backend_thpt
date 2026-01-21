import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [PrismaModule, MailModule, FriendsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
