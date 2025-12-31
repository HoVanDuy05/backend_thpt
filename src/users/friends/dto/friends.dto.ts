export enum FriendAction {
    ACCEPT = 'ACCEPT',
    DECLINE = 'DECLINE',
    CANCEL = 'CANCEL',
}

export class HandleFriendRequestDto {
    action: FriendAction;
}
