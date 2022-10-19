const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const config = {
  assetPrefix: isProd ? process.env.ASSET_PREFIX : undefined,
};

module.exports = config;
