import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitAnswerDto {
    @IsInt()
    @IsNotEmpty()
    cauHoiId: number;

    @IsString()
    @IsOptional()
    cauTraLoiCuaHs?: string;

    // Optional: Auto-grading result if calculated immediately
    @IsBoolean()
    @IsOptional()
    laDung?: boolean;
}
