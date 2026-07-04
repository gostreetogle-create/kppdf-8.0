import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @Roles('admin', 'manager')
  list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.service.findAll(parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * Read a user: self can always read self; admin can read anyone.
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() me: AuthenticatedUser,
  ) {
    if (me.role !== 'admin' && me.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.service.findById(id);
  }

  @Get('me/profile')
  @Roles('admin', 'manager', 'user')
  getMe(@CurrentUser() me: AuthenticatedUser) {
    return this.service.findById(me.id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  /**
   * Self-update: limited to displayName, phone, fullName, email.
   * Admin can update anyone and can additionally change role, isActive, permissions.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() me: AuthenticatedUser,
  ) {
    if (me.role !== 'admin' && me.id !== id) {
      throw new ForbiddenException('You can only edit your own profile');
    }
    if (me.role !== 'admin') {
      // Non-admin cannot change role / isActive / permissions
      delete (dto as Partial<UpdateUserDto> & Record<string, unknown>).role;
      delete (dto as Partial<UpdateUserDto> & Record<string, unknown>).isActive;
      delete (dto as Partial<UpdateUserDto> & Record<string, unknown>).permissions;
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/change-password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() me: AuthenticatedUser,
  ) {
    if (me.role !== 'admin' && me.id !== id) {
      throw new ForbiddenException('You can only change your own password');
    }
    return this.service.changePassword(id, dto);
  }
}
