/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      },
      {
        protocol: 'https',
        hostname: 'www.idg.edu.kh',
      },
      {
        protocol: 'https',
        hostname: 'satyalay08.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'z-p3-scontent.fpnh5-4.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fpnh5-2.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.usercontent.google.com',
      },
    ],
  },
};

module.exports = nextConfig;
