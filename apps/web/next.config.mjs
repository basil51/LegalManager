import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker
  env: {
    PORT: '3005',
  },
};

export default withNextIntl(nextConfig);
