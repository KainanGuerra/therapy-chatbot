import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProfessionalType } from '../../../common/enums';

export class CreateProfessionalDto {
  @ApiProperty({ example: 'Dr. Sarah Johnson' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'sarah.johnson@therapy.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1-555-0123', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: ProfessionalType, example: ProfessionalType.PSYCHOLOGIST })
  @IsEnum(ProfessionalType)
  type: ProfessionalType;

  @ApiProperty({ example: ['anxiety', 'depression', 'workplace stress'] })
  @IsArray()
  @IsString({ each: true })
  specializations: string[];

  @ApiProperty({ example: 'New York, NY', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'https://drsarahjohnson.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'Dr. Johnson specializes in cognitive behavioral therapy...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateProfessionalDto {
  @ApiProperty({ example: 'Dr. Sarah Johnson', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'sarah.johnson@therapy.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1-555-0123', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: ['anxiety', 'depression', 'workplace stress'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiProperty({ example: 'New York, NY', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'https://drsarahjohnson.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'Dr. Johnson specializes in cognitive behavioral therapy...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isAvailable?: boolean;
}

export class RateProfessionalDto {
  @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great therapist, very helpful with workplace stress', required: false })
  @IsOptional()
  @IsString()
  review?: string;
}
