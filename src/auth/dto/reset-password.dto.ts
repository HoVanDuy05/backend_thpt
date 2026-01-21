import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'validation.token.invalid_type' })
  @IsNotEmpty({ message: 'validation.token.required' })
  token: string;

  @IsString({ message: 'validation.password.invalid_type' })
  @IsNotEmpty({ message: 'validation.password.required' })
  @MinLength(6, { message: 'validation.password.minLength' })
  @MaxLength(100, { message: 'validation.password.maxLength' })
  matKhau: string;
}
