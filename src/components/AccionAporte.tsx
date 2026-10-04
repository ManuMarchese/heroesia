"use client";

import { startTransition, useActionState, useState } from "react";
import { hacerAccion } from "@/acciones/aportes";
import { LIMITES } from "@/domain/aportes";
import { ETIQUETA_HECHA, type TarjetaAporteVista } from "@/vista/aportes";
import estilos from "./Acciones.module.css";
import campos from "./Campos.module.css";
import { Icono } from "./Icono";

const conXp = (xp: number) => (xp > 0 ? ` · +${xp} XP` : "");

/**
 * La acción del tipo de aporte (U3). "Lo probé" pide una línea con el resultado y "Dar feedback", el texto;
 * "Lo leí" y "Me interesa" se registran con un toque. Nadie reacciona a lo propio: el autor ve "Tu aporte".
 */
export function AccionAporte({ tarjeta }: { tarjeta: TarjetaAporteVista }) {
  const { id, accion, xpGanado } = tarjeta;
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState("");
  const [respuesta, despachar, pendiente] = useActionState(hacerAccion, null);
  const pideTexto = accion.tipo === "probar" || accion.tipo === "feedback";
  const enviar = () =>
    startTransition(() =>
      despachar({
        aporteId: id,
        tipo: accion.tipo,
        resultado: accion.tipo === "probar" ? texto : null,
        texto: accion.tipo === "feedback" ? texto : null,
      }),
    );

  let contenido;
  if (tarjeta.esPropio) {
    contenido = <p className={estilos.estado}>Tu aporte{conXp(xpGanado)}</p>;
  } else if (accion.hecha) {
    contenido = (
      <p className={`${estilos.estado} ${estilos.hecha}`}>
        <Icono nombre="check" tam={16} grosor={3} />
        {ETIQUETA_HECHA[accion.tipo]}
        {conXp(xpGanado)}
      </p>
    );
  } else if (pideTexto && abierta) {
    const campoId = `texto-${id}`;
    contenido = (
      <form
        className={campos.formulario}
        onSubmit={(evento) => {
          evento.preventDefault();
          enviar();
        }}
      >
        <label htmlFor={campoId} className={campos.etiqueta}>
          {accion.tipo === "probar" ? "¿Qué resultado te dio? (una línea)" : "Tu feedback"}
        </label>
        {accion.tipo === "probar" ? (
          <input id={campoId} className={campos.campo} value={texto} onChange={(e) => setTexto(e.target.value)} minLength={3} maxLength={LIMITES.resultado} required autoFocus />
        ) : (
          <textarea id={campoId} className={campos.campo} value={texto} onChange={(e) => setTexto(e.target.value)} minLength={3} maxLength={LIMITES.feedback} rows={3} required autoFocus />
        )}
        <div className={campos.botones}>
          <button type="submit" className="boton boton--primario" disabled={pendiente}>
            {pendiente ? "Guardando..." : accion.tipo === "probar" ? "Guardar resultado" : "Enviar feedback"}
          </button>
          <button type="button" className="boton" onClick={() => setAbierta(false)}>
            Cancelar
          </button>
        </div>
      </form>
    );
  } else {
    contenido = (
      <button
        type="button"
        className="boton"
        disabled={pendiente}
        aria-expanded={pideTexto ? false : undefined}
        onClick={() => (pideTexto ? setAbierta(true) : enviar())}
      >
        {accion.tipo === "interes" ? <Icono nombre="marcador" tam={16} grosor={2.8} /> : null}
        {pendiente ? "Guardando..." : accion.etiqueta}
      </button>
    );
  }

  return (
    <div className={abierta && !accion.hecha ? `${estilos.accion} ${estilos.abierta}` : estilos.accion}>
      {contenido}
      <p role="status" className={estilos.mensaje}>
        {respuesta?.ok ? respuesta.mensaje : ""}
      </p>
      {respuesta && !respuesta.ok ? (
        <p role="alert" className={campos.error}>
          {respuesta.error}
        </p>
      ) : null}
    </div>
  );
}
