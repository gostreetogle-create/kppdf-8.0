import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserService } from '../user/user.service';

interface RefreshPayload {
  id: string;
  version: number;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.auth.register(dto, res);
  }

  @Public()
  @Throttle({ short: { ttl: 60_000, limit: 5 }, long: { ttl: 3_600_000, limit: 20 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.auth.login(dto, res);
  }

  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() _dto: RefreshTokenDto,
    @CurrentUser() payload: RefreshPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.refresh(payload.id, payload.version, res);
  }

  @Post('logout')
  @Roles('admin', 'manager', 'user')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() me: AuthenticatedUser, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(me.id);
    res.clearCookie('refreshToken', { path: '/auth' });
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUser() me: AuthenticatedUser) {
    return this.auth.getMe(me.id);
  }
}
