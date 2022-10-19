const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const config = {
  assetPrefix: isProd ? "." : undefined,
};

module.exports = config;
