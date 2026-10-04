// Tarjeta de héroe (U1, U5): nivel, rango, clase, XP y récord personal de quien usa la app.
import { recordPersonal } from "@/domain/record";
import type { Dia } from "@/domain/tipos";
import { calcularNivel, claseDe, xpDe, type EventoConXp } from "@/domain/xp";
import { NOMBRE_CLASE } from "@/domain/xp-config";

export interface VistaHeroe {
  nombre: string;
  nivel: number;
  rango: string;
  /** null hasta que sume XP con aportes o acciones en los últimos 30 días. */
  clase: string | null;
  xpTotal: number;
  xpEnNivel: number;
  xpDelNivel: number;
  /** "Lo probé" de esta semana y la mejor semana (PB, D8). */
  pruebasSemana: number;
  record: number;
  semanaRecord: Dia | null;
  esNuevoRecord: boolean;
}

export function vistaHeroe(eventos: readonly EventoConXp[], usuarioId: string, nombre: string, ahora: Date): VistaHeroe {
  const nivel = calcularNivel(xpDe(eventos, usuarioId, ahora));
  const clase = claseDe(eventos, usuarioId, ahora);
  const pruebas = eventos.filter((e) => e.perfilId === usuarioId && e.motivo === "probar").map((e) => e.creadoEn);
  const record = recordPersonal(pruebas, ahora);
  return {
    nombre,
    nivel: nivel.nivel,
    rango: nivel.rango,
    clase: clase ? NOMBRE_CLASE[clase] : null,
    xpTotal: nivel.xpTotal,
    xpEnNivel: nivel.xpEnNivel,
    xpDelNivel: nivel.xpDelNivel,
    pruebasSemana: record.estaSemana,
    record: record.record,
    semanaRecord: record.semanaRecord,
    esNuevoRecord: record.esNuevoRecord && record.estaSemana > 0,
  };
}

/** "Esta semana: 4 pruebas · Tu récord: 6", como en el prototipo. */
export function textoRecord(heroe: Pick<VistaHeroe, "pruebasSemana" | "record">): string {
  const pruebas = heroe.pruebasSemana === 1 ? "1 prueba" : `${heroe.pruebasSemana} pruebas`;
  return `Esta semana: ${pruebas} · Tu récord: ${heroe.record}`;
}
