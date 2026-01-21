import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { FriendsModule } from '../users/friends/friends.module';
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [FriendsModule, CommunicationModule],
  providers: [SocialService],
  controllers: [SocialController],
  exports: [SocialService],
})
export class SocialModule {}
