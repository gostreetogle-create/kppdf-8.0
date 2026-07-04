import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
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
