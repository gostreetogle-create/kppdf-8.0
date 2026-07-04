import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
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

  @IsString()
  role!: string;

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
