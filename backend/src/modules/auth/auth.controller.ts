import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
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

  /**
   * Public /auth/register endpoint.
   *
   * CURRENTLY @Public() (TZ-91 І2 Decision 1 deferred): removing @Public requires
   * invite-flow endpoint `POST /api/users/invite` (TZ-91-extension, out of scope here).
   *
   * Defense-in-depth: RegisterDto.role is constrained `@IsIn(['user','manager'])`, so even
   * with @Public() in place, no admin account can be created via this endpoint Ч admin
   * accounts exist only via:
   *   (a) `backend/src/common/seed/admin.seed.ts` (first admin on fresh bootstrap), or
   *   (b) future TZ-91-extension invite-flow (manual admin creates manager accounts).
   *
   * TODO TZ-91-extension: replace @Public() with @Roles('admin') once invite-flow ships.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /**
   * TZ-91 І4 Phase A.3: rate-limit на /auth/login Ч 5 req/min (short) + 20 req/hour (long),
   * brute-force prevention. Global @nestjs/throttler (TZ-18) still applies; local @Throttle
   * overrides global дл€ этого endpoint.
   */
  @Public()
  @Throttle({ short: { ttl: 60_000, limit: 5 }, long: { ttl: 3_600_000, limit: 20 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() _dto: RefreshTokenDto,
    @CurrentUser() payload: RefreshPayload,
  ) {
    return this.auth.refresh(payload.id, payload.version);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() me: AuthenticatedUser) {
    await this.auth.logout(me.id);
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUser() me: AuthenticatedUser) {
    return this.users.findById(me.id);
  }
}
