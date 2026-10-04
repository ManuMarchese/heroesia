import type { NextConfig } from "next";
import { CABECERAS_SEGURIDAD } from "./src/seguridad/cabeceras";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: [...CABECERAS_SEGURIDAD] }];
  },
};

export default nextConfig;
