import { PartialType } from '@nestjs/swagger';
import { CreateAcademicDto } from './create-academic.dto';

export class UpdateAcademicDto extends PartialType(CreateAcademicDto) {}
