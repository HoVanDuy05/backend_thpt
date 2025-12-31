import { Module, forwardRef } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { CommunicationModule } from '../../communication/communication.module';

@Module({
    imports: [forwardRef(() => CommunicationModule)],
    providers: [FriendsService],
    controllers: [FriendsController],
    exports: [FriendsService],
})
export class FriendsModule { }
