import { PartialType } from '@nestjs/mapped-types';
import { CreateKhoiDto } from './create-khoi.dto';

export class UpdateKhoiDto extends PartialType(CreateKhoiDto) { }
