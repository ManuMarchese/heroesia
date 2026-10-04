// Implementación de demostración: datos de ejemplo en memoria, sin Supabase. Solo con HEROES_DEMO=1.
// Aplica las mismas reglas que la migración (permisos, acciones por tipo, eventos de XP, capitán).
import { validarAccion, validarMarcaUtil } from "@/domain/aportes";
import { validarNombreCarpeta } from "@/domain/carpetas";
import { capitanDeSemana, ordenDeIngreso } from "@/domain/mision";
import { validarNombre } from "@/domain/perfil";
import { aFecha, semanaDe } from "@/domain/tiempo";
import { ACCIONES_MISION, type Accion, type Aporte, type EventoXp } from "@/domain/tipos";
import { META_MISION } from "@/domain/xp-config";
import {
  agregarEvento,
  crearEstadoDemo,
  eventosPorAccion,
  eventosPorAporte,
  eventosPorUtil,
  type EstadoDemo,
} from "./demo-datos";
import { faltaEntradaHoy } from "./entrada";
import { ErrorDatos } from "./errores";
import { LIMITE_APORTES, type Repositorio } from "./repositorio";

const momento = (fecha: string) => aFecha(fecha).getTime();
const primerError = (errores: Record<string, string>) => Object.values(errores)[0];

let estadoGlobal: EstadoDemo | null = null;

/** Estado compartido del proceso: lo que se publica en modo demostración vive hasta reiniciar el servidor. */
export function estadoDemo(): EstadoDemo {
  estadoGlobal ??= crearEstadoDemo(new Date());
  return estadoGlobal;
}

