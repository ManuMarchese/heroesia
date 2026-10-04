// Resumen semanal para copiar y pegar en el grupo (U7, D14): no envía nada solo.
import { ACCION_DEL_TIPO, ETIQUETA_TIPO, pruebaSocial } from "./aportes";
import { ordenDeIngreso } from "./mision";
import { aFecha, diaCorto, semanaDe, sumarDias } from "./tiempo";
import type { Accion, Aporte, Dia, Miembro, TipoAporte } from "./tipos";
import { calcularNivel, type EventoConXp } from "./xp";
import { ZONA_HORARIA } from "./xp-config";

export interface Destacado {
  titulo: string;
  tipo: TipoAporte;
  autor: string;
  reacciones: number;
}

/** Lo mejor de la semana: aportes publicados esa semana con más acciones recibidas; si empatan, el más nuevo. */
export function mejoresDeLaSemana(
  aportes: readonly Aporte[],
  acciones: readonly Pick<Accion, "aporteId">[],
  miembros: readonly Miembro[],
  semana: Dia,
  cantidad = 3,
  zona: string = ZONA_HORARIA,
): Destacado[] {
  const nombres = new Map(miembros.map((m) => [m.id, m.nombre]));
  const reacciones = new Map<string, number>();
  for (const a of acciones) reacciones.set(a.aporteId, (reacciones.get(a.aporteId) ?? 0) + 1);
  return aportes
    .filter((a) => semanaDe(a.creadoEn, zona) === semana)
    .map((aporte) => ({ aporte, total: reacciones.get(aporte.id) ?? 0 }))
    .sort(
      (x, y) =>
        y.total - x.total || aFecha(y.aporte.creadoEn).getTime() - aFecha(x.aporte.creadoEn).getTime(),
    )
    .slice(0, cantidad)
    .map(({ aporte, total }) => ({
      titulo: aporte.titulo,
      tipo: aporte.tipo,
      autor: nombres.get(aporte.autorId) ?? "Alguien",
      reacciones: total,
    }));
}

export interface Subida {
  nombre: string;
  nivelAntes: number;
  nivel: number;
}

/** Quién subió de nivel durante la semana: nivel al empezar el lunes contra nivel ahora. */
export function subidasDeNivel(
  miembros: readonly Miembro[],
  eventos: readonly EventoConXp[],
  semana: Dia,
  ahora: Date,
  zona: string = ZONA_HORARIA,
): Subida[] {
  return ordenDeIngreso(miembros).flatMap((m) => {
    let antes = 0;
    let despues = 0;
    for (const e of eventos) {
      if (e.perfilId !== m.id || aFecha(e.creadoEn).getTime() > ahora.getTime()) continue;
      const semanaEvento = semanaDe(e.creadoEn, zona);
      if (semanaEvento < semana) antes += e.xp;
      if (semanaEvento <= semana) despues += e.xp;
    }
    const nivelAntes = calcularNivel(antes).nivel;
    const nivel = calcularNivel(despues).nivel;
    return nivel > nivelAntes ? [{ nombre: m.nombre, nivelAntes, nivel }] : [];
  });
}

export interface DatosResumen {
  semana: Dia;
  destacados: readonly Destacado[];
  mision: { titulo: string; hecho: number; meta: number; completa: boolean } | null;
  subidas: readonly Subida[];
  url?: string | null;
}

function enumerar(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/** Texto plano (con negritas de WhatsApp) para pegar en el grupo. Sin emojis. */
export function textoResumenSemanal(datos: DatosResumen): string {
  const { semana, destacados, mision, subidas, url } = datos;
  const lineas = [`*Heroes IA · Semana del ${diaCorto(semana)} al ${diaCorto(sumarDias(semana, 6))}*`, ""];

  lineas.push("*Lo mejor de la semana*");
  if (destacados.length === 0) lineas.push("Esta semana no hubo aportes nuevos. ¡Sumá el primero!");
  destacados.forEach((d, i) => {
    const social = d.reacciones > 0 ? ` · ${pruebaSocial(ACCION_DEL_TIPO[d.tipo], d.reacciones)}` : "";
    lineas.push(`${i + 1}. ${d.titulo} (${ETIQUETA_TIPO[d.tipo]}, de ${d.autor})${social}`);
  });

  if (mision) {
    const hecho = Math.min(mision.hecho, mision.meta);
    const faltan = mision.meta - hecho;
    lineas.push("", `*Misión del equipo:* ${mision.titulo} · ${hecho}/${mision.meta}`);
    lineas.push(mision.completa ? "¡Misión cumplida!" : `${faltan === 1 ? "Falta 1" : `Faltan ${faltan}`} para cumplirla.`);
  }

  if (subidas.length > 0) {
    lineas.push("", `*Subieron de nivel:* ${enumerar(subidas.map((s) => `${s.nombre} (nivel ${s.nivel})`))}.`);
  }

  if (url) lineas.push("", `Entrá y sumá: ${url}`);
  return lineas.join("\n");
}
