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
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';
import { AuditAction } from '../../common/decorators/audit-action.decorator';

@Controller('contracts')
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @Get()
  findAll(
    @Query('counterpartyId') counterpartyId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findAll(
      counterpartyId,
      status,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @AuditAction({ action: 'create', entityType: 'Contract' })
  create(@Body() dto: CreateContractDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @AuditAction({ action: 'update', entityType: 'Contract' })
  update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/sign')
  @AuditAction({ action: 'sign', entityType: 'Contract' })
  sign(@Param('id') id: string, @Body() dto: SignContractDto) {
    return this.service.sign(id, dto.signedAt);
  }

  @Post(':id/activate')
  @AuditAction({ action: 'activate', entityType: 'Contract' })
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Delete(':id')
  @AuditAction({ action: 'delete', entityType: 'Contract' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
