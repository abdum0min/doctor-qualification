import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
  ApiPaginatedResponse,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { AdminDoctorsService } from './admin-doctors.service';
import { AdminDoctorQueryDto } from './dto/admin-doctor-query.dto';
import { AdminDoctorDetailDto, AdminDoctorDto } from './dto/admin-doctor.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';

@ApiTags('Admin · Doctors')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@ApiErrorResponses(401, 403)
@Controller('admin/doctors')
export class AdminDoctorsController {
  constructor(private readonly adminDoctorsService: AdminDoctorsService) {}

  @Get()
  @ResponseMessage('Doctors')
  @ApiOperation({ summary: 'Shifokorlar ro`yxati — qidiruv va filtr bilan' })
  @ApiPaginatedResponse(AdminDoctorDto)
  findMany(@Query() query: AdminDoctorQueryDto) {
    return this.adminDoctorsService.findMany(query);
  }

  @Get(':id')
  @ResponseMessage('Doctor')
  @ApiOperation({
    summary: 'Bitta shifokor — urinishlari va sertifikatlari bilan',
  })
  @ApiDataResponse(AdminDoctorDetailDto)
  @ApiErrorResponses(404)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminDoctorsService.findOne(id);
  }

  @Patch(':id/status')
  @ResponseMessage('Doctor status updated')
  @ApiOperation({
    summary: 'Hisobni bloklash yoki faollashtirish',
    description:
      'Yozuvlar o`chirilmaydi — bloklangan shifokor tizimga kira olmaydi, ' +
      'lekin natijalari va sertifikatlari saqlanib qoladi.',
  })
  @ApiDataResponse(AdminDoctorDto)
  @ApiErrorResponses(400, 404)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorStatusDto,
  ) {
    return this.adminDoctorsService.updateStatus(id, dto);
  }
}
