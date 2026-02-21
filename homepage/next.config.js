/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  swcMinify: true,
  i18n: {
    locales: ['zh-Hant', 'en','ja'],
    defaultLocale: 'ja',
  },
  trailingSlash: true,
};
