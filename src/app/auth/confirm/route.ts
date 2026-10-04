// Destino del link del mail: valida el token y deja la sesión en cookies.
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { confirmarDesdeLink } from "@/auth/flujo";
import { RUTA_ENTRAR } from "@/auth/rutas";
import { configSupabase, modoDemo } from "@/supabase/config";
import { crearClienteServidor } from "@/supabase/servidor";

export async function GET(pedido: NextRequest) {
  if (modoDemo()) redirect("/");
  if (!configSupabase()) redirect(RUTA_ENTRAR);
  const supabase = await crearClienteServidor();
  redirect(await confirmarDesdeLink(supabase.auth, pedido.nextUrl.searchParams));
}
