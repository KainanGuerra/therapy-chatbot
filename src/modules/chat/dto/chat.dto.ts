import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'I have been feeling really stressed at work lately...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}

export class CreateSessionDto {
  @ApiProperty({ example: 'Stress Management Session', required: false })
  @IsOptional()
  @IsString()
  title?: string;
}
