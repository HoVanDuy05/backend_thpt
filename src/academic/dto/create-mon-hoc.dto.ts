import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMonHocDto {
    @IsString()
    @IsNotEmpty()
    tenMon: string;
}
