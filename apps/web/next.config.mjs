/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pg", "@neondatabase/serverless", "bcryptjs"],
  transpilePackages: ["@hookrelay/db"],
};

export default nextConfig;
