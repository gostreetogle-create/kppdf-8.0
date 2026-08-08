import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormProfile, FormProfileSchema } from './form-profile.schema';
import { FormProfilesService } from './form-profiles.service';
import { FormProfilesController } from './form-profiles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormProfile.name, schema: FormProfileSchema },
    ]),
  ],
  controllers: [FormProfilesController],
  providers: [FormProfilesService],
  exports: [FormProfilesService, MongooseModule],
})
export class FormProfilesModule {}
