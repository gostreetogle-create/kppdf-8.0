import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { AuthResponse, AccessTokenResponse, AuthUserPayload } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // TZ-91 §4 Phase A.1: dto.role is `@IsOptional @IsIn(['user','manager'])` — defaults to 'user'
    // if not provided. 'user' is the safest default (lowest privilege, defence-in-depth: admin/manager
    // accounts MUST be created through admin-invite-flow or admin.seed, never via /register).
    const user = await this.users.create({
      username: dto.username,
      email: dto.email,
      displayName: dto.displayName,
      password: dto.password,
      role: dto.role ?? 'user',
      permissions: dto.permissions ?? [],
      isActive: dto.isActive ?? true,
      phone: dto.phone,
      fullName: dto.fullName,
    });
    this.logger.log(`User registered: ${user.username} (${user.role})`);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByUsername(dto.username);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await this.users.verifyPassword(user, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    user.lastLoginAt = new Date();
    await user.save();
    this.logger.log(`User logged in: ${user.username}`);
    return this.buildAuthResponse(user);
  }

  /**
   * Called by the /auth/refresh endpoint. The `id` and `version` come from
   * the validated JWT payload (see JwtRefreshStrategy.validate). If we
   * reach this point, the token is signed, unexpired, and matches the
   * current user version.
   */
  async refresh(userId: string, version: number): Promise<AccessTokenResponse> {
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    if (user.refreshTokenVersion !== version) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    const access = await this.signAccess(user);
    return { access };
  }

  /**
   * TZ-92 Phase 1: safe projection for the /auth/me endpoint.
   *
   * Previously the GET /me controller returned UserService.findById(me.id) —
   * a full `UserDocument` including `passwordHash`, `refreshTokenVersion`, and
   * any other internal fields. This was HIGH severity QA-01:1.4: any
   * authenticated user could read their own `refreshTokenVersion`, and the
   * value would have leaked in a cross-user read too (admin viewing user).
   *
   * Fix: re-use the existing private `toAuthUser` projection which strips the
   * sensitive fields. Returns `AuthUserPayload` — the same shape the
   * `register` + `login` endpoints return in their `user:` response slot.
   *
   * Notes:
   * - `findById` + `isActive` check here duplicates the `refresh` method's
   *   safety net. Kept intentionally: GET /me is a user-visible surface
   *   so we don't want to return a ghost user record.
   * - Security: throws 401 if user is missing/inactive rather than 404
   *   to avoid fingerprinting ("user exists but is disabled" leaks).
   */
  async getMe(userId: string): Promise<AuthUserPayload> {
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return this.toAuthUser(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.incrementRefreshVersion(userId);
    this.logger.log(`User logged out (id=${userId})`);
  }

  // --- helpers ---

  private async buildAuthResponse(user: UserDocument): Promise<AuthResponse> {
    const [access, refresh] = await Promise.all([
      this.signAccess(user),
      this.signRefresh(user),
    ]);
    return {
      access,
      refresh,
      user: this.toAuthUser(user),
    };
  }

  private async signAccess(user: UserDocument): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        version: user.refreshTokenVersion,
      },
      {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get<string>('jwt.expiresIn') ?? '15m',
      },
    );
  }

  private async signRefresh(user: UserDocument): Promise<string> {
    return this.jwt.signAsync(
      { sub: user.id, version: user.refreshTokenVersion },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn:
          this.config.get<string>('jwt.refreshExpiresIn') ?? '7d',
      },
    );
  }

  private toAuthUser(user: UserDocument): AuthUserPayload {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      permissions: user.permissions ?? [],
    };
  }
}
