import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword!: string;

  @IsString()
  @Length(8, 128)
  newPassword!: string;
}
