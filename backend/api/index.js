/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Vercel serverless kirish nuqtasi.
 *
 * Nest ilovasini yig'ish — sovuq start ishi, har so'rovniki emas. Shuning
 * uchun promise modul darajasida keshlanadi: bir instansiya qayta
 * ishlatilganda ilova qaytadan ko'tarilmaydi.
 */
let bootstrapPromise;

async function bootstrap() {
  const { createNestApp } = require('../dist/app.factory');
  const app = await createNestApp();

  await app.init();

  return app.getHttpAdapter().getInstance();
}

/** Ilova ko'tarilmasa, qaysi o'zgaruvchi yetishmayotganini ko'rsatish uchun. */
const EXPECTED_ENV = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
  'PUBLIC_APP_URL',
  'API_PREFIX',
  'APP_NAME',
];

function envReport() {
  const vars = {};

  for (const name of EXPECTED_ENV) {
    const value = process.env[name];

    vars[name] =
      value === undefined ? 'missing' : value === '' ? 'empty' : 'set';
  }

  return { vercelEnv: process.env.VERCEL_ENV || null, vars };
}

module.exports = async function handler(req, res) {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap();
  }

  let expressApp;

  try {
    expressApp = await bootstrapPromise;
  } catch (error) {
    // Keyingi so'rov qayta urinib ko'rsin — aks holda instansiya
    // umrining oxirigacha buzuq holatda qolib ketadi.
    bootstrapPromise = undefined;
    console.error('Nest bootstrap failed:', error);

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        statusCode: 500,
        message: error.message,
        env: envReport(),
      }),
    );

    return;
  }

  return expressApp(req, res);
};
