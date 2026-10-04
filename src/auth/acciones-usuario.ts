"use server";

import { redirect } from "next/navigation";
import { configSupabase, modoDemo } from "@/supabase/config";
import { crearClienteServidor } from "@/supabase/servidor";
import { RUTA_ENTRAR } from "./rutas";
import { crearCuenta, ingresarConClave, type ResultadoUsuario } from "./usuario";
import { destinoSeguro } from "./validacion";

function volver(resultado: ResultadoUsuario, destino: string, invitacion: string): never {
  if (resultado.ok) redirect(destino);
  const parametros = new URLSearchParams({ error: resultado.error });
  if (invitacion) parametros.set("invitacion", invitacion);
  redirect(`${RUTA_ENTRAR}?${parametros.toString()}`);
}

const texto = (datos: FormData, campo: string) => {
  const valor = datos.get(campo);
  return typeof valor === "string" ? valor : "";
};

/** Formulario "Crear mi cuenta" del link de invitación: usuario + clave, sin mails. */
export async function crearMiCuenta(datos: FormData): Promise<void> {
  if (modoDemo() || !configSupabase()) redirect("/");
  const invitacion = texto(datos, "invitacion");
  const resultado = await crearCuenta(await crearClienteServidor(), {
    usuario: datos.get("usuario"),
    clave: datos.get("clave"),
    invitacion,
  });
  volver(resultado, "/", invitacion);
}

/** Formulario "Ya tengo cuenta": usuario + clave. */
export async function entrarConClave(datos: FormData): Promise<void> {
  if (modoDemo() || !configSupabase()) redirect("/");
  const resultado = await ingresarConClave(await crearClienteServidor(), datos.get("usuario"), datos.get("clave"));
  volver(resultado, destinoSeguro(texto(datos, "next")), "");
}
