import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    async redirects() {
        return [{ source: '/', destination: '/site', permanent: true }];
    },
    env: {
        NEXT_PUBLIC_STRAPI_HOST: process.env.STRAPI_HOST,
        NEXT_PUBLIC_STRAPI_TOKEN: process.env.STRAPI_TOKEN,
    },
};

export default nextConfig;
