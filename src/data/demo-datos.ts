// Datos de ejemplo del modo demostración (HEROES_DEMO=1). Personas y aportes inventados.
import { diaLocal, semanaDe, sumarDias } from "@/domain/tiempo";
import type { Accion, Aporte, Carpeta, Dia, EventoXp, Favorito, Miembro, MisionDefinida, TipoAporte } from "@/domain/tipos";
import { motivoDeAccion } from "@/domain/xp";

export const USUARIO_DEMO = { id: "demo-vos", email: "demo@heroes.invalid", nombre: "Héroe demo" } as const;

/** Como en la base: cada evento guarda el aporte de referencia, para no repetir XP. */
export type EventoDemo = EventoXp & { aporteId: string | null };

export interface EstadoDemo {
  miembros: Miembro[];
  /** Como configuracion.lanzamiento_en: null = la semana del primer perfil. */
  lanzamientoEn: Dia | null;
  aportes: Aporte[];
  acciones: Accion[];
  eventos: EventoDemo[];
  misiones: MisionDefinida[];
  /** Carpetas y favoritos de todos; cada repositorio solo ve los de su usuario (como la RLS). */
  carpetas: (Carpeta & { perfilId: string })[];
  favoritos: (Favorito & { perfilId: string })[];
  secuencia: number;
}

/** Agrega un evento salvo que ya exista para la misma persona, motivo y aporte (como el unique de la base). */
export function agregarEvento(estado: EstadoDemo, evento: Omit<EventoDemo, "id">): void {
  const repetido =
    evento.aporteId !== null &&
    estado.eventos.some(
      (e) => e.perfilId === evento.perfilId && e.motivo === evento.motivo && e.aporteId === evento.aporteId,
    );
  if (repetido) return;
  estado.secuencia += 1;
  estado.eventos.push({ ...evento, id: `demo-e${estado.secuencia}` });
}

/** Lo mismo que hacen los triggers de XP de la migración. */
export function eventosPorAporte(estado: EstadoDemo, aporte: Aporte): void {
  agregarEvento(estado, {
    perfilId: aporte.autorId,
    motivo: "publicar",
    tipoAporte: aporte.tipo,
    aporteId: aporte.id,
    creadoEn: aporte.creadoEn,
  });
}

export function eventosPorAccion(estado: EstadoDemo, accion: Accion, tipoAporte: TipoAporte): void {
  const motivo = motivoDeAccion(accion.tipo);
  if (!motivo) return;
  agregarEvento(estado, { perfilId: accion.perfilId, motivo, tipoAporte, aporteId: accion.aporteId, creadoEn: accion.creadoEn });
}

export function eventosPorUtil(estado: EstadoDemo, accion: Accion, marcadaEn: string): void {
  agregarEvento(estado, {
    perfilId: accion.perfilId,
    motivo: "feedback_util",
    tipoAporte: "proyecto",
    aporteId: accion.aporteId,
    creadoEn: marcadaEn,
  });
}

const HORA = 3_600_000;

