import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { Request, Response } from 'express';
import { User } from '../users/entities/user.entity';
import {
  AuthResponseDto,
  TokenResponseDto,
} from './dto/responses/auth-response.dto';
import {
  MessageResponseDto,
  UnauthorizedErrorResponseDto,
  ConflictErrorResponseDto,
  ValidationErrorResponseDto,
  InternalServerErrorResponseDto,
} from '../shared/dto/common-responses.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates new user account with EMPLOYEE role by default. Returns access token in response body with refresh token as HTTP-only cookie. Only admins can change user roles via PATCH /users/:id/role',
  })
  @ApiResponse({
    status: 201,
    description:
      'User successfully registered. Refresh token is set as HTTP-only cookie.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email or username already exists',
    type: ConflictErrorResponseDto,
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
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<AuthResponseDto, 'refresh_token'>> {
    const result = await this.authService.register(registerDto);

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: result.refresh_token_expires_at,
      path: '/auth/refresh',
    });

    const { refresh_token, refresh_token_expires_at, ...response } = result;
    return {
      ...response,
      refresh_token_expires_at,
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with username/email and password',
    description:
      'Returns access token in response body and sets refresh token as HTTP-only cookie',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully logged in. Refresh token is set as HTTP-only cookie.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<AuthResponseDto, 'refresh_token'>> {
    const result = await this.authService.login(loginDto);

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: result.refresh_token_expires_at,
      path: '/auth/refresh',
    });

    const { refresh_token, refresh_token_expires_at, ...response } = result;
    return {
      ...response,
      refresh_token_expires_at,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token using refresh token',
    description:
      'Reads refresh token from HTTP-only cookie and returns new access token with updated refresh token cookie',
  })
  @ApiResponse({
    status: 200,
    description:
      'Token successfully refreshed. New refresh token is set as HTTP-only cookie.',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
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
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<TokenResponseDto, 'refresh_token'>> {
    const refreshToken = req.cookies?.refresh_token as string;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken(refreshToken);

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: result.refresh_token_expires_at,
      path: '/auth/refresh',
    });

    const { refresh_token, refresh_token_expires_at, ...response } = result;
    return {
      ...response,
      refresh_token_expires_at,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout and invalidate tokens',
    description: 'Invalidates all user tokens and clears refresh token cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    type: MessageResponseDto,
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
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const user = req.user!;

    await this.authService.logout(user.id, user.jti!);

    res.clearCookie('refresh_token', {
      path: '/auth/refresh',
    });

    return { message: 'Successfully logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved',
    type: User,
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
  getProfile(@Req() req: Request): User {
    return req.user as User;
  }
}
