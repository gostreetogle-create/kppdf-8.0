import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { IsINN } from '../../../common/validators/inn.validator';

export class CreateOrganizationDto {
  @IsString()
  @Length(1, 256)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 128)
  shortName?: string;

  @IsOptional()
  @IsString()
  legalForm?: string;

  @IsINN()
  inn!: string;

  @IsOptional()
  @IsString()
  @Length(0, 16)
  kpp?: string;

  @IsOptional()
  @IsString()
  @Length(0, 16)
  ogrn?: string;

  @IsOptional()
  @IsString()
  @Length(0, 16)
  ogrnip?: string;

  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() @Length(9, 9) bankBik?: string;
  @IsOptional() @IsString() @Length(0, 32) bankAccount?: string;
  @IsOptional() @IsString() @Length(0, 32) bankCorrAccount?: string;

  @IsOptional() @IsString() signerName?: string;
  @IsOptional() @IsString() signerPosition?: string;

  @IsOptional() @IsInt() @Min(0) @Max(365) paymentTermDays?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) vatRate?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  type?: string[];

  @IsOptional()
  @IsIn(['ooo', 'ip', 'pao', 'ao', 'other'])
  legalType?: 'ooo' | 'ip' | 'pao' | 'ao' | 'other';

  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() directorName?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partyTypes?: string[];

  @IsOptional() @IsMongoId() contactPersonId?: string;

  @IsOptional() @IsString() passportSeries?: string;
  @IsOptional() @IsString() passportNumber?: string;
  @IsOptional() @IsString() passportIssuedBy?: string;
  @IsOptional() @Type(() => Date) @IsDate() passportIssuedAt?: Date;
  @IsOptional() @IsString() passportDivisionCode?: string;
}
