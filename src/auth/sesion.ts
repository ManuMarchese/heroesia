// Sesión del lado del servidor (Q4): se valida con getClaims(), nunca con getSession().
// En modo demostración entra el usuario de ejemplo sin Supabase.
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { USUARIO_DEMO } from "@/data/demo-datos";
import { configSupabase, modoDemo } from "@/supabase/config";
import { crearClienteServidor } from "@/supabase/servidor";
import { RUTA_ENTRAR } from "./rutas";

export interface Usuario {
  id: string;
  email: string | null;
}

/** El usuario con sesión válida, o null. Se calcula una vez por pedido. */
export const obtenerUsuario = cache(async (): Promise<Usuario | null> => {
  // Siempre en el momento del pedido: una página privada nunca se prerenderiza en el build.
  await connection();
  if (modoDemo()) return { id: USUARIO_DEMO.id, email: USUARIO_DEMO.email };
  if (!configSupabase()) return null;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;
  const { sub, email } = data.claims;
  if (typeof sub !== "string" || sub === "") return null;
  return { id: sub, email: typeof email === "string" ? email : null };
});

/** Para páginas y Server Actions: sin sesión, manda a /entrar. */
export async function requireUser(): Promise<Usuario> {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect(RUTA_ENTRAR);
  return usuario;
}
