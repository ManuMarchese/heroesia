"use server";
// Editar y borrar aportes propios, y favoritos con carpetas (D43). Cada acción valida la sesión.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/sesion";
import {
  borrarMiCarpeta,
  crearCarpetaNueva,
  guardarEnCarpeta,
  guardarEnCarpetaNueva,
  quitarDeFavoritos,
  renombrarMiCarpeta,
} from "@/casos/favoritos";
import { borrarMiAporte, editarMiAporte, type ResultadoEditar } from "@/casos/mis-aportes";
import type { Respuesta } from "@/casos/resultado";
import { obtenerRepositorio } from "@/data";

async function repositorioDeLaSesion() {
  const usuario = await requireUser();
  return obtenerRepositorio(usuario.id);
}

function refrescarSiSalioBien(respuesta: Respuesta): Respuesta {
  if (respuesta.ok) refresh();
  return respuesta;
}

export async function editar(_previo: ResultadoEditar | null, entrada: unknown): Promise<ResultadoEditar> {
  const resultado = await editarMiAporte(await repositorioDeLaSesion(), entrada, new Date());
  if (resultado.ok) redirect("/");
  return resultado;
}

export async function borrar(_previa: Respuesta | null, aporteId: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await borrarMiAporte(await repositorioDeLaSesion(), aporteId));
}

export async function guardarFavorito(_previa: Respuesta | null, entrada: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await guardarEnCarpeta(await repositorioDeLaSesion(), entrada));
}

export async function guardarFavoritoEnNueva(_previa: Respuesta | null, entrada: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await guardarEnCarpetaNueva(await repositorioDeLaSesion(), entrada));
}

export async function quitarFavorito(_previa: Respuesta | null, aporteId: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await quitarDeFavoritos(await repositorioDeLaSesion(), aporteId));
}

export async function crearCarpeta(_previa: Respuesta | null, nombre: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await crearCarpetaNueva(await repositorioDeLaSesion(), nombre));
}

export async function renombrarCarpeta(_previa: Respuesta | null, entrada: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await renombrarMiCarpeta(await repositorioDeLaSesion(), entrada));
}

export async function borrarCarpeta(_previa: Respuesta | null, carpetaId: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await borrarMiCarpeta(await repositorioDeLaSesion(), carpetaId));
}
