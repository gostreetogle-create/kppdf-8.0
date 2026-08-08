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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto';
import { QuickCreatePartyDto } from './dto/quick-create-party.dto';
import { CounterpartyService } from './counterparty.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('counterparties')
export class CounterpartyController {
  constructor(private readonly service: CounterpartyService) {}

  @Get()
  @Roles('admin', 'manager')
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('role') role?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.service.findAll(
      { page: parseInt(page, 10), limit: parseInt(limit, 10), search, role },
      user
        ? { organizationId: user.organizationId, role: user.role }
        : undefined,
    );
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('quick')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Counterparty' })
  quickCreate(@Body() dto: QuickCreatePartyDto) {
    return this.service.quickCreateParty(dto);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'Counterparty' })
  create(@Body() dto: CreateCounterpartyDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'Counterparty', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateCounterpartyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'Counterparty', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
