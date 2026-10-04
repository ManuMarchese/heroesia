"use server";
// Acciones de Perfil. Cada una valida la sesión: se pueden llamar con un POST directo (guía de Next).
import { refresh } from "next/cache";
import { requireUser } from "@/auth/sesion";
import type { Respuesta } from "@/casos/resultado";
import { guardarNombre } from "@/casos/perfil";
import { obtenerRepositorio } from "@/data";

export async function cambiarNombre(_previa: Respuesta | null, nombre: unknown): Promise<Respuesta> {
  const usuario = await requireUser();
  const respuesta = await guardarNombre(await obtenerRepositorio(usuario.id), nombre);
  if (respuesta.ok) refresh();
  return respuesta;
}
