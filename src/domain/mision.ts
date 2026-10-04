// Misión semanal del equipo (U6, D23, D24): capitán rotativo, reemplazo y progreso automático.
import { aFecha, semanaDe, semanasEntre } from "./tiempo";
import {
  ACCIONES_MISION,
  type Accion,
  type AccionMision,
  type Aporte,
  type Dia,
  type FechaIso,
  type Miembro,
  type MisionDefinida,
  type Resultado,
} from "./tipos";
import { META_MISION, MISIONES_REEMPLAZO, MISION_LANZAMIENTO, ZONA_HORARIA } from "./xp-config";

export const ETIQUETA_ACCION_MISION: Record<AccionMision, string> = {
  probar: "Probar skills o repos",
  leer: "Leer noticias",
  feedback: "Dar feedback a proyectos",
  publicar: "Sumar aportes",
};

export type OrigenMision = "lanzamiento" | "capitan" | "reemplazo";

export interface Mision {
  semana: Dia;
  accion: AccionMision;
  meta: number;
  titulo: string;
  origen: OrigenMision;
  capitanId: string | null;
  /** Solo en la misión de lanzamiento: cuánto suma como máximo cada persona. */
  topePorMiembro: number | null;
}

/** Orden de ingreso: fecha de creación del perfil y, si empatan, el id. */
export function ordenDeIngreso(miembros: readonly Miembro[]): Miembro[] {
  return [...miembros].sort(
    (a, b) => aFecha(a.creadoEn).getTime() - aFecha(b.creadoEn).getTime() || a.id.localeCompare(b.id),
  );
}

/** La semana en que se creó el primer perfil. Sin miembros no hay lanzamiento. */
export function semanaDeLanzamiento(miembros: readonly Miembro[], zona: string = ZONA_HORARIA): Dia | null {
  const primero = ordenDeIngreso(miembros)[0];
  return primero ? semanaDe(primero.creadoEn, zona) : null;
}

/**
 * Capitán de una semana: rota por orden de ingreso desde la semana siguiente al lanzamiento.
 * Solo cuentan quienes entraron antes de esa semana, así nadie cambia el capitán a mitad de semana.
 */
export function capitanDeSemana(semana: Dia, miembros: readonly Miembro[], zona: string = ZONA_HORARIA): string | null {
  const lanzamiento = semanaDeLanzamiento(miembros, zona);
  if (lanzamiento === null) return null;
  const numero = semanasEntre(lanzamiento, semana);
  if (numero < 1) return null;
  const elegibles = ordenDeIngreso(miembros).filter((m) => semanaDe(m.creadoEn, zona) < semana);
  if (elegibles.length === 0) return null;
  return elegibles[(numero - 1) % elegibles.length]?.id ?? null;
}

export function tituloMision(accion: AccionMision, meta: number): string {
  const uno = meta === 1;
  switch (accion) {
    case "probar":
      return uno ? "Probar 1 skill o repo" : `Probar ${meta} skills o repos`;
    case "leer":
      return uno ? "Leer 1 noticia" : `Leer ${meta} noticias`;
    case "feedback":
      return uno ? "Dar 1 feedback a un proyecto" : `Dar ${meta} feedbacks a proyectos`;
    case "publicar":
      return uno ? "Sumar 1 aporte" : `Sumar ${meta} aportes`;
  }
}

/** La misión que rige en una semana. Antes del lanzamiento (o sin miembros) no hay misión. */
export function misionDeSemana(
  semana: Dia,
  miembros: readonly Miembro[],
  definida: MisionDefinida | null,
  zona: string = ZONA_HORARIA,
): Mision | null {
  const lanzamiento = semanaDeLanzamiento(miembros, zona);
  if (lanzamiento === null || semana < lanzamiento) return null;

  if (semana === lanzamiento) {
    const cantidad = miembros.filter((m) => semanaDe(m.creadoEn, zona) <= semana).length;
    return {
      semana,
      accion: MISION_LANZAMIENTO.accion,
      meta: MISION_LANZAMIENTO.porMiembro * cantidad,
      titulo: MISION_LANZAMIENTO.titulo,
      origen: "lanzamiento",
      capitanId: null,
      topePorMiembro: MISION_LANZAMIENTO.porMiembro,
    };
  }

  const capitanId = capitanDeSemana(semana, miembros, zona);
  if (definida && definida.semana === semana) {
    const { accion, meta } = definida;
    return { semana, accion, meta, titulo: tituloMision(accion, meta), origen: "capitan", capitanId, topePorMiembro: null };
  }

  const numero = semanasEntre(lanzamiento, semana);
  const reemplazo = MISIONES_REEMPLAZO[(numero - 1) % MISIONES_REEMPLAZO.length] ?? { accion: "publicar", meta: 1 };
  return {
    semana,
    accion: reemplazo.accion,
    meta: reemplazo.meta,
    titulo: tituloMision(reemplazo.accion, reemplazo.meta),
    origen: "reemplazo",
    capitanId,
    topePorMiembro: null,
  };
}

