import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'validation.email.invalid' })
  @IsNotEmpty({ message: 'validation.email.required' })
  email: string;

  @IsString({ message: 'validation.password.invalid_type' })
  @IsNotEmpty({ message: 'validation.password.required' })
  matKhau: string;
}
