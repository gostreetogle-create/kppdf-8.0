import { PartialType } from '@nestjs/mapped-types';
import { CreateTableTemplateDto } from './create-table-template.dto';

export class UpdateTableTemplateDto extends PartialType(CreateTableTemplateDto) {}
