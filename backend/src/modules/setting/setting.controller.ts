import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { SettingService } from './setting.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Controller('settings')
export class SettingController {
  constructor(private readonly service: SettingService) {}

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query('group') group?: string) {
    return this.service.findAll(group);
  }

  @Get(':key')
  @Roles('admin', 'manager')
  findOne(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @Put(':key')
  @Roles('admin')
  upsert(@Param('key') key: string, @Body() dto: UpsertSettingDto) {
    return this.service.set(key, dto.value, dto.group, dto.description);
  }

  @Delete(':key')
  @Roles('admin')
  remove(@Param('key') key: string) {
    return this.service.remove(key);
  }
}
