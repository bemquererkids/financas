/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@google/genai'],
    experimental: {
        serverComponentsExternalPackages: ['@google/adk'],
    },
    swcMinify: true,
};

export default nextConfig;