export function crearRepositorioDemo(
  estado: EstadoDemo,
  usuarioId: string,
  reloj: () => Date = () => new Date(),
): Repositorio {
  const nuevoId = (prefijo: string) => {
    estado.secuencia += 1;
    return `${prefijo}${estado.secuencia}`;
  };
  const buscarAporte = (id: string) => estado.aportes.find((a) => a.id === id);
  const misCarpetas = () => estado.carpetas.filter((c) => c.perfilId === usuarioId);

  return {
    usuarioId,

    async miembros() {
      return ordenDeIngreso(estado.miembros).map((m) => ({ ...m }));
    },

    async lanzamientoEn() {
      return estado.lanzamientoEn;
    },

    async aportes(filtro = {}) {
      return estado.aportes
        .filter((a) => !filtro.tipo || a.tipo === filtro.tipo)
        .filter((a) => !filtro.desde || momento(a.creadoEn) >= momento(filtro.desde))
        .sort((a, b) => momento(b.creadoEn) - momento(a.creadoEn))
        .slice(0, filtro.limite ?? LIMITE_APORTES)
        .map((a) => ({ ...a }));
    },

    async aporte(id) {
      const aporte = buscarAporte(id);
      return aporte ? { ...aporte } : null;
    },

    async acciones(filtro = {}) {
      return estado.acciones
        .filter((c) => !filtro.aporteIds || filtro.aporteIds.includes(c.aporteId))
        .filter((c) => !filtro.desde || momento(c.creadoEn) >= momento(filtro.desde))
        .sort((a, b) => momento(a.creadoEn) - momento(b.creadoEn))
        .map((c) => ({ ...c }));
    },

    async eventosXp() {
      return [...estado.eventos]
        .sort((a, b) => momento(a.creadoEn) - momento(b.creadoEn))
        .map(({ id, perfilId, motivo, tipoAporte, aporteId, creadoEn }): EventoXp => ({
          id,
          perfilId,
          motivo,
          tipoAporte,
          aporteId,
          creadoEn,
        }));
    },

    async misionDefinida(semana) {
      const mision = estado.misiones.find((m) => m.semana === semana);
      return mision ? { ...mision } : null;
    },

    async publicar(datos) {
      const aporte: Aporte = { ...datos, id: nuevoId("demo-a"), autorId: usuarioId, creadoEn: reloj().toISOString() };
      estado.aportes.push(aporte);
      eventosPorAporte(estado, aporte);
      return { ...aporte };
    },

    async editarAporte(id, datos) {
      const aporte = buscarAporte(id);
      if (!aporte) throw new ErrorDatos("no_encontrado");
      if (aporte.autorId !== usuarioId) throw new ErrorDatos("no_permitido");
      Object.assign(aporte, { ...datos, tipo: aporte.tipo });
      return { ...aporte };
    },

    async borrarAporte(id) {
      const aporte = buscarAporte(id);
      if (!aporte) throw new ErrorDatos("no_encontrado");
      if (aporte.autorId !== usuarioId) throw new ErrorDatos("no_permitido");
      estado.aportes = estado.aportes.filter((a) => a.id !== id);
      estado.acciones = estado.acciones.filter((c) => c.aporteId !== id);
      estado.favoritos = estado.favoritos.filter((f) => f.aporteId !== id);
    },

    async carpetas() {
      return misCarpetas()
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
        .map(({ id, nombre, creadaEn }) => ({ id, nombre, creadaEn }));
    },

    async favoritos() {
      return estado.favoritos.filter((f) => f.perfilId === usuarioId).map(({ aporteId, carpetaId }) => ({ aporteId, carpetaId }));
    },

    async crearCarpeta(nombre) {
      const valido = validarNombreCarpeta(nombre, misCarpetas());
      if (!valido.ok) throw new ErrorDatos("invalido", primerError(valido.errores));
      const carpeta = { id: nuevoId("demo-f"), nombre: valido.valor, creadaEn: reloj().toISOString(), perfilId: usuarioId };
      estado.carpetas.push(carpeta);
      return { id: carpeta.id, nombre: carpeta.nombre, creadaEn: carpeta.creadaEn };
    },

    async renombrarCarpeta(id, nombre) {
      const carpeta = misCarpetas().find((c) => c.id === id);
      if (!carpeta) throw new ErrorDatos("no_permitido");
      const valido = validarNombreCarpeta(nombre, misCarpetas(), id);
      if (!valido.ok) throw new ErrorDatos("invalido", primerError(valido.errores));
      carpeta.nombre = valido.valor;
    },

    async borrarCarpeta(id) {
      if (!misCarpetas().some((c) => c.id === id)) throw new ErrorDatos("no_permitido");
      estado.carpetas = estado.carpetas.filter((c) => c.id !== id);
      estado.favoritos = estado.favoritos.filter((f) => f.carpetaId !== id);
    },

    async guardarFavorito(aporteId, carpetaId) {
      if (!buscarAporte(aporteId)) throw new ErrorDatos("no_encontrado");
      if (!misCarpetas().some((c) => c.id === carpetaId)) throw new ErrorDatos("no_permitido");
      const previo = estado.favoritos.find((f) => f.perfilId === usuarioId && f.aporteId === aporteId);
      if (previo) previo.carpetaId = carpetaId;
      else estado.favoritos.push({ perfilId: usuarioId, aporteId, carpetaId });
    },

    async quitarFavorito(aporteId) {
      estado.favoritos = estado.favoritos.filter((f) => !(f.perfilId === usuarioId && f.aporteId === aporteId));
    },

    async accionar(aporteId, datos) {
      const aporte = buscarAporte(aporteId);
      if (!aporte) throw new ErrorDatos("no_encontrado");
      const validacion = validarAccion(datos, aporte, usuarioId);
      if (!validacion.ok) throw new ErrorDatos("no_permitido", primerError(validacion.errores));
      const repetida = estado.acciones.some(
        (c) => c.aporteId === aporteId && c.perfilId === usuarioId && c.tipo === validacion.valor.tipo,
      );
      if (repetida) throw new ErrorDatos("duplicado");
      const accion: Accion = {
        ...validacion.valor,
        id: nuevoId("demo-c"),
        aporteId,
        perfilId: usuarioId,
        util: false,
        creadoEn: reloj().toISOString(),
      };
      estado.acciones.push(accion);
      eventosPorAccion(estado, accion, aporte.tipo);
      return { ...accion };
    },

    async marcarUtil(accionId) {
      const accion = estado.acciones.find((c) => c.id === accionId);
      const aporte = accion && buscarAporte(accion.aporteId);
      if (!accion || !aporte) throw new ErrorDatos("no_encontrado");
      const validacion = validarMarcaUtil(accion, aporte, usuarioId);
      if (!validacion.ok) throw new ErrorDatos(accion.util ? "duplicado" : "no_permitido", primerError(validacion.errores));
      accion.util = true;
      eventosPorUtil(estado, accion, reloj().toISOString());
    },

    async cambiarNombre(nombre) {
      const yo = estado.miembros.find((m) => m.id === usuarioId);
      if (!yo) throw new ErrorDatos("no_permitido");
      const valido = validarNombre(nombre);
      if (!valido.ok) throw new ErrorDatos("invalido", primerError(valido.errores));
      yo.nombre = valido.valor;
    },

    async definirMision(semana, { accion, meta }) {
      const ahora = reloj();
      const grupo = { miembros: estado.miembros, lanzamientoEn: estado.lanzamientoEn };
      if (semana !== semanaDe(ahora) || capitanDeSemana(semana, grupo) !== usuarioId) {
        throw new ErrorDatos("no_permitido", "Solo el capitán de la semana define la misión.");
      }
      if (estado.misiones.some((m) => m.semana === semana)) throw new ErrorDatos("duplicado");
      const metaValida = Number.isInteger(meta) && meta >= META_MISION.minima && meta <= META_MISION.maxima;
      if (!ACCIONES_MISION.includes(accion) || !metaValida) throw new ErrorDatos("invalido");
      estado.misiones.push({ semana, accion, meta, definidaPor: usuarioId, creadaEn: ahora.toISOString() });
    },

    async registrarEntrada() {
      const ahora = reloj();
      const ultimas = estado.eventos.filter((e) => e.perfilId === usuarioId && e.motivo === "entrar").map((e) => e.creadoEn);
      if (!faltaEntradaHoy(ultimas, ahora)) return;
      agregarEvento(estado, { perfilId: usuarioId, motivo: "entrar", tipoAporte: null, aporteId: null, creadoEn: ahora.toISOString() });
    },
  };
}
