import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    example: 'Production API Key',
    description: 'Name for the API key',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Optional expiration date for the API key',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
