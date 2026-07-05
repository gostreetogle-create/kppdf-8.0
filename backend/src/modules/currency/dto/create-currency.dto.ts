import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'Код валюты должен состоять из 3 заглавных латинских букв (ISO-4217)',
  })
  code!: string;

  @IsString()
  @Length(1, 128)
  label!: string;

  @IsOptional()
  @IsString()
  @Length(1, 8)
  symbol?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
