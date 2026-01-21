import { PartialType } from '@nestjs/swagger';
import { CreateMonHocDto } from './create-mon-hoc.dto';

export class UpdateMonHocDto extends PartialType(CreateMonHocDto) {}
