import { IsString, IsEnum, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HabitCategory } from '../../../common/enums';

export class CreateHabitDto {
  @ApiProperty({ example: 'Daily Meditation' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Practice mindfulness meditation for 10 minutes each morning' })
  @IsString()
  description: string;

  @ApiProperty({ enum: HabitCategory, example: HabitCategory.MENTAL_HEALTH })
  @IsEnum(HabitCategory)
  category: HabitCategory;

  @ApiProperty({ example: 'easy', enum: ['easy', 'medium', 'hard'] })
  @IsString()
  difficulty: string;

  @ApiProperty({ example: '10 minutes' })
  @IsString()
  estimatedTime: string;

  @ApiProperty({ example: ['Reduced stress', 'Better focus', 'Improved mood'] })
  @IsArray()
  @IsString({ each: true })
  benefits: string[];
}

export class UpdateHabitDto {
  @ApiProperty({ example: 'Daily Meditation', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Practice mindfulness meditation for 10 minutes each morning', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: HabitCategory, example: HabitCategory.MENTAL_HEALTH, required: false })
  @IsOptional()
  @IsEnum(HabitCategory)
  category?: HabitCategory;

  @ApiProperty({ example: 'easy', enum: ['easy', 'medium', 'hard'], required: false })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({ example: '10 minutes', required: false })
  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @ApiProperty({ example: ['Reduced stress', 'Better focus', 'Improved mood'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
}

export class CompleteHabitDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isCompleted: boolean;

  @ApiProperty({ example: 'Felt great after the meditation session!', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}