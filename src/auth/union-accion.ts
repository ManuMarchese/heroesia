"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/supabase/servidor";
import { requireUser } from "./sesion";
import { unirseAlGrupo } from "./union";

/** Formulario de /unirme: prueba la clave y, si es correcta, deja al usuario adentro. */
export async function unirme(datos: FormData): Promise<void> {
  await requireUser();
  const resultado = await unirseAlGrupo(await crearClienteServidor(), datos.get("clave"));
  if (resultado.ok) redirect("/");
  redirect(`/unirme?error=${encodeURIComponent(resultado.error)}`);
}
