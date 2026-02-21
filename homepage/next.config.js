/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  swcMinify: true,
  i18n: {
    locales: ['zh-Hant', 'en','ja'],
    //TODO:　jaで変更必要
    defaultLocale: 'ja',
  },
  trailingSlash: true,
};