export function crearEstadoDemo(ahora: Date): EstadoDemo {
  const hace = (dias: number, horas = 0) => new Date(ahora.getTime() - (dias * 24 + horas) * HORA).toISOString();
  const vos = USUARIO_DEMO.id;
  const miembros: Miembro[] = [
    { id: "demo-ana", nombre: "Ana", creadoEn: hace(35) },
    { id: vos, nombre: USUARIO_DEMO.nombre, creadoEn: hace(35, -1) },
    { id: "demo-leo", nombre: "Leo", creadoEn: hace(34) },
    { id: "demo-sofi", nombre: "Sofi", creadoEn: hace(27) },
    { id: "demo-tomi", nombre: "Tomi", creadoEn: hace(12) },
  ];

  const base = { imagenUrl: null, comoSeUsa: null, fuente: null, fechaLimite: null, queMirar: null };
  const aporte = (id: string, autorId: string, tipo: TipoAporte, titulo: string, porQueSirve: string, creadoEn: string, extra = {}): Aporte => ({
    ...base,
    id,
    autorId,
    tipo,
    titulo,
    porQueSirve,
    creadoEn,
    link: `https://example.com/${id}`,
    ...extra,
  });
  const aportes: Aporte[] = [
    aporte("demo-a1", "demo-ana", "skill", "Revisar un PR con un agente de código", "Marca riesgos antes del review humano", hace(0, 2), {
      comoSeUsa: "Pegale el diff y pedile riesgos concretos, no estilo.",
    }),
    aporte("demo-a2", "demo-leo", "repo", "agent-kit: plantillas de agentes", "Arrancás un agente en minutos", hace(0, 5)),
    aporte("demo-a3", "demo-sofi", "oportunidad", "Hackathon de agentes", "Premios y mentoría para equipos chicos", hace(1), {
      fechaLimite: diaLocal(new Date(ahora.getTime() + 3 * 24 * HORA)),
    }),
    aporte("demo-a4", "demo-tomi", "noticia", "Salió un modelo abierto que corre en la compu", "Sirve para probar sin pagar API", hace(2), {
      fuente: "example.com",
    }),
    aporte("demo-a5", vos, "proyecto", "Mi app de recetas con IA", "Arma el menú de la semana con lo que hay en la heladera", hace(3), {
      queMirar: "Si el primer paso se entiende sin explicación.",
    }),
    aporte("demo-a6", "demo-leo", "skill", "Prompts para escribir tests", "Tests más claros en la mitad de tiempo", hace(8)),
    aporte("demo-a7", "demo-ana", "repo", "Plantilla mínima de evals", "Medís si un cambio de prompt mejora o empeora", hace(15)),
    aporte("demo-a8", "demo-sofi", "noticia", "Guía de costos de modelos", "Para elegir modelo sin sorpresas en la factura", hace(20), {
      fuente: "example.com",
    }),
    aporte("demo-a9", "demo-ana", "proyecto", "Bot que resume reuniones", "Ahorra la minuta de cada reunión", hace(22), {
      queMirar: "La calidad de los resúmenes largos.",
    }),
    // Vencida: Explorar la muestra atenuada.
    aporte("demo-a10", "demo-leo", "oportunidad", "Becas para un curso de agentes", "Cubren el curso completo", hace(10), {
      fechaLimite: diaLocal(new Date(ahora.getTime() - 2 * 24 * HORA)),
    }),
    // Proyecto de otra persona sin tu feedback: la demostración puede "Dar feedback".
    aporte("demo-a11", "demo-sofi", "proyecto", "Tutor de inglés con IA", "Practicás conversación con correcciones", hace(4), {
      queMirar: "Si las correcciones se entienden.",
    }),
  ];

  const accion = (id: string, aporteId: string, perfilId: string, tipo: Accion["tipo"], creadoEn: string, extra: Partial<Accion> = {}): Accion => ({
    id,
    aporteId,
    perfilId,
    tipo,
    creadoEn,
    resultado: null,
    texto: null,
    util: false,
    ...extra,
  });
  const acciones: Accion[] = [
    accion("demo-c1", "demo-a1", "demo-leo", "probar", hace(0, 1), { resultado: "Me encontró un bug real en el PR." }),
    accion("demo-c2", "demo-a1", "demo-sofi", "probar", hace(0, 1), { resultado: "Útil, aunque marca cosas de más." }),
    accion("demo-c3", "demo-a2", "demo-ana", "probar", hace(0, 3), { resultado: "Lo usé para un agente de soporte." }),
    accion("demo-c4", "demo-a4", "demo-ana", "leer", hace(1)),
    accion("demo-c5", "demo-a5", "demo-leo", "feedback", hace(2), { texto: "El primer paso pide demasiados datos." }),
    accion("demo-c6", "demo-a6", vos, "probar", hace(7), { resultado: "Me ahorró media hora de tests." }),
    accion("demo-c7", "demo-a7", vos, "probar", hace(14), { resultado: "La usé para comparar dos prompts." }),
    accion("demo-c8", "demo-a8", vos, "leer", hace(19)),
    accion("demo-c9", "demo-a9", vos, "feedback", hace(21), { texto: "Probá cortar el audio en partes." }),
    accion("demo-c10", "demo-a9", "demo-sofi", "feedback", hace(21), { texto: "Sumale un resumen de una línea." }),
  ];

  // Lanzamiento fijado hace 2 semanas: esta semana el capitán es el usuario de ejemplo (2.º por orden
  // de ingreso), así la demostración muestra el formulario para definir la misión.
  const lanzamientoEn = sumarDias(semanaDe(ahora), -14);
  const estado: EstadoDemo = { miembros, lanzamientoEn, aportes, acciones, eventos: [], misiones: [], carpetas: [], favoritos: [], secuencia: 0 };
  for (const a of aportes) eventosPorAporte(estado, a);
  for (const c of acciones) eventosPorAccion(estado, c, aportes.find((a) => a.id === c.aporteId)?.tipo ?? "skill");
  for (const id of ["demo-c9", "demo-c10"]) {
    const c = acciones.find((x) => x.id === id);
    if (c) {
      c.util = true;
      eventosPorUtil(estado, c, hace(20));
    }
  }
  for (const dias of [1, 2, 4, 7, 8, 14]) {
    agregarEvento(estado, { perfilId: vos, motivo: "entrar", tipoAporte: null, aporteId: null, creadoEn: hace(dias) });
  }
  return estado;
}
