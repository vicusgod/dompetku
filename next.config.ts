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
    { url: "/", revision: "v2" },
    { url: "/index", revision: "v2" },
    { url: "/login", revision: "v2" },
    { url: "/dashboard", revision: "v2" },
    { url: "/wallets", revision: "v2" },
    { url: "/transactions", revision: "v2" },
    { url: "/budget", revision: "v2" },
    { url: "/settings", revision: "v2" }
  ],
  runtimeCaching: [
    {
      urlPattern: "/",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "start-url",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
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
