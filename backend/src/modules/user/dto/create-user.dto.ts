import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'ivan_petrov', description: 'Имя пользователя (латиница, цифры, _ . -)' })
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'username may contain only letters, digits, _ . -',
  })
  username!: string;

  @ApiProperty({ example: 'ivan@example.com', description: 'Email адрес' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Иван Петров', description: 'Отображаемое имя' })
  @IsString()
  @Length(1, 128)
  displayName!: string;

  @ApiProperty({ description: 'Пароль (минимум 8 символов)' })
  @IsString()
  @Length(8, 128)
  password!: string;

  @ApiProperty({ enum: ['user', 'manager', 'admin'], description: 'Роль пользователя' })
  @IsIn(['user', 'manager', 'admin'])
  role!: string;

  @ApiPropertyOptional({ type: [String], description: 'Разрешения' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: 'Активен ли пользователь' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Телефон' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Полное имя' })
  @IsOptional()
  @IsString()
  fullName?: string;
}
