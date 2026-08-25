import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/types/authenticated-user.type';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
  ApiPaginatedResponse,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/generated/prisma/enums';

import { CertificatePdfService } from './certificate-pdf.service';
import { CertificatesService } from './certificates.service';
import { AdminCertificateQueryDto } from './dto/admin-certificate-query.dto';
import { CertificateQueryDto } from './dto/certificate-query.dto';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';
import {
  CertificateDto,
  CertificateVerificationDto,
} from './dto/certificate.dto';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly certificatePdfService: CertificatePdfService,
  ) {}

  @Public()
  @Get('verify/:certificateId')
  @ResponseMessage('Certificate verification')
  @ApiOperation({
    summary: 'Sertifikatni ochiq tekshirish',
    description:
      'Autentifikatsiya talab qilinmaydi. Javobda shifokorning shaxsiy ' +
      'ma`lumotlari (email, telefon) qaytarilmaydi.',
  })
  @ApiDataResponse(CertificateVerificationDto)
  verify(@Param('certificateId') certificateId: string) {
    return this.certificatesService.verify(certificateId);
  }

  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth('access-token')
  @Get()
  @ResponseMessage('Certificates')
  @ApiOperation({ summary: 'Shifokorning sertifikatlari' })
  @ApiPaginatedResponse(CertificateDto)
  @ApiErrorResponses(401, 403)
  findOwn(
    @CurrentUser('id') userId: number,
    @Query() query: CertificateQueryDto,
  ) {
    return this.certificatesService.findOwn(userId, query);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('all')
  @ResponseMessage('Certificates')
  @ApiOperation({ summary: 'Barcha sertifikatlar — admin ro`yxati' })
  @ApiPaginatedResponse(CertificateDto)
  @ApiErrorResponses(401, 403)
  findAll(@Query() query: AdminCertificateQueryDto) {
    return this.certificatesService.findAll(query);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':certificateId/revoke')
  @ResponseMessage('Certificate revoked')
  @ApiOperation({
    summary: 'Sertifikatni bekor qilish',
    description:
      'Yozuv o`chirilmaydi — holat REVOKED ga o`tadi va ommaviy tekshiruv ' +
      'darhol shuni ko`rsatadi.',
  })
  @ApiDataResponse(CertificateDto)
  @ApiErrorResponses(400, 401, 403, 404, 409)
  revoke(
    @Param('certificateId') certificateId: string,
    @Body() dto: RevokeCertificateDto,
  ) {
    return this.certificatesService.revoke(certificateId, dto);
  }

  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @Get(':certificateId/download')
  @ApiOperation({
    summary: 'Sertifikatni PDF sifatida yuklab olish',
    description:
      'Shifokor faqat o`z sertifikatini, admin esa istalganini yuklab oladi.',
  })
  @ApiProduces('application/pdf')
  @ApiErrorResponses(401, 403, 404)
  async download(
    @CurrentUser() user: AuthenticatedUser,
    @Param('certificateId') certificateId: string,
    @Res() response: Response,
  ): Promise<void> {
    const certificate = await this.certificatesService.findForDownload(
      user,
      certificateId,
    );

    const pdf = await this.certificatePdfService.render(certificate);

    response
      .status(200)
      .setHeader('Content-Type', 'application/pdf')
      .setHeader(
        'Content-Disposition',
        `attachment; filename="${certificate.certificateId}.pdf"`,
      )
      .setHeader('Content-Length', pdf.length)
      .end(pdf);
  }
}
