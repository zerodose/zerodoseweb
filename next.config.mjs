/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.100.12",
    "192.168.1.14",
    "10.137.120.208",
    "10.73.147.208",
    "10.244.166.208",
    "localhost",
    "zerodoseweb.vercel.app",
  ],

  reactCompiler: true,
};

export default nextConfig;
