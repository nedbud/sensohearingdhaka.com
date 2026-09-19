/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundles the server and only the dependencies it actually reaches into
  // .next/standalone, so the runtime image carries that instead of the whole
  // node_modules tree. It is the difference between an image of a few hundred
  // megabytes and one of about a hundred, on every deploy and every rollback.
  output: "standalone",

  /**
   * Next announces itself in an `X-Powered-By: Next.js` header on every
   * response. It tells a visitor nothing and tells someone scanning for known
   * Next vulnerabilities exactly which stack to try — and an SEO audit flags
   * it, correctly, as a header that should not be there.
   */
  poweredByHeader: false,

  /**
   * Cache headers for everything the browser should not ask for twice.
   *
   * `/_next/static` is content-hashed — the filename changes when the file
   * changes — so it can be immutable for a year without ever going stale. The
   * images under /assets are not hashed, so they get a day and a
   * revalidation rather than a year: a replaced product photograph has to be
   * able to reach people who have already visited.
   */
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/font/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  experimental: {
    serverActions: true,
  },
  images: {
    // The CMS refuses some requests from the image optimiser (403 on
    // hotlinked fetches), and a failing optimiser request is a 400 that can
    // take a product grid down with it. Serving these straight through is
    // the safe default until the CMS is confirmed to allow the optimiser.
    unoptimized: true,
    // Was `domains: ["https://cloud.sensohearingdhaka.com", ...]` — full URLs
    // where Next expects bare hostnames, so next/image silently refused every
    // CMS image and every component fell back to a raw <img> with the eslint
    // rule disabled. That shipped full-size unoptimised images to people on
    // mobile data. remotePatterns is the supported form in Next 13.4+.
    remotePatterns: [
      // The CMS moved to cms. — cloud. stays listed until the old host is
      // switched off, so a page still holding an old image URL keeps working.
      { protocol: "https", hostname: "cms.sensohearingdhaka.com" },
      { protocol: "https", hostname: "cloud.sensohearingdhaka.com" },
      { protocol: "https", hostname: "test.sensohearingdhaka.com", pathname: "/**" },
      // The Laravel server running in Docker, for local development.
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      // YouTube still frames, so a video can sit in the photo grid.
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
