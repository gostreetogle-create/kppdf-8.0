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
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyService } from './currency.service';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly service: CurrencyService) {}

  @Get()
  @Roles('admin', 'manager', 'user')
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get('active')
  @Roles('admin', 'manager', 'user')
  listActive() {
    return this.service.findActive();
  }

  @Get(':code')
  @Roles('admin', 'manager', 'user')
  findOne(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Post()
  @Roles('admin')
  @AuditAction({ action: 'create', entityType: 'Currency' })
  create(@Body() dto: CreateCurrencyDto) {
    return this.service.create(dto);
  }

  @Patch(':code')
  @Roles('admin')
  @AuditAction({ action: 'update', entityType: 'Currency', idParam: 'code' })
  update(@Param('code') code: string, @Body() dto: UpdateCurrencyDto) {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  @Roles('admin')
  @AuditAction({ action: 'delete', entityType: 'Currency', idParam: 'code' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('code') code: string) {
    return this.service.remove(code);
  }
}
