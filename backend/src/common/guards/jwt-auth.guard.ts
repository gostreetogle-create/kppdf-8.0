import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { User, UserDocument } from '../../modules/user/user.schema';
import { Role, RoleDocument } from '../../modules/role/role.schema';
import { userActivityCache } from './user-activity-cache';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {
    super();
  }

  override async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const ok = await super.canActivate(context);
    if (!ok) {
      return false;
    }

    const req = context.switchToHttp().getRequest<{ user: { id?: string; role?: string } }>();
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('No user context');
    }

    const activity = await userActivityCache.getOrFetch(
      userId,
      async () => {
        const dbUser = await this.userModel.findById(userId).lean().exec();
        if (!dbUser || dbUser.isActive === false) {
          return { active: false, reason: 'user_inactive' };
        }
        if (dbUser.role) {
          const role = await this.roleModel
            .findOne({ name: dbUser.role })
            .lean()
            .exec();
          if (!role || role.isActive === false) {
            return { active: false, reason: 'role_inactive' };
          }
        }
        return { active: true };
      },
    );

    if (!activity.active) {
      throw new UnauthorizedException(
        `User access revoked: ${activity.reason}`,
      );
    }

    return true;
  }
}