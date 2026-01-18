import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePhanCongGvDto {
    @IsInt()
    @IsNotEmpty()
    giaoVienId: number;

    @IsInt()
    @IsNotEmpty()
    monHocId: number;

    @IsInt()
    @IsNotEmpty()
    lopNamId: number;

    @IsInt()
    @IsNotEmpty()
    namHocId: number;
}
