// Elige la fuente de datos: demostración solo con HEROES_DEMO=1; si no, Supabase (nunca demo por defecto).
import { modoDemo } from "@/supabase/config";
import { crearClienteServidor } from "@/supabase/servidor";
import { crearRepositorioDemo, estadoDemo } from "./demo";
import type { Repositorio } from "./repositorio";
import { crearRepositorioSupabase } from "./supabase";

export type { Repositorio } from "./repositorio";
export { ErrorDatos } from "./errores";

/** usuarioId sale de la sesión (requireUser). Sin configuración de Supabase lanza ErrorConfiguracion. */
export async function obtenerRepositorio(usuarioId: string): Promise<Repositorio> {
  if (modoDemo()) return crearRepositorioDemo(estadoDemo(), usuarioId);
  return crearRepositorioSupabase(await crearClienteServidor(), usuarioId);
}
