/**
 * Configuración de XP, niveles, rangos, clases y misión semanal (D7, D8, D9, D23, D24).
 * Valores iniciales aprobados con el PLAN (D21); se ajustan con el uso real.
 * Manu los revisa en el checklist manual. Es el único lugar donde viven estos números.
 */
import type { AccionMision, Clase, MotivoXp, TipoAporte } from "./tipos";

/** Semana de lunes a domingo y topes diarios en hora de Buenos Aires (D23, supuesto NO VERIFICADO). */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

/** XP por evento y cuántas veces por día cuenta (tabla de la sección 3 del PLAN). */
export const XP_POR_MOTIVO = {
  entrar: { xp: 5, topeDiario: 1 },
  publicar: { xp: 10, topeDiario: 3 },
  leer: { xp: 2, topeDiario: 10 },
  probar: { xp: 30, topeDiario: 5 },
  feedback_util: { xp: 25, topeDiario: 5 },
} as const satisfies Record<MotivoXp, { xp: number; topeDiario: number }>;

/**
 * Curva de niveles (propuesta del Builder): pasar del nivel n al n+1 cuesta XP_BASE_NIVEL × n.
 * Total para llegar al nivel n: 50 × n × (n − 1). Nivel 2 = 100 XP, 3 = 300, 5 = 1.000, 10 = 4.500.
 */
export const XP_BASE_NIVEL = 100;

/** Rangos por nivel (propuesta del Builder). Cada rango rige desde su nivel hasta el siguiente. */
export const RANGOS: readonly { desdeNivel: number; nombre: string }[] = [
  { desdeNivel: 1, nombre: "Recluta" },
  { desdeNivel: 3, nombre: "Aprendiz" },
  { desdeNivel: 5, nombre: "Héroe" },
  { desdeNivel: 8, nombre: "Campeón" },
  { desdeNivel: 12, nombre: "Leyenda" },
];

/** La clase sale del tipo de aporte donde más XP sumaste en esta ventana de días. */
export const DIAS_CLASE = 30;

export const NOMBRE_CLASE: Record<Clase, string> = {
  builder: "Builder",
  scout: "Scout",
  curador: "Curador",
  mentor: "Mentor",
};

/** Builder = Proyectos, Scout = Noticias y Oportunidades, Curador = Skills, Repos y Tecnología. Mentor = feedback útil dado. */
export const CLASE_POR_TIPO: Record<TipoAporte, Clase> = {
  proyecto: "builder",
  noticia: "scout",
  oportunidad: "scout",
  skill: "curador",
  repo: "curador",
  tecnologia: "curador",
};

/** Si dos clases empatan en XP, gana la primera de esta lista. */
export const ORDEN_CLASES_EMPATE: readonly Clase[] = ["builder", "mentor", "curador", "scout"];

/** Misión inicial (D24): rige hasta la semana de lanzamiento incluida (D35), sin capitán. */
export const MISION_LANZAMIENTO = {
  accion: "publicar",
  porMiembro: 2,
  titulo: "Cada uno suma 2 aportes",
} as const satisfies { accion: AccionMision; porMiembro: number; titulo: string };

/** Misión de reemplazo mientras el capitán no define la suya (D23). Rota según la semana. */
export const MISIONES_REEMPLAZO: readonly { accion: AccionMision; meta: number }[] = [
  { accion: "probar", meta: 5 },
  { accion: "publicar", meta: 6 },
  { accion: "leer", meta: 10 },
  { accion: "feedback", meta: 3 },
];

/** Límites de la meta que puede elegir el capitán. */
export const META_MISION = { minima: 1, maxima: 50 } as const;
