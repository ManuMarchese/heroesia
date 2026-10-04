"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { configSupabase, modoDemo } from "@/supabase/config";
import { crearClienteServidor } from "@/supabase/servidor";
import { procesarEntrada } from "./entrada";
import type { EstadoEntrar } from "./estado";
import { RUTA_ENTRAR } from "./rutas";
import { origenDelPedido } from "./validacion";

/** Formulario de /entrar: pedir el código, verificarlo o cambiar de email. */
export async function entrar(previo: EstadoEntrar, datos: FormData): Promise<EstadoEntrar> {
  if (modoDemo()) redirect("/");
  const cliente = configSupabase() ? (await crearClienteServidor()).auth : null;
  const resultado = await procesarEntrada(previo, datos, { cliente, origen: origenDelPedido(await headers()) });
  if ("redirigir" in resultado) redirect(resultado.redirigir);
  return resultado.estado;
}

export async function salir(): Promise<void> {
  if (!modoDemo() && configSupabase()) await (await crearClienteServidor()).auth.signOut({ scope: "local" });
  redirect(RUTA_ENTRAR);
}
