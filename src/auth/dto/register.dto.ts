import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'validation.username.invalid_type' })
  @IsNotEmpty({ message: 'validation.username.required' })
  @MinLength(3, { message: 'validation.username.minLength' })
  @MaxLength(50, { message: 'validation.username.maxLength' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'validation.username.invalid_pattern',
  })
  taiKhoan: string;

  @IsString({ message: 'validation.password.invalid_type' })
  @IsNotEmpty({ message: 'validation.password.required' })
  @MinLength(6, { message: 'validation.password.minLength' })
  @MaxLength(100, { message: 'validation.password.maxLength' })
  matKhau: string;

  @IsEmail({}, { message: 'validation.email.invalid' })
  @IsNotEmpty({ message: 'validation.email.required' })
  email: string;

  @IsString({ message: 'validation.phone.invalid_type' })
  @IsNotEmpty({ message: 'validation.phone.required' })
  @Matches(/^[0-9+]{10,15}$/, { message: 'validation.phone.invalid_pattern' })
  soDienThoai: string;

  @IsString({ message: 'validation.fullname.invalid_type' })
  @IsNotEmpty({ message: 'validation.fullname.required' })
  hoTen: string;
}
