import { PartialType } from '@nestjs/swagger';
import { CreateLopHocDto } from './create-lop-hoc.dto';

export class UpdateLopHocDto extends PartialType(CreateLopHocDto) {}
