// Tarjetas de aporte (U1, U3, U4): chip de tipo, autor, hace cuánto, prueba social y la acción del tipo.
import { ACCION_DEL_TIPO, diasParaVencer, ETIQUETA_ACCION, ETIQUETA_TIPO, pruebaSocial } from "@/domain/aportes";
import { haceCuanto, textoVencimiento } from "@/domain/formato";
import type { Accion, Aporte, Miembro, TipoAccion, TipoAporte } from "@/domain/tipos";
import { xpPorAporte, type EventoConXp } from "@/domain/xp";

export interface RespuestaVista {
  id: string;
  autor: string;
  texto: string;
  util: boolean;
  propia: boolean;
}

export interface TarjetaAporteVista {
  id: string;
  tipo: TipoAporte;
  etiquetaTipo: string;
  titulo: string;
  link: string;
  porQueSirve: string;
  autor: string;
  hace: string;
  esPropio: boolean;
  comoSeUsa: string | null;
  fuente: string | null;
  queMirar: string | null;
  vencimiento: { texto: string; vencida: boolean } | null;
  accion: { tipo: TipoAccion; etiqueta: string; cantidad: number; textoSocial: string; hecha: boolean };
  /** XP que ganó quien mira con este aporte: por publicarlo o por su acción. */
  xpGanado: number;
  /** Resultados de "Lo probé" o feedbacks, del más nuevo al más viejo. */
  respuestas: RespuestaVista[];
}

/** Lo que ve quien ya hizo la acción. */
export const ETIQUETA_HECHA: Record<TipoAccion, string> = {
  probar: "Lo probaste",
  leer: "Lo leíste",
  interes: "Te interesa",
  feedback: "Diste feedback",
};

const SIN_NADIE: Record<TipoAccion, string> = {
  probar: "Nadie lo probó todavía",
  leer: "Nadie lo leyó todavía",
  interes: "Sin interesados todavía",
  feedback: "Sin feedback todavía",
};

export interface DatosTarjetas {
  aportes: readonly Aporte[];
  acciones: readonly Accion[];
  miembros: readonly Miembro[];
  eventos: readonly EventoConXp[];
  usuarioId: string;
  ahora: Date;
}

export function tarjetasDeAportes(datos: DatosTarjetas): TarjetaAporteVista[] {
  const { aportes, acciones, miembros, eventos, usuarioId, ahora } = datos;
  const nombres = new Map(miembros.map((m) => [m.id, m.nombre]));
  const nombre = (id: string) => nombres.get(id) ?? "Alguien";

  return aportes.map((aporte) => {
    const tipoAccion = ACCION_DEL_TIPO[aporte.tipo];
    const propias = acciones.filter((c) => c.aporteId === aporte.id && c.tipo === tipoAccion);
    const cantidad = propias.length;
    const respuestas = propias
      .filter((c) => (c.resultado ?? c.texto) !== null)
      .sort((a, b) => Date.parse(b.creadoEn) - Date.parse(a.creadoEn))
      .map((c) => ({
        id: c.id,
        autor: nombre(c.perfilId),
        texto: c.resultado ?? c.texto ?? "",
        util: c.util,
        propia: c.perfilId === usuarioId,
      }));
    const dias = aporte.fechaLimite ? diasParaVencer(aporte.fechaLimite, ahora) : null;

    return {
      id: aporte.id,
      tipo: aporte.tipo,
      etiquetaTipo: ETIQUETA_TIPO[aporte.tipo],
      titulo: aporte.titulo,
      link: aporte.link,
      porQueSirve: aporte.porQueSirve,
      autor: nombre(aporte.autorId),
      hace: haceCuanto(aporte.creadoEn, ahora),
      esPropio: aporte.autorId === usuarioId,
      comoSeUsa: aporte.comoSeUsa,
      fuente: aporte.fuente,
      queMirar: aporte.queMirar,
      vencimiento:
        aporte.fechaLimite && dias !== null
          ? { texto: textoVencimiento(dias, aporte.fechaLimite), vencida: dias < 0 }
          : null,
      accion: {
        tipo: tipoAccion,
        etiqueta: ETIQUETA_ACCION[tipoAccion],
        cantidad,
        textoSocial: cantidad > 0 ? pruebaSocial(tipoAccion, cantidad) : SIN_NADIE[tipoAccion],
        hecha: propias.some((c) => c.perfilId === usuarioId),
      },
      xpGanado: xpPorAporte(eventos, usuarioId, aporte.id),
      respuestas,
    };
  });
}
