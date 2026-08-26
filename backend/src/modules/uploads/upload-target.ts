/**
 * Yuklash papkalari. Har biri alohida katalogga tushadi, shuning uchun
 * yangi tur qo'shish uchun faqat shu ro'yxatni to'ldirish kifoya.
 */
export const UPLOAD_TARGETS = ['avatars'] as const;

export type UploadTarget = (typeof UPLOAD_TARGETS)[number];

/** Rasmlar faqat shu MIME turlarida qabul qilinadi. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
