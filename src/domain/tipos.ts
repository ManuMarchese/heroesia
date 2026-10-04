// Tipos del dominio. Sin dependencias de Supabase ni de Next.

export const TIPOS_APORTE = ["skill", "repo", "noticia", "oportunidad", "proyecto"] as const;
export type TipoAporte = (typeof TIPOS_APORTE)[number];

export const TIPOS_ACCION = ["probar", "leer", "interes", "feedback"] as const;
export type TipoAccion = (typeof TIPOS_ACCION)[number];

// Motivos que registran un evento de XP. "Me interesa" no está: no da XP.
export const MOTIVOS_XP = ["entrar", "publicar", "leer", "probar", "feedback_util"] as const;
export type MotivoXp = (typeof MOTIVOS_XP)[number];

export const CLASES = ["builder", "scout", "curador", "mentor"] as const;
export type Clase = (typeof CLASES)[number];

export const ACCIONES_MISION = ["probar", "leer", "feedback", "publicar"] as const;
export type AccionMision = (typeof ACCIONES_MISION)[number];

export type Resultado<T> = { ok: true; valor: T } | { ok: false; errores: Record<string, string> };

/** Fechas en ISO 8601 (como las devuelve la base). */
export type FechaIso = string;
/** Día local en la zona del grupo, AAAA-MM-DD. La clave de una semana es su lunes. */
export type Dia = string;

export interface Miembro {
  id: string;
  nombre: string;
  creadoEn: FechaIso;
}

export interface Aporte {
  id: string;
  autorId: string;
  tipo: TipoAporte;
  link: string;
  titulo: string;
  imagenUrl: string | null;
  porQueSirve: string;
  comoSeUsa: string | null;
  fuente: string | null;
  fechaLimite: Dia | null;
  queMirar: string | null;
  creadoEn: FechaIso;
}

export interface Accion {
  id: string;
  aporteId: string;
  perfilId: string;
  tipo: TipoAccion;
  resultado: string | null;
  texto: string | null;
  util: boolean;
  creadoEn: FechaIso;
}

export interface EventoXp {
  id: string;
  perfilId: string;
  motivo: MotivoXp;
  tipoAporte: TipoAporte | null;
  creadoEn: FechaIso;
}

export interface MisionDefinida {
  semana: Dia;
  accion: AccionMision;
  meta: number;
  definidaPor: string;
  creadaEn: FechaIso;
}
