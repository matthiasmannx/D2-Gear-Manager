const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
  // Zorg dat de gebundelde manifest-snapshot (data/) in de serverless-bundle
  // op Vercel terechtkomt — dynamische fs-paden worden niet auto-getraceerd.
  outputFileTracingIncludes: {
    "/**": ["./data/**"],
  },
};

module.exports = withNextIntl(nextConfig);
