import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline.html",
  },
  // Force cache these key pages so they are available offline even if not visited yet
  additionalManifestEntries: [
    { url: "/dashboard", revision: "v1" },
    { url: "/wallets", revision: "v1" },
    { url: "/transactions", revision: "v1" },
    { url: "/budget", revision: "v1" },
    { url: "/settings", revision: "v1" }
  ],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
