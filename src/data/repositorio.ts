// Capa de acceso a datos: una interfaz y dos implementaciones (Supabase y demostración).
// Las validaciones de contenido las hace el dominio antes de llamar acá; la base las vuelve a exigir.
import type { AccionValida, AporteValido } from "@/domain/aportes";
import type {
  Accion,
  AccionMision,
  Aporte,
  Dia,
  EventoXp,
  FechaIso,
  Miembro,
  MisionDefinida,
  TipoAporte,
} from "@/domain/tipos";

export interface FiltroAportes {
  tipo?: TipoAporte;
  /** Solo los creados desde este instante. */
  desde?: FechaIso;
  limite?: number;
}

export interface FiltroAcciones {
  aporteIds?: readonly string[];
  desde?: FechaIso;
}

export interface Repositorio {
  /** Quién está usando la app (sale de la sesión). */
  readonly usuarioId: string;
  miembros(): Promise<Miembro[]>;
  /** configuracion.lanzamiento_en (lo fija Manu con SQL), o null. */
  lanzamientoEn(): Promise<Dia | null>;
  /** Más nuevos primero. */
  aportes(filtro?: FiltroAportes): Promise<Aporte[]>;
  aporte(id: string): Promise<Aporte | null>;
  acciones(filtro?: FiltroAcciones): Promise<Accion[]>;
  eventosXp(): Promise<EventoXp[]>;
  misionDefinida(semana: Dia): Promise<MisionDefinida | null>;
  publicar(aporte: AporteValido): Promise<Aporte>;
  accionar(aporteId: string, accion: AccionValida): Promise<Accion>;
  marcarUtil(accionId: string): Promise<void>;
  definirMision(semana: Dia, definicion: { accion: AccionMision; meta: number }): Promise<void>;
  /** Registra la entrada del día (para el XP de "Entrar"), sin pasar el tope diario de la configuración. */
  registrarEntrada(): Promise<void>;
}

export const LIMITE_APORTES = 100;
