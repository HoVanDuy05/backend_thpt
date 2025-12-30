import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNamHocDto {
    @IsString()
    @IsNotEmpty()
    tenNamHoc: string;
}
