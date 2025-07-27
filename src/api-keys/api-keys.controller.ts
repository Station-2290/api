import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import {
  ApiKeyResponseDto,
  ApiKeyListResponseDto,
} from './dto/responses/api-key-response.dto';
import {
  MessageResponseDto,
  UnauthorizedErrorResponseDto,
  NotFoundErrorResponseDto,
  ValidationErrorResponseDto,
  InternalServerErrorResponseDto,
} from '../shared/dto/common-responses.dto';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async create(
    @Request() req: ExpressRequest,
    @Body() createApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.create(req.user!.id, createApiKeyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all API keys for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of API keys',
    type: ApiKeyListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async findAll(
    @Request() req: ExpressRequest,
  ): Promise<ApiKeyListResponseDto> {
    return this.apiKeysService.findAll(req.user!.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific API key' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({
    status: 200,
    description: 'API key details',
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async findOne(
    @Request() req: ExpressRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.findOne(req.user!.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an API key' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({
    status: 200,
    description: 'API key updated successfully',
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async update(
    @Request() req: ExpressRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.update(req.user!.id, id, updateApiKeyDto);
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async revoke(
    @Request() req: ExpressRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MessageResponseDto> {
    await this.apiKeysService.revoke(req.user!.id, id);
    return { message: 'API key revoked successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an API key' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({
    status: 204,
    description: 'API key deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async remove(
    @Request() req: ExpressRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.apiKeysService.remove(req.user!.id, id);
  }
}
