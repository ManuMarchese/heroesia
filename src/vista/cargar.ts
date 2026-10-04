// Lo que necesita cada pantalla, leído del repositorio (Supabase o demostración). Ninguna pantalla
// habla con Supabase directo: todas pasan por obtenerRepositorio() y por acá.
import type { Repositorio } from "@/data/repositorio";
import { hechosDe, misionDeSemana, progresoMision } from "@/domain/mision";
import { semanaDe, sumarDias } from "@/domain/tiempo";
import type { Dia, TipoAporte } from "@/domain/tipos";
import { asignarXp } from "@/domain/xp";
import { tarjetasDeAportes, type TarjetaAporteVista } from "./aportes";
import { vistaHeroe, type VistaHeroe } from "./heroe";
import { vistaMision, type VistaMision } from "./mision";

/** Cuántos aportes muestra "Lo nuevo" en Inicio ("Ver todo" lleva a Explorar). */
export const APORTES_EN_INICIO = 8;

export interface VistaBase {
  heroe: VistaHeroe;
  mision: VistaMision | null;
  loNuevo: TarjetaAporteVista[];
}

/**
 * Desde cuándo pedir lo de una semana: el domingo anterior a las 00:00 UTC queda antes del lunes 00:00
 * de cualquier zona; después el dominio filtra la semana exacta con semanaDe().
 */
export function inicioDeConsulta(semana: Dia): string {
  return `${sumarDias(semana, -1)}T00:00:00Z`;
}

export async function cargarBase(repo: Repositorio, ahora: Date): Promise<VistaBase> {
  const semana = semanaDe(ahora);
  const desde = inicioDeConsulta(semana);
  const [miembros, lanzamientoEn, recientes, aportesSemana, accionesSemana, eventosCrudos, definida] = await Promise.all([
    repo.miembros(),
    repo.lanzamientoEn(),
    repo.aportes({ limite: APORTES_EN_INICIO }),
    repo.aportes({ desde }),
    repo.acciones({ desde }),
    repo.eventosXp(),
    repo.misionDefinida(semana),
  ]);
  const acciones = await repo.acciones({ aporteIds: recientes.map((a) => a.id) });
  const eventos = asignarXp(eventosCrudos);
  const usuarioId = repo.usuarioId;
  const yo = miembros.find((m) => m.id === usuarioId);
  const mision = misionDeSemana(semana, { miembros, lanzamientoEn }, definida);
  return {
    heroe: vistaHeroe(eventos, usuarioId, yo?.nombre ?? "", ahora),
    mision: mision
      ? vistaMision(mision, progresoMision(mision, hechosDe(aportesSemana, accionesSemana)), miembros, usuarioId, ahora)
      : null,
    loNuevo: tarjetasDeAportes({ aportes: recientes, acciones, miembros, eventos, usuarioId, ahora }),
  };
}

/** Abrir Inicio registra la entrada del día (XP "Entrar", una vez por día local) y después carga. */
export async function abrirInicio(repo: Repositorio, ahora: Date): Promise<VistaBase> {
  try {
    await repo.registrarEntrada();
  } catch (error) {
    // Sin la entrada solo se pierden 5 XP: la pantalla igual tiene que abrir.
    console.error("No se pudo registrar la entrada del día", error);
  }
  return cargarBase(repo, ahora);
}

export async function cargarExplorar(repo: Repositorio, tipo: TipoAporte, ahora: Date): Promise<TarjetaAporteVista[]> {
  const [miembros, aportes, eventosCrudos] = await Promise.all([repo.miembros(), repo.aportes({ tipo }), repo.eventosXp()]);
  const acciones = await repo.acciones({ aporteIds: aportes.map((a) => a.id) });
  return tarjetasDeAportes({ aportes, acciones, miembros, eventos: asignarXp(eventosCrudos), usuarioId: repo.usuarioId, ahora });
}

export async function cargarPerfil(repo: Repositorio, ahora: Date): Promise<VistaHeroe> {
  const [miembros, eventosCrudos] = await Promise.all([repo.miembros(), repo.eventosXp()]);
  const nombre = miembros.find((m) => m.id === repo.usuarioId)?.nombre ?? "";
  return vistaHeroe(asignarXp(eventosCrudos), repo.usuarioId, nombre, ahora);
}
