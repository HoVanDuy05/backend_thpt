import { PartialType } from '@nestjs/mapped-types';
import { CreateLopNamDto } from './create-lop-nam.dto';

export class UpdateLopNamDto extends PartialType(CreateLopNamDto) {}
