console.log('Loading next.config.js with images configuration...');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
      {
        pathname: '/**',
        search: '*',
      },
    ],
  },
};

module.exports = nextConfig;
