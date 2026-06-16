/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Bungie serveert alle item-iconen en plaatjes vanaf dit domein.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bungie.net",
      },
    ],
  },
};

module.exports = nextConfig;
