/**
 * Vercel serverless muhitida ishlayapmizmi?
 *
 * Bu yerda ikkita cheklov muhim:
 *  1. Fayl tizimi faqat o'qish uchun (`/tmp` dan tashqari) va har chaqiruvda
 *     yangidan boshlanadi — yuklangan fayllar saqlanmaydi.
 *  2. Har bir instansiya alohida jarayon — ulanishlar hovuzi kichik bo'lishi
 *     kerak, aks holda Postgres ulanishlari tez tugaydi.
 */
export const IS_SERVERLESS = Boolean(process.env.VERCEL);

/**
 * Serverless'da har bir instansiya bitta so'rovni bajaradi, shuning uchun
 * bitta ulanish yetarli. Uzoq ishlaydigan serverda esa hovuz kattaroq.
 */
export const DB_POOL_SIZE = IS_SERVERLESS ? 1 : 10;
