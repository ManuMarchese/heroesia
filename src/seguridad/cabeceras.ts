// Cabeceras de seguridad básicas para todas las rutas (sin CSP todavía, D38).
export const CABECERAS_SEGURIDAD = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
] as const;
