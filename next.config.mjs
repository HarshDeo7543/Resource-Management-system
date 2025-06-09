/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // Stub out Node's fs module so it won't be bundled into client/Edge code
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
