import { PartialType } from '@nestjs/swagger';
import { CreatePhanCongGvDto } from './create-phan-cong-gv.dto';

export class UpdatePhanCongGvDto extends PartialType(CreatePhanCongGvDto) {}
