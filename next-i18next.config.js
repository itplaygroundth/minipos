const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'th'],
    fallbackLng: 'en',
  },
  localePath: path.resolve('./app/i18n/locales'),
}; 