import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline.html",
  },
  // Removed additionalManifestEntries - doesn't work with App Router
  // Relying on runtime caching for offline access
  runtimeCaching: [
    {
      // App Shell routes - StaleWhileRevalidate for fast load + background update
      urlPattern: ({ url }: { url: any }) => url.pathname === "/" || url.pathname === "/dashboard" || url.pathname === "/login",
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
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-font-assets",
        expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-image-assets",
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-image",
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-js-assets",
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-style-assets",
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/api\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "apis",
        expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Cache ALL Next.js internals (JS bundles, CSS, RSC data) - Critical for offline
      urlPattern: /^\/_next\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      // Navigation requests: NetworkFirst with short timeout for offline resilience
      // - Online: fetches fresh page from network
      // - Offline: serves cached page, falls back to offline.html
      urlPattern: ({ request }: { request: any }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3, // Quick timeout for fast offline fallback
        expiration: { maxEntries: 32, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
