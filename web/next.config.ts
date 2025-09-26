// next.config.ts
import type { NextConfig } from "next"
import type { RemotePattern } from "next/dist/shared/lib/image-config"

const strapiHost = process.env.STRAPI_HOST
if (!strapiHost) {
    throw new Error("❌ STRAPI_HOST no está definido en el .env")
}

const url = new URL(strapiHost)

const protocol = url.protocol.replace(":", "") as "http" | "https"

const remotePatterns: RemotePattern[] = [
    {
        protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/uploads/**",
    },
    {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
    }
]

const nextConfig: NextConfig = {
    output: "standalone",
    async redirects() {
        return [{ source: "/", destination: "/site", permanent: true }]
    },
    env: {
        NEXT_PUBLIC_STRAPI_HOST: process.env.STRAPI_HOST,
        NEXT_PUBLIC_STRAPI_TOKEN: process.env.STRAPI_TOKEN,
    },
    images: {
        remotePatterns,
    },
}

export default nextConfig
