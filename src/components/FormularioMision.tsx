"use client";

import { startTransition, useActionState, useState } from "react";
import { definirMision } from "@/acciones/aportes";
import { ETIQUETA_ACCION_MISION } from "@/domain/mision";
import { ACCIONES_MISION, type AccionMision } from "@/domain/tipos";
import { META_MISION } from "@/domain/xp-config";
import campos from "./Campos.module.css";

/** Solo lo ve el capitán, en su semana y mientras no la definió (U6, D23). */
export function FormularioMision() {
  const [accion, setAccion] = useState<AccionMision | "">("");
  const [meta, setMeta] = useState("");
  const [respuesta, despachar, pendiente] = useActionState(definirMision, null);
  return (
    <form
      className={campos.formulario}
      onSubmit={(evento) => {
        evento.preventDefault();
        startTransition(() => despachar({ accion, meta }));
      }}
    >
      <fieldset className={campos.opciones}>
        <legend className={campos.etiqueta}>Qué cuenta esta semana</legend>
        {ACCIONES_MISION.map((opcion) => (
          <label key={opcion} className={campos.opcion}>
            <input
              type="radio"
              name="accion-mision"
              value={opcion}
              className={campos.radio}
              checked={accion === opcion}
              onChange={() => setAccion(opcion)}
              required
            />
            <span className={campos.chip}>{ETIQUETA_ACCION_MISION[opcion]}</span>
          </label>
        ))}
      </fieldset>
      <label htmlFor="meta-mision" className={campos.etiqueta}>
        Meta del equipo (de {META_MISION.minima} a {META_MISION.maxima})
      </label>
      <input
        id="meta-mision"
        type="number"
        inputMode="numeric"
        className={campos.campo}
        min={META_MISION.minima}
        max={META_MISION.maxima}
        step={1}
        value={meta}
        onChange={(e) => setMeta(e.target.value)}
        required
        aria-describedby="ayuda-mision"
      />
      <p id="ayuda-mision" className={campos.ayuda}>
        Se define una sola vez y cuenta todo lo de esta semana, desde el lunes.
      </p>
      {respuesta && !respuesta.ok ? (
        <p role="alert" className={campos.error}>
          {respuesta.error}
        </p>
      ) : null}
      <div className={campos.botones}>
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Guardando..." : "Definir misión"}
        </button>
      </div>
    </form>
  );
}
