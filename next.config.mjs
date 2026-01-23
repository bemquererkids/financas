/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@google/genai'],
    experimental: {
        serverComponentsExternalPackages: ['@google/adk'],
    },
};

export default nextConfig;
