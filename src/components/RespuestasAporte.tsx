"use client";

import { startTransition, useActionState } from "react";
import { marcarUtil } from "@/acciones/aportes";
import type { RespuestaVista, TarjetaAporteVista } from "@/vista/aportes";
import estilos from "./Acciones.module.css";
import campos from "./Campos.module.css";

function Respuesta({ respuesta, puedeMarcar }: { respuesta: RespuestaVista; puedeMarcar: boolean }) {
  const [estado, despachar, pendiente] = useActionState(marcarUtil, null);
  return (
    <div className={estilos.respuesta}>
      <p>
        <strong>{respuesta.autor}:</strong> {respuesta.texto}
      </p>
      {respuesta.util ? <span className={estilos.util}>Útil</span> : null}
      {!respuesta.util && puedeMarcar ? (
        <button type="button" className="boton" disabled={pendiente} onClick={() => startTransition(() => despachar(respuesta.id))}>
          {pendiente ? "Marcando..." : "Marcar útil"}
        </button>
      ) : null}
      <p role="status" className={estilos.mensaje}>
        {estado?.ok ? estado.mensaje : ""}
      </p>
      {estado && !estado.ok ? (
        <p role="alert" className={campos.error}>
          {estado.error}
        </p>
      ) : null}
    </div>
  );
}

/** Resultados de "Lo probé" o feedbacks de un proyecto; el autor del proyecto marca el que le sirvió. */
export function RespuestasAporte({ tarjeta }: { tarjeta: TarjetaAporteVista }) {
  const { respuestas, accion, esPropio } = tarjeta;
  if (respuestas.length === 0) return null;
  const esFeedback = accion.tipo === "feedback";
  const puedeMarcar = esFeedback && esPropio;
  const titulo = `${esFeedback ? "Feedback" : "Resultados"} (${respuestas.length})`;
  const pendientes = puedeMarcar && respuestas.some((r) => !r.util) ? " · marcá el que te sirvió" : "";
  return (
    <details className={estilos.respuestas}>
      <summary>
        {titulo}
        {pendientes}
      </summary>
      <ul className={estilos.lista}>
        {respuestas.map((respuesta) => (
          <li key={respuesta.id}>
            <Respuesta respuesta={respuesta} puedeMarcar={puedeMarcar} />
          </li>
        ))}
      </ul>
    </details>
  );
}
