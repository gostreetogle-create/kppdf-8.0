import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCompositionLineDto, UpdateCompositionLineDto } from '../catalog/composition-line.dto';
import { CatalogGraphService, MAX_DEPTH } from '../catalog-graph/catalog-graph.service';
import { ProductModuleService, UpsertProductModuleDto } from './product-module.service';

@Controller('modules')
export class ProductModuleController {
  constructor(
    private readonly service: ProductModuleService,
    private readonly catalogGraph: CatalogGraphService,
  ) {}

  @Get()
  @Roles('admin', 'manager')
  list(@Query('productId') productId?: string) { return this.service.findAll(productId); }

  @Get(':id/composition')
  @Roles('admin', 'manager')
  getComposition(@Param('id') id: string) { return this.service.getComposition(id); }

  @Post(':id/composition')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'add-composition-line', entityType: 'ProductModule', idParam: 'id' })
  addComposition(@Param('id') id: string, @Body() dto: CreateCompositionLineDto) { return this.service.addComposition(id, dto); }

  @Patch(':id/composition/:lineId')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update-composition-line', entityType: 'ProductModule', idParam: 'id' })
  updateComposition(@Param('id') id: string, @Param('lineId') lineId: string, @Body() dto: UpdateCompositionLineDto) {
    return this.service.updateComposition(id, lineId, dto);
  }

  @Delete(':id/composition/:lineId')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditAction({ action: 'remove-composition-line', entityType: 'ProductModule', idParam: 'id' })
  async removeComposition(@Param('id') id: string, @Param('lineId') lineId: string) { await this.service.removeComposition(id, lineId); }

  @Get(':id/tree')
  @Roles('admin', 'manager')
  getTree(@Param('id') id: string, @Query('maxDepth') maxDepth?: string) {
    return this.catalogGraph.getTree('module', id, maxDepth === undefined ? MAX_DEPTH : Number(maxDepth));
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findOne(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'ProductModule' })
  create(@Body() dto: UpsertProductModuleDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'ProductModule', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: Partial<UpsertProductModuleDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'ProductModule', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
