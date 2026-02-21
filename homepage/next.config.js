/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  i18n: {
    locales: ['zh-Hant', 'en','ja'],
    defaultLocale: 'ja',
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
