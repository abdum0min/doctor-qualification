import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

import { PLATFORM_NAME } from 'src/domain/certificate';
import { EnvironmentVariables } from 'src/config/env.validation';
import { QualificationLevel } from 'src/generated/prisma/enums';

import { CertificateView, resolveStatus } from './certificates.service';

const QUALIFICATION_LABELS: Record<QualificationLevel, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  GOOD: 'Yaxshi',
  HIGH: 'Yuqori',
  EXPERT: 'Ekspert',
};

const COLORS = {
  ink: '#0f172a',
  muted: '#64748b',
  primary: '#2563eb',
  border: '#cbd5e1',
  accent: '#eff6ff',
  revoked: '#dc2626',
};

const PAGE = { width: 842, height: 595, margin: 44 };

function formatDate(value: Date): string {
  return value.toLocaleDateString('en-GB').replace(/\//g, '.');
}

/**
 * Sertifikat PDF'i faqat shu yerda quriladi — controller va boshqa servislar
 * chizish tafsilotlarini bilmaydi.
 */
@Injectable()
export class CertificatePdfService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async render(certificate: CertificateView): Promise<Buffer> {
    const verifyUrl = this.buildVerifyUrl(certificate.certificateId);
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 0,
      width: 240,
      color: { dark: COLORS.ink, light: '#ffffff' },
    });

    const doc = new PDFDocument({
      size: [PAGE.width, PAGE.height],
      margin: PAGE.margin,
      info: {
        Title: `Certificate ${certificate.certificateId}`,
        Author: PLATFORM_NAME,
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const finished = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    this.drawFrame(doc);
    this.drawHeader(doc);
    this.drawBody(doc, certificate);
    this.drawFooter(doc, certificate, qrDataUrl, verifyUrl);

    doc.end();

    return finished;
  }

  private drawFrame(doc: PDFKit.PDFDocument): void {
    doc
      .lineWidth(2)
      .strokeColor(COLORS.primary)
      .rect(20, 20, PAGE.width - 40, PAGE.height - 40)
      .stroke();

    doc
      .lineWidth(0.75)
      .strokeColor(COLORS.border)
      .rect(30, 30, PAGE.width - 60, PAGE.height - 60)
      .stroke();
  }

  private drawHeader(doc: PDFKit.PDFDocument): void {
    doc
      .fillColor(COLORS.primary)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(PLATFORM_NAME.toUpperCase(), 0, 58, {
        align: 'center',
        characterSpacing: 2,
      });

    doc
      .fillColor(COLORS.ink)
      .fontSize(30)
      .font('Helvetica-Bold')
      .text('SERTIFIKAT', 0, 82, { align: 'center' });

    doc
      .fillColor(COLORS.muted)
      .fontSize(10)
      .font('Helvetica')
      .text('Malaka darajasini tasdiqlovchi elektron hujjat', 0, 120, {
        align: 'center',
      });
  }

  private drawBody(
    doc: PDFKit.PDFDocument,
    certificate: CertificateView,
  ): void {
    doc
      .fillColor(COLORS.muted)
      .fontSize(10)
      .font('Helvetica')
      .text('Ushbu sertifikat quyidagi shifokorga berildi', 0, 156, {
        align: 'center',
      });

    doc
      .fillColor(COLORS.ink)
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(certificate.doctorFullname, PAGE.margin, 180, {
        align: 'center',
        width: PAGE.width - PAGE.margin * 2,
      });

    doc
      .moveTo(PAGE.width / 2 - 130, 216)
      .lineTo(PAGE.width / 2 + 130, 216)
      .lineWidth(1)
      .strokeColor(COLORS.border)
      .stroke();

    doc
      .fillColor(COLORS.muted)
      .fontSize(10)
      .font('Helvetica')
      .text(certificate.examTitle, PAGE.margin, 228, {
        align: 'center',
        width: PAGE.width - PAGE.margin * 2,
      });

    this.drawStats(doc, certificate);
  }

  private drawStats(
    doc: PDFKit.PDFDocument,
    certificate: CertificateView,
  ): void {
    const stats = [
      { label: 'Mutaxassislik', value: certificate.specialtyName },
      { label: 'Test natijasi', value: `${certificate.score}%` },
      {
        label: 'Malaka darajasi',
        value: QUALIFICATION_LABELS[certificate.qualification],
      },
    ];

    const boxWidth = 200;
    const gap = 20;
    const totalWidth = stats.length * boxWidth + (stats.length - 1) * gap;
    const startX = (PAGE.width - totalWidth) / 2;
    const top = 266;

    stats.forEach((stat, index) => {
      const x = startX + index * (boxWidth + gap);

      doc
        .roundedRect(x, top, boxWidth, 74, 8)
        .fillAndStroke(COLORS.accent, COLORS.border);

      doc
        .fillColor(COLORS.muted)
        .fontSize(9)
        .font('Helvetica')
        .text(stat.label.toUpperCase(), x, top + 16, {
          width: boxWidth,
          align: 'center',
          characterSpacing: 1,
        });

      doc
        .fillColor(COLORS.ink)
        .fontSize(17)
        .font('Helvetica-Bold')
        .text(stat.value, x, top + 38, { width: boxWidth, align: 'center' });
    });
  }

  private drawFooter(
    doc: PDFKit.PDFDocument,
    certificate: CertificateView,
    qrDataUrl: string,
    verifyUrl: string,
  ): void {
    const baseline = 392;

    const details = [
      ['Certificate ID', certificate.certificateId],
      ['Berilgan sana', formatDate(certificate.issuedAt)],
      ['Amal qilish muddati', formatDate(certificate.expiresAt)],
    ];

    details.forEach(([label, value], index) => {
      const y = baseline + index * 26;

      doc
        .fillColor(COLORS.muted)
        .fontSize(9)
        .font('Helvetica')
        .text(label.toUpperCase(), PAGE.margin + 26, y, {
          characterSpacing: 1,
        });

      doc
        .fillColor(COLORS.ink)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(value, PAGE.margin + 26, y + 11);
    });

    const qrSize = 108;
    const qrX = PAGE.width - PAGE.margin - qrSize - 26;

    doc.image(Buffer.from(qrDataUrl.split(',')[1], 'base64'), qrX, baseline, {
      width: qrSize,
      height: qrSize,
    });

    doc
      .fillColor(COLORS.muted)
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Haqiqiyligini tekshirish uchun QR kodni skanerlang',
        qrX - 70,
        baseline + qrSize + 8,
        {
          width: qrSize + 140,
          align: 'center',
        },
      );

    doc
      .fillColor(COLORS.primary)
      .fontSize(8)
      .text(verifyUrl, qrX - 70, baseline + qrSize + 20, {
        width: qrSize + 140,
        align: 'center',
      });

    if (resolveStatus(certificate) === 'REVOKED') {
      doc
        .fillColor(COLORS.revoked)
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('BEKOR QILINGAN', PAGE.margin + 26, baseline + 88);
    }
  }

  private buildVerifyUrl(certificateId: string): string {
    const base = this.configService
      .get('PUBLIC_APP_URL', { infer: true })
      .replace(/\/$/, '');

    return `${base}/verify/${certificateId}`;
  }
}
