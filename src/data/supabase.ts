// Implementación con Supabase. Corre en el servidor con la sesión del usuario: la RLS decide qué puede hacer.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccionValida, AporteValido } from "@/domain/aportes";
import type { Miembro, MisionDefinida } from "@/domain/tipos";
import { faltaEntradaHoy, TOPE_ENTRADAS } from "./entrada";
import { ErrorDatos, traducirErrorPostgres } from "./errores";
import { LIMITE_APORTES, type FiltroAcciones, type FiltroAportes, type Repositorio } from "./repositorio";
import {
  accionDesdeFila,
  aporteDesdeFila,
  datos,
  eventoDesdeFila,
  sinError,
  todasLasFilas,
  type FilaAccion,
  type FilaAporte,
  type FilaEvento,
} from "./supabase-filas";

export function crearRepositorioSupabase(
  cliente: SupabaseClient,
  usuarioId: string,
  reloj: () => Date = () => new Date(),
): Repositorio {
  return {
    usuarioId,

    async miembros() {
      const filas = datos(
        await cliente
          .from("perfiles")
          .select("id, nombre, created_at")
          .order("created_at")
          .overrideTypes<{ id: string; nombre: string; created_at: string }[], { merge: false }>(),
      );
      return filas.map((f): Miembro => ({ id: f.id, nombre: f.nombre, creadoEn: f.created_at }));
    },

    async lanzamientoEn() {
      const r = await cliente.from("configuracion").select("lanzamiento_en").maybeSingle<{ lanzamiento_en: string | null }>();
      if (r.error) throw traducirErrorPostgres(r.error);
      return r.data?.lanzamiento_en ?? null;
    },

    async aportes(filtro: FiltroAportes = {}) {
      let consulta = cliente.from("aportes").select("*");
      if (filtro.tipo) consulta = consulta.eq("tipo", filtro.tipo);
      if (filtro.desde) consulta = consulta.gte("created_at", filtro.desde);
      const filas = datos(
        await consulta
          .order("created_at", { ascending: false })
          .limit(filtro.limite ?? LIMITE_APORTES)
          .overrideTypes<FilaAporte[], { merge: false }>(),
      );
      return filas.map(aporteDesdeFila);
    },

    async aporte(id) {
      const r = await cliente.from("aportes").select("*").eq("id", id).maybeSingle<FilaAporte>();
      if (r.error) throw traducirErrorPostgres(r.error);
      return r.data ? aporteDesdeFila(r.data) : null;
    },

    async acciones(filtro: FiltroAcciones = {}) {
      if (filtro.aporteIds && filtro.aporteIds.length === 0) return [];
      let consulta = cliente.from("acciones").select("*");
      if (filtro.aporteIds) consulta = consulta.in("aporte_id", [...filtro.aporteIds]);
      if (filtro.desde) consulta = consulta.gte("created_at", filtro.desde);
      const filas = datos(await consulta.order("created_at").overrideTypes<FilaAccion[], { merge: false }>());
      const utiles = datos(
        await cliente.from("feedback_util").select("accion_id").overrideTypes<{ accion_id: string }[], { merge: false }>(),
      );
      const marcadas = new Set(utiles.map((u) => u.accion_id));
      return filas.map((f) => accionDesdeFila(f, marcadas.has(f.id)));
    },

    async eventosXp() {
      const filas = await todasLasFilas((desde, hasta) =>
        cliente
          .from("eventos_xp")
          .select("id, perfil_id, motivo, tipo_aporte, aporte_id, created_at", { count: "exact" })
          .order("created_at")
          .order("id")
          .range(desde, hasta)
          .overrideTypes<FilaEvento[], { merge: false }>(),
      );
      return filas.map(eventoDesdeFila);
    },

    async misionDefinida(semana) {
      const r = await cliente.from("misiones").select("*").eq("semana", semana).maybeSingle<{
        semana: string;
        accion: MisionDefinida["accion"];
        meta: number;
        definida_por: string;
        created_at: string;
      }>();
      if (r.error) throw traducirErrorPostgres(r.error);
      if (!r.data) return null;
      const { accion, meta, definida_por, created_at } = r.data;
      return { semana: r.data.semana, accion, meta, definidaPor: definida_por, creadaEn: created_at };
    },

    async publicar(a: AporteValido) {
      const fila = datos(
        await cliente
          .from("aportes")
          .insert({
            tipo: a.tipo,
            link: a.link,
            titulo: a.titulo,
            imagen_url: a.imagenUrl,
            por_que_sirve: a.porQueSirve,
            como_se_usa: a.comoSeUsa,
            fuente: a.fuente,
            fecha_limite: a.fechaLimite,
            que_mirar: a.queMirar,
          })
          .select()
          .single<FilaAporte>(),
      );
      return aporteDesdeFila(fila);
    },

    async accionar(aporteId: string, a: AccionValida) {
      const fila = datos(
        await cliente
          .from("acciones")
          .insert({ aporte_id: aporteId, tipo: a.tipo, resultado: a.resultado, texto: a.texto })
          .select()
          .single<FilaAccion>(),
      );
      return accionDesdeFila(fila, false);
    },

    async marcarUtil(accionId) {
      sinError(await cliente.from("feedback_util").insert({ accion_id: accionId }));
    },

    async cambiarNombre(nombre) {
      const filas = datos(
        await cliente
          .from("perfiles")
          .update({ nombre })
          .eq("id", usuarioId)
          .select("id")
          .overrideTypes<{ id: string }[], { merge: false }>(),
      );
      if (filas.length !== 1) throw new ErrorDatos("no_permitido");
    },

    async definirMision(semana, { accion, meta }) {
      sinError(await cliente.from("misiones").insert({ semana, accion, meta }));
    },

    async registrarEntrada() {
      const ultimas = datos(
        await cliente
          .from("eventos_xp")
          .select("created_at")
          .eq("perfil_id", usuarioId)
          .eq("motivo", "entrar")
          .order("created_at", { ascending: false })
          .limit(TOPE_ENTRADAS)
          .overrideTypes<{ created_at: string }[], { merge: false }>(),
      );
      if (!faltaEntradaHoy(ultimas.map((e) => e.created_at), reloj())) return;
      sinError(await cliente.from("eventos_xp").insert({ motivo: "entrar" }));
    },
  };
}
