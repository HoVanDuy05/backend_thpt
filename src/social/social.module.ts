import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { FriendsModule } from '../users/friends/friends.module';

@Module({
    imports: [FriendsModule],
    providers: [SocialService],
    controllers: [SocialController],
    exports: [SocialService],
})
export class SocialModule { }