/** Algo hecho por alguien que puede contar para una misión. */
export interface Hecho {
  perfilId: string;
  accion: AccionMision;
  creadoEn: FechaIso;
}

/** Publicar cuenta por aporte; probar, leer y dar feedback, por acción. "Me interesa" no cuenta. */
export function hechosDe(
  aportes: readonly Pick<Aporte, "autorId" | "creadoEn">[],
  acciones: readonly Pick<Accion, "perfilId" | "tipo" | "creadoEn">[],
): Hecho[] {
  const hechos: Hecho[] = aportes.map((a) => ({ perfilId: a.autorId, accion: "publicar", creadoEn: a.creadoEn }));
  for (const a of acciones) {
    if (a.tipo !== "interes") hechos.push({ perfilId: a.perfilId, accion: a.tipo, creadoEn: a.creadoEn });
  }
  return hechos;
}

export interface Progreso {
  hecho: number;
  meta: number;
  completa: boolean;
  /** Quiénes sumaron, en el orden en que aportaron por primera vez. */
  participantes: string[];
}

/** Cuenta lo hecho desde el lunes 00:00 de la semana de la misión, aunque el capitán la defina después. */
export function progresoMision(mision: Mision, hechos: readonly Hecho[], zona: string = ZONA_HORARIA): Progreso {
  const deLaSemana = hechos
    .filter((h) => h.accion === mision.accion && semanaDe(h.creadoEn, zona) === mision.semana)
    .sort((a, b) => aFecha(a.creadoEn).getTime() - aFecha(b.creadoEn).getTime());
  const porPersona = new Map<string, number>();
  let hecho = 0;
  for (const h of deLaSemana) {
    const previos = porPersona.get(h.perfilId) ?? 0;
    porPersona.set(h.perfilId, previos + 1);
    if (mision.topePorMiembro === null || previos < mision.topePorMiembro) hecho++;
  }
  return { hecho, meta: mision.meta, completa: mision.meta > 0 && hecho >= mision.meta, participantes: [...porPersona.keys()] };
}

const fallo = (campo: string, mensaje: string): Resultado<never> => ({ ok: false, errores: { [campo]: mensaje } });

/** El capitán define la misión de su semana una sola vez (la base también lo exige). */
export function validarDefinicionMision(
  entrada: { accion: string; meta: unknown },
  contexto: { semana: Dia; usuarioId: string; miembros: readonly Miembro[]; definida: MisionDefinida | null },
  zona: string = ZONA_HORARIA,
): Resultado<{ accion: AccionMision; meta: number }> {
  const { semana, usuarioId, miembros, definida } = contexto;
  if (semana === semanaDeLanzamiento(miembros, zona))
    return fallo("mision", "En la semana de lanzamiento rige la misión inicial.");
  if (capitanDeSemana(semana, miembros, zona) !== usuarioId)
    return fallo("mision", "Solo el capitán de la semana define la misión.");
  if (definida?.semana === semana) return fallo("mision", "La misión de esta semana ya está definida.");

  const errores: Record<string, string> = {};
  const accion = ACCIONES_MISION.find((a) => a === entrada.accion);
  if (!accion) errores.accion = "Elegí qué cuenta: probar, leer, dar feedback o publicar.";
  const meta = typeof entrada.meta === "string" && entrada.meta.trim() !== "" ? Number(entrada.meta) : entrada.meta;
  const metaValida =
    typeof meta === "number" && Number.isInteger(meta) && meta >= META_MISION.minima && meta <= META_MISION.maxima;
  if (!metaValida) errores.meta = `La meta tiene que ser un número entero entre ${META_MISION.minima} y ${META_MISION.maxima}.`;
  if (!accion || !metaValida) return { ok: false, errores };
  return { ok: true, valor: { accion, meta } };
}
