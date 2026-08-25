import type { Certificate, VerificationStatus } from './types'

interface StatusPresentation {
  label: string
  variant: 'success' | 'warning' | 'destructive' | 'secondary'
}

export const VERIFICATION_PRESENTATION: Record<
  VerificationStatus,
  StatusPresentation
> = {
  VALID: { label: 'Haqiqiy', variant: 'success' },
  EXPIRED: { label: 'Muddati tugagan', variant: 'warning' },
  REVOKED: { label: 'Bekor qilingan', variant: 'destructive' },
  NOT_FOUND: { label: 'Topilmadi', variant: 'secondary' },
}

/** Sertifikat holati bekor qilinganlik va muddatdan kelib chiqadi. */
export function certificateStatus(certificate: {
  status: Certificate['status']
  expiresAt: string
}): VerificationStatus {
  if (certificate.status === 'REVOKED') {
    return 'REVOKED'
  }

  return new Date(certificate.expiresAt).getTime() < Date.now()
    ? 'EXPIRED'
    : 'VALID'
}

export function certificateState(certificate: Certificate): StatusPresentation {
  return VERIFICATION_PRESENTATION[certificateStatus(certificate)]
}
