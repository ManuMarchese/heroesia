"use server";
// Acciones sobre aportes y misión. Cada una valida la sesión: se pueden llamar con un POST directo (guía de Next).
import { refresh } from "next/cache";
import { requireUser } from "@/auth/sesion";
import { marcarFeedbackUtil, registrarAccion } from "@/casos/aportes";
import { definirMisionSemanal } from "@/casos/mision";
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

/** Lo probé, Lo leí, Me interesa o Dar feedback. */
export async function hacerAccion(_previa: Respuesta | null, entrada: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await registrarAccion(await repositorioDeLaSesion(), entrada));
}

export async function marcarUtil(_previa: Respuesta | null, accionId: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await marcarFeedbackUtil(await repositorioDeLaSesion(), accionId));
}

export async function definirMision(_previa: Respuesta | null, entrada: unknown): Promise<Respuesta> {
  return refrescarSiSalioBien(await definirMisionSemanal(await repositorioDeLaSesion(), entrada, new Date()));
}
