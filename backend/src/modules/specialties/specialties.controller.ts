import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { SpecialtyQueryDto } from './dto/specialty-query.dto';
import { AdminSpecialtyDto, SpecialtyDto } from './dto/specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { SpecialtiesService } from './specialties.service';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Public()
  @Get()
  @ResponseMessage('Specialties')
  @ApiOperation({ summary: 'Faol mutaxassisliklar ro`yxati (ochiq)' })
  @ApiDataResponse(SpecialtyDto, { isArray: true })
  findActive(@Query() query: SpecialtyQueryDto) {
    return this.specialtiesService.findActive(query);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('all')
  @ResponseMessage('Specialties')
  @ApiOperation({
    summary: 'Barcha mutaxassisliklar — nofaollari bilan (admin)',
  })
  @ApiDataResponse(AdminSpecialtyDto, { isArray: true })
  @ApiErrorResponses(401, 403)
  findAll(@Query() query: SpecialtyQueryDto) {
    return this.specialtiesService.findAll(query);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ResponseMessage('Specialty created')
  @ApiOperation({ summary: 'Yangi mutaxassislik qo`shish' })
  @ApiDataResponse(SpecialtyDto, { status: 201 })
  @ApiErrorResponses(400, 401, 403, 409)
  create(@Body() dto: CreateSpecialtyDto) {
    return this.specialtiesService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ResponseMessage('Specialty updated')
  @ApiOperation({
    summary: 'Mutaxassislikni tahrirlash yoki faolligini o`zgartirish',
  })
  @ApiDataResponse(SpecialtyDto)
  @ApiErrorResponses(400, 401, 403, 404, 409)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(id, dto);
  }
}
