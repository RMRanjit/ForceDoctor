/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // TO enable react-beautiful-dnd
  // Add the domains you want to allow connections from
  // For example, to allow connections from localhost and example.com, you can use:
  // domains: ["localhost", "example.com"],
  // domains: ["res.cloudinary.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
