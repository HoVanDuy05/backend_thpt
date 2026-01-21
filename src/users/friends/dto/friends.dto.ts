import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FriendAction {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
  CANCEL = 'CANCEL',
}

export class HandleFriendRequestDto {
  @IsEnum(FriendAction)
  @IsNotEmpty()
  action: FriendAction;
}
