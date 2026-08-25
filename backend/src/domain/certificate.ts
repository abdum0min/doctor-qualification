/** Sertifikatda va ommaviy tekshiruvda ko'rinadigan platforma nomi. */
export const PLATFORM_NAME = 'Doctor Qualification';

/** Sertifikat amal qilish muddati (oy). */
export const CERTIFICATE_VALIDITY_MONTHS = 12;

const ID_PREFIX = 'DOC';
const ID_DIGITS = 6;

export function buildCertificateId(
  sequenceNumber: number,
  issuedAt: Date,
): string {
  return [
    ID_PREFIX,
    issuedAt.getUTCFullYear(),
    String(sequenceNumber).padStart(ID_DIGITS, '0'),
  ].join('-');
}

export function certificateExpiryDate(issuedAt: Date): Date {
  const expiresAt = new Date(issuedAt);
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + CERTIFICATE_VALIDITY_MONTHS);

  return expiresAt;
}

export type VerificationStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND';
