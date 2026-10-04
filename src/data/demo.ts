// Implementación de demostración: datos de ejemplo en memoria, sin Supabase. Solo con HEROES_DEMO=1.
// Aplica las mismas reglas que la migración (permisos, acciones por tipo, eventos de XP, capitán).
import { validarAccion, validarMarcaUtil } from "@/domain/aportes";
import { capitanDeSemana, ordenDeIngreso } from "@/domain/mision";
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

  return {
    usuarioId,

    async miembros() {
      return ordenDeIngreso(estado.miembros).map((m) => ({ ...m }));
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
        .map(({ id, perfilId, motivo, tipoAporte, creadoEn }): EventoXp => ({ id, perfilId, motivo, tipoAporte, creadoEn }));
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

    async definirMision(semana, { accion, meta }) {
      const ahora = reloj();
      if (semana !== semanaDe(ahora) || capitanDeSemana(semana, estado.miembros) !== usuarioId) {
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
