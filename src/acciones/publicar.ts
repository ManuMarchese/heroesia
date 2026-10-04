"use server";
// Acciones de Publicar. Cada una valida la sesión: se pueden llamar con un POST directo (guía de Next).
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/sesion";
import { publicarAporte, type ResultadoPublicar } from "@/casos/publicar";
import { obtenerRepositorio } from "@/data";
import { leerLink, type Lectura } from "@/lectura/leer-link";

/** Lee título e imagen del link en el servidor, con la lectura segura (solo para miembros). */
export async function leerLinkParaPublicar(link: unknown): Promise<Lectura> {
  await requireUser();
  if (typeof link !== "string" || link.trim() === "") return { ok: false, motivo: "Pegá un link para leerlo.", fuente: null };
  return leerLink(link, { tokenGithub: process.env.GITHUB_TOKEN?.trim() || null });
}

export async function publicar(_previo: ResultadoPublicar | null, entrada: unknown): Promise<ResultadoPublicar> {
  const usuario = await requireUser();
  const resultado = await publicarAporte(await obtenerRepositorio(usuario.id), entrada, new Date());
  if (resultado.ok) redirect("/");
  return resultado;
}
