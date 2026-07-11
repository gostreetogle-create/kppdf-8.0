import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'username may contain only letters, digits, _ . -',
  })
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 128)
  displayName!: string;

  @IsString()
  @Length(8, 128)
  password!: string;

  /**
   * Role whitelist: only 'user' or 'manager' allowed via public POST /auth/register.
   * 'admin' role is NEVER accepted from public API (created only via DB seed in
   * `backend/src/common/seed/admin.seed.ts` or future TZ-91-extension invite-flow).
   *
   * TZ-91 §2 Decision 1 + §4 Phase A.1. DTO-level constraint is defense-in-depth:
   * even if controller-level guard is missing, no admin account can be created via /register.
   */
  @IsOptional()
  @IsIn(['user', 'manager'])
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
