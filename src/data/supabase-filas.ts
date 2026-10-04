// Filas de Supabase y su paso al formato del dominio.
import type { Accion, Aporte, EventoXp } from "@/domain/tipos";
import { ErrorDatos, traducirErrorPostgres } from "./errores";

export interface FilaAporte {
  id: string;
  autor_id: string;
  tipo: Aporte["tipo"];
  link: string;
  titulo: string;
  imagen_url: string | null;
  por_que_sirve: string;
  como_se_usa: string | null;
  fuente: string | null;
  fecha_limite: string | null;
  que_mirar: string | null;
  created_at: string;
}

export interface FilaAccion {
  id: string;
  aporte_id: string;
  perfil_id: string;
  tipo: Accion["tipo"];
  resultado: string | null;
  texto: string | null;
  created_at: string;
}

export interface FilaEvento {
  id: string;
  perfil_id: string;
  motivo: EventoXp["motivo"];
  tipo_aporte: EventoXp["tipoAporte"];
  aporte_id: string | null;
  created_at: string;
}

export const aporteDesdeFila = (f: FilaAporte): Aporte => ({
  id: f.id,
  autorId: f.autor_id,
  tipo: f.tipo,
  link: f.link,
  titulo: f.titulo,
  imagenUrl: f.imagen_url,
  porQueSirve: f.por_que_sirve,
  comoSeUsa: f.como_se_usa,
  fuente: f.fuente,
  fechaLimite: f.fecha_limite,
  queMirar: f.que_mirar,
  creadoEn: f.created_at,
});

export const accionDesdeFila = (f: FilaAccion, util: boolean): Accion => ({
  id: f.id,
  aporteId: f.aporte_id,
  perfilId: f.perfil_id,
  tipo: f.tipo,
  resultado: f.resultado,
  texto: f.texto,
  util,
  creadoEn: f.created_at,
});

export const eventoDesdeFila = (f: FilaEvento): EventoXp => ({
  id: f.id,
  perfilId: f.perfil_id,
  motivo: f.motivo,
  tipoAporte: f.tipo_aporte,
  aporteId: f.aporte_id,
  creadoEn: f.created_at,
});

type ErrorPostgres = { code?: string; message?: string };
type Respuesta<T> = { data: T | null; error: ErrorPostgres | null };

export function datos<T>({ data, error }: Respuesta<T>): T {
  if (error) throw traducirErrorPostgres(error);
  if (data === null) throw new ErrorDatos("no_encontrado");
  return data;
}

export function sinError({ error }: { error: ErrorPostgres | null }): void {
  if (error) throw traducirErrorPostgres(error);
}

/** Filas por pedido al leer tablas que crecen sin tope (los eventos de XP). */
export const TAMANO_PAGINA = 1000;

/**
 * Lee todas las filas de a páginas, por si la API devuelve menos filas por pedido que las pedidas
 * (el tope del proyecto de Manu: NO VERIFICADO). `pagina(desde, hasta)` pide un rango inclusivo y el
 * total (count exact); se sigue pidiendo hasta tener ese total o recibir una página vacía.
 */
export async function todasLasFilas<T>(
  pagina: (desde: number, hasta: number) => PromiseLike<Respuesta<T[]> & { count: number | null }>,
): Promise<T[]> {
  const filas: T[] = [];
  for (;;) {
    const respuesta = await pagina(filas.length, filas.length + TAMANO_PAGINA - 1);
    const lote = datos(respuesta);
    filas.push(...lote);
    if (lote.length === 0 || filas.length >= (respuesta.count ?? 0)) return filas;
  }
}
