import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TechProcessService } from './tech-process.service';
import { CreateTechProcessDto } from './dto/create-tech-process.dto';
import { UpdateTechProcessDto } from './dto/update-tech-process.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller()
export class TechProcessController {
  constructor(private readonly service: TechProcessService) {}

  @Get('products/:productId/tech-processes')
  listForProduct(@Param('productId') productId: string) {
    return this.service.findByProductId(productId);
  }

  @Post('products/:productId/tech-processes')
  @AuditAction({ action: 'create', entityType: 'TechProcess' })
  createForProduct(
    @Param('productId') productId: string,
    @Body() dto: CreateTechProcessDto,
  ) {
    return this.service.create({ ...dto, productId });
  }

  @Get('tech-processes')
  findAll() {
    return this.service.findAll();
  }

  @Get('tech-processes/:id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('tech-processes/:id/expanded')
  expanded(@Param('id') id: string) {
    return this.service.findById(id, true);
  }

  @Post('tech-processes/:id/activate')
  @AuditAction({ action: 'activate', entityType: 'TechProcess' })
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Patch('tech-processes/:id')
  @AuditAction({ action: 'update', entityType: 'TechProcess' })
  update(@Param('id') id: string, @Body() dto: UpdateTechProcessDto) {
    return this.service.update(id, dto);
  }

  @Delete('tech-processes/:id')
  @AuditAction({ action: 'delete', entityType: 'TechProcess' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
