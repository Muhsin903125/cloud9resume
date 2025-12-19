console.log('Loading next.config.js with images configuration...');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
  },
};

module.exports = nextConfig;
