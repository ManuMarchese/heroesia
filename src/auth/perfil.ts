// ¿La persona con sesión ya es héroe (tiene perfil)? Sin perfil la base no le deja leer nada (0003),
// así que "no veo ninguna fila de perfiles" significa "todavía no me uní".
import type { SupabaseClient } from "@supabase/supabase-js";

export async function tienePerfil(cliente: SupabaseClient, usuarioId: string): Promise<boolean> {
  const { data, error } = await cliente.from("perfiles").select("id").eq("id", usuarioId).limit(1);
  if (error) throw new Error("No se pudo comprobar el perfil");
  return (data?.length ?? 0) > 0;
}
