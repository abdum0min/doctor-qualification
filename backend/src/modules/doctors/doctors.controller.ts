import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { DoctorsService } from './doctors.service';
import { DoctorOverviewDto } from './dto/doctor-overview.dto';
import { DoctorProfileDto } from './dto/doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@ApiTags('Doctors')
@ApiBearerAuth('access-token')
@Roles(UserRole.DOCTOR)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('me')
  @ResponseMessage('Doctor profile')
  @ApiOperation({ summary: 'Joriy shifokorning profili' })
  @ApiDataResponse(DoctorProfileDto)
  @ApiErrorResponses(401, 403, 404)
  findOwnProfile(@CurrentUser('id') userId: number) {
    return this.doctorsService.findOwnProfile(userId);
  }

  @Get('me/overview')
  @ResponseMessage('Doctor overview')
  @ApiOperation({
    summary: 'Boshqaruv paneli uchun profil va natijalar xulosasi',
  })
  @ApiDataResponse(DoctorOverviewDto)
  @ApiErrorResponses(401, 403, 404)
  findOwnOverview(@CurrentUser('id') userId: number) {
    return this.doctorsService.findOwnOverview(userId);
  }

  @Patch('me')
  @ResponseMessage('Profile updated')
  @ApiOperation({ summary: 'Profil ma`lumotlarini yangilash' })
  @ApiDataResponse(DoctorProfileDto)
  @ApiErrorResponses(400, 401, 403, 404)
  updateOwnProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.updateOwnProfile(userId, dto);
  }
}
