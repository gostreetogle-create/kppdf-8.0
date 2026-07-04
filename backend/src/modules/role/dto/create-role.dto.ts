import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(2, 64)
  @Matches(/^[a-z][a-z0-9_-]*$/, {
    message: 'name must be lowercase, start with a letter, and use only a-z, 0-9, _, -',
  })
  name!: string;

  @IsString()
  @Length(2, 128)
  label!: string;

  @IsOptional()
  @IsString()
  @Length(0, 512)
  description?: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions!: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectionIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** System roles (e.g. 'admin') cannot be deleted. Typically only set by seed. */
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
