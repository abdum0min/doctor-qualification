import { Module } from '@nestjs/common';

import { SpecialtiesModule } from 'src/modules/specialties/specialties.module';

import { AdminDoctorsController } from './admin-doctors.controller';
import { AdminDoctorsService } from './admin-doctors.service';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

@Module({
  imports: [SpecialtiesModule],
  controllers: [DoctorsController, AdminDoctorsController],
  providers: [DoctorsService, AdminDoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
