// Link de invitación (D41): quien tiene sesión pero no perfil entra al grupo con la clave del link.
// La clave se valida en la base (public.unirme, 0004); acá solo se llama y se traducen los errores.

/** Lo que usamos de supabase.rpc. Un cliente falso lo cumple en los tests. */
export interface ClienteRpc {
  rpc(
    nombre: "unirme",
    argumentos: { p_clave: string },
  ): PromiseLike<{ data: boolean | null; error: { message?: string } | null }>;
}

export const MENSAJES_UNION = {
  claveVacia: "Pegá la clave de invitación que te pasaron.",
  claveIncorrecta: "Esa clave no es correcta. Pedile el link de invitación a Manu.",
  demasiados: "Probaste muchas veces. Esperá una hora y probá de nuevo.",
  fallo: "No pudimos sumarte al grupo. Probá de nuevo en un rato.",
} as const;

export type ResultadoUnion = { ok: true } | { ok: false; error: string };

export function normalizarClave(clave: unknown): string {
  return typeof clave === "string" ? clave.trim().slice(0, 200) : "";
}

export async function unirseAlGrupo(cliente: ClienteRpc, claveCruda: unknown): Promise<ResultadoUnion> {
  const clave = normalizarClave(claveCruda);
  if (clave === "") return { ok: false, error: MENSAJES_UNION.claveVacia };
  const { data, error } = await cliente.rpc("unirme", { p_clave: clave });
  if (error) {
    return { ok: false, error: /demasiados_intentos/.test(error.message ?? "") ? MENSAJES_UNION.demasiados : MENSAJES_UNION.fallo };
  }
  return data === true ? { ok: true } : { ok: false, error: MENSAJES_UNION.claveIncorrecta };
}
