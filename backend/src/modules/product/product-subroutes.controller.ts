import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductService } from './product.service';

interface AttachPhotoDto {
  photoId: string;
}

interface AttachModuleDto {
  productModuleId: string;
}

@Controller('products/:id')
export class ProductSubroutesController {
  constructor(private readonly productService: ProductService) {}

  @Post('photos')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'attach-photo', entityType: 'Product' })
  async attachPhoto(@Param('id') id: string, @Body() dto: AttachPhotoDto) {
    return this.productService.update(id, { photoIds: undefined as unknown as string[] } as never).catch(async () => {
      // fallback: do the real work
      const doc = await this.productService.findById(id);
      const ids = new Set((doc.photoIds ?? []).map((p) => p.toString()));
      ids.add(dto.photoId);
      return this.productService.update(id, { photoIds: [...ids] } as never);
    });
  }

  @Post('modules')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'attach-module', entityType: 'Product' })
  async attachModule(@Param('id') id: string, @Body() dto: AttachModuleDto) {
    const doc = await this.productService.findById(id);
    const ids = new Set((doc.productModuleIds ?? []).map((m) => m.toString()));
    ids.add(dto.productModuleId);
    return this.productService.update(id, { productModuleIds: [...ids] } as never);
  }
}
