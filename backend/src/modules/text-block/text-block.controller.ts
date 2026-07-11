import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { TextBlockService } from './text-block.service';
import { CreateTextBlockDto } from './dto/create-text-block.dto';
import { UpdateTextBlockDto } from './dto/update-text-block.dto';
import type { TextBlockCategory } from './text-block.schema';

/**
 * TZ-86 Phase A.1 — TextBlock controller.
 *
 * Routes: GET / (list, optionally filtered by category+isActive),
 *  GET /:id, POST /, PATCH /:id, DELETE /:id. Audit hooks via @AuditAction
 *  which globally registers AuditInterceptor metadata for the action.
 */
@Controller('text-blocks')
export class TextBlockController {
  constructor(private readonly service: TextBlockService) {}

  @Get()
  list(
    @Query('category') category?: TextBlockCategory,
    @Query('isActive') isActive?: string,
  ) {
    const filter: { category?: TextBlockCategory; isActive?: boolean } = {};
    if (category) filter.category = category;
    if (typeof isActive === 'string') {
      if (isActive === 'true') filter.isActive = true;
      else if (isActive === 'false') filter.isActive = false;
    }
    return this.service.findAll(filter);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'TextBlock' })
  create(@Body() dto: CreateTextBlockDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'TextBlock' })
  update(@Param('id') id: string, @Body() dto: UpdateTextBlockDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'TextBlock' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
