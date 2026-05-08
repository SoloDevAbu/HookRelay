/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pg", "@neondatabase/serverless", "bcryptjs"],
};

export default nextConfig;
