import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
    @ApiPropertyOptional({ description: 'JSON string for filtering (e.g. {"name": "A"})' })
    @IsOptional()
    @IsString()
    where?: string;

    @ApiPropertyOptional({ description: 'JSON string for sorting (e.g. {"createdAt": "desc"})' })
    @IsOptional()
    @IsString()
    orderBy?: string;

    @ApiPropertyOptional({ description: 'JSON string for relations (e.g. {"posts": true})' })
    @IsOptional()
    @IsString()
    include?: string;

    @ApiPropertyOptional({ description: 'Number of records to skip' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    skip?: number;

    @ApiPropertyOptional({ description: 'Number of records to take' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    take?: number;
}
