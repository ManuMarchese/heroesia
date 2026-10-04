// Capa de acceso a datos: una interfaz y dos implementaciones (Supabase y demostración).
// Las validaciones de contenido las hace el dominio antes de llamar acá; la base las vuelve a exigir.
import type { AccionValida, AporteValido } from "@/domain/aportes";
import type {
  Accion,
  AccionMision,
  Aporte,
  Carpeta,
  Dia,
  EventoXp,
  Favorito,
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
  /** Cambia el nombre que ve el grupo (ya validado con validarNombre). */
  cambiarNombre(nombre: string): Promise<void>;
  definirMision(semana: Dia, definicion: { accion: AccionMision; meta: number }): Promise<void>;
  /** Edita un aporte propio (todo menos el tipo, el autor y la fecha). Solo su autor. */
  editarAporte(id: string, aporte: AporteValido): Promise<Aporte>;
  /** Borra un aporte propio con sus acciones y favoritos. El XP ya ganado queda. Solo su autor. */
  borrarAporte(id: string): Promise<void>;
  /** Mis carpetas de favoritos (privadas), por nombre. */
  carpetas(): Promise<Carpeta[]>;
  /** Mis aportes guardados y en qué carpeta. */
  favoritos(): Promise<Favorito[]>;
  crearCarpeta(nombre: string): Promise<Carpeta>;
  renombrarCarpeta(id: string, nombre: string): Promise<void>;
  /** Borra la carpeta y saca de ahí lo guardado (los aportes no se tocan). */
  borrarCarpeta(id: string): Promise<void>;
  /** Guarda el aporte en la carpeta o, si ya estaba guardado, lo mueve (una sola carpeta por aporte). */
  guardarFavorito(aporteId: string, carpetaId: string): Promise<void>;
  quitarFavorito(aporteId: string): Promise<void>;
  /** Registra la entrada del día (para el XP de "Entrar"), sin pasar el tope diario de la configuración. */
  registrarEntrada(): Promise<void>;
}

export const LIMITE_APORTES = 100;
