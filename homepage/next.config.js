const path = require('path');

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  i18n: {
    locales: ['zh-Hant', 'en','ja'],
    defaultLocale: 'ja',
  },
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    unoptimized: true,
  },
};
