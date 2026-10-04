// Cliente de Supabase para Server Components, Server Actions y Route Handlers (Q4).
// Se crea uno por pedido; la sesión viaja en cookies.
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { exigirConfigSupabase } from "./config";

export async function crearClienteServidor(): Promise<SupabaseClient> {
  const { url, clavePublicable } = exigirConfigSupabase();
  const almacen = await cookies();
  return createServerClient(url, clavePublicable, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(aGuardar) {
        try {
          for (const { name, value, options } of aGuardar) almacen.set(name, value, options);
        } catch {
          // En un Server Component no se pueden escribir cookies; el proxy renueva la sesión.
        }
      },
    },
  });
}
