import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { GeneratedDocumentService } from './generated-document.service';
import { BuildDocumentDto } from '../document-template/dto/build-document.dto';
import { IsOptional, IsString } from 'class-validator';

class GenerateDocumentOptionsDto extends BuildDocumentDto {
  @IsOptional() @IsString()
  name?: string;
}

@Controller('generated-documents')
export class GeneratedDocumentController {
  constructor(private readonly service: GeneratedDocumentService) {}

  @Get()
  findAll(
    @Query('templateId') templateId?: string,
    @Query('sourceType') sourceType?: string,
    @Query('sourceId') sourceId?: string,
  ) {
    return this.service.findAll({ templateId, sourceType, sourceId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/html')
  async html(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const doc = await this.service.findById(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(doc.html);
  }

  @Post('from-template/:templateId')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'generate', entityType: 'GeneratedDocument' })
  generate(
    @Param('templateId') templateId: string,
    @Body() dto: GenerateDocumentOptionsDto,
  ) {
    const { name, ...buildDto } = dto;
    return this.service.generate(templateId, buildDto, { name });
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'GeneratedDocument' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
