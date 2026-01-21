import { PartialType } from '@nestjs/swagger';
import { CreateNamHocDto } from './create-nam-hoc.dto';

export class UpdateNamHocDto extends PartialType(CreateNamHocDto) {}
