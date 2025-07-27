import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Success or status message',
    example: 'Operation completed successfully',
  })
  @IsString()
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Error details or path',
    example: '/api/v1/products',
    required: false,
  })
  @IsString()
  @IsOptional()
  error?: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/products',
  })
  @IsString()
  path: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 422,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Array of validation error messages',
    example: ['email must be a valid email', 'password is too short'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  message: string[];

  @ApiProperty({
    description: 'Error details',
    example: 'Unprocessable Entity',
  })
  @IsString()
  error: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/products',
  })
  @IsString()
  path: string;
}

export class NotFoundErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Resource not found message',
    example: 'Resource not found',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: 'Not Found',
  })
  @IsString()
  error: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/products/999',
  })
  @IsString()
  path: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Unauthorized access message',
    example: 'Unauthorized',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: 'Unauthorized',
  })
  @IsString()
  error: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/products',
  })
  @IsString()
  path: string;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Forbidden access message',
    example: 'Forbidden resource',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: 'Forbidden',
  })
  @IsString()
  error: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/admin/users',
  })
  @IsString()
  path: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 409,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Conflict error message',
    example: 'Resource already exists',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: 'Conflict',
  })
  @IsString()
  error: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/users',
  })
  @IsString()
  path: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Internal server error message',
    example: 'Internal server error',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: 'Internal Server Error',
  })
  @IsString()
  error: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/products',
  })
  @IsString()
  path: string;
}
