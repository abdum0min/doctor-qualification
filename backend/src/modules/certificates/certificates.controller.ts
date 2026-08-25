import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
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
import { CertificateQueryDto } from './dto/certificate-query.dto';
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

  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth('access-token')
  @Get(':certificateId/download')
  @ApiOperation({ summary: 'Sertifikatni PDF sifatida yuklab olish' })
  @ApiProduces('application/pdf')
  @ApiErrorResponses(401, 403, 404)
  async download(
    @CurrentUser('id') userId: number,
    @Param('certificateId') certificateId: string,
    @Res() response: Response,
  ): Promise<void> {
    const certificate = await this.certificatesService.findOwnByCertificateId(
      userId,
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
