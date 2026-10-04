// Variables de entorno de la app. Nunca se usa la clave secreta de Supabase.

type Entorno = Readonly<Record<string, string | undefined>>;

/**
 * Modo demostración: datos de ejemplo en memoria, sin Supabase. Solo con HEROES_DEMO=1, nunca por defecto,
 * y nunca en la producción de Vercel (VERCEL_ENV=production): ahí, una HEROES_DEMO cargada por error
 * salteaba el login (D35). Es el único lugar del código que lee HEROES_DEMO.
 */
export function modoDemo(entorno: Entorno = process.env): boolean {
  if (entorno.VERCEL_ENV === "production") return false;
  return entorno.HEROES_DEMO === "1";
}

export interface ConfigSupabase {
  url: string;
  clavePublicable: string;
}

/** URL y clave publicable del proyecto, o null si faltan. */
export function configSupabase(entorno: Entorno = process.env): ConfigSupabase | null {
  const url = entorno.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const clavePublicable = entorno.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && clavePublicable ? { url, clavePublicable } : null;
}

export class ErrorConfiguracion extends Error {
  constructor() {
    super(
      "Falta configurar Supabase: cargá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "(o HEROES_DEMO=1 para probar con datos de ejemplo).",
    );
    this.name = "ErrorConfiguracion";
  }
}

export function exigirConfigSupabase(entorno: Entorno = process.env): ConfigSupabase {
  const config = configSupabase(entorno);
  if (!config) throw new ErrorConfiguracion();
  return config;
}
