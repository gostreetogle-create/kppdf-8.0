import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './organization.schema';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationContactModule } from './contacts/organization-contact.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
    OrganizationContactModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService, MongooseModule],
})
export class OrganizationModule {}
