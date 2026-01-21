import { PartialType } from '@nestjs/swagger';
import { CreateHocKyDto } from './create-hoc-ky.dto';

export class UpdateHocKyDto extends PartialType(CreateHocKyDto) {}
