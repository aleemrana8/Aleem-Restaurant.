/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
