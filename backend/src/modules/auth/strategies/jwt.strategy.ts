import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

export interface JwtAccessPayload {
  sub: string;
  username: string;
  role: string;
  version: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    config: ConfigService,
    private readonly users: UserService,
  ) {
    const secret = config.get<string>('jwt.secret');
    if (!secret) throw new Error('jwt.secret not configured');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Called by Passport after the JWT signature is verified.
   * Hydrates req.user with the fresh user record (so role/permissions
   * reflect the current DB state, not the token's stale claims).
   */
  async validate(payload: JwtAccessPayload) {
    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions ?? [],
    };
  }
}
