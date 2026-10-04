"use client";

import { useEffect, useRef, useState } from "react";
import estilos from "./Acciones.module.css";
import campos from "./Campos.module.css";
import { Icono } from "./Icono";

type Estado = "inicial" | "copiado" | "manual";

const MENSAJES: Record<Estado, string> = {
  inicial: "",
  copiado: "Copiado. Pegalo en el grupo.",
  manual: "Tu navegador no dejó copiar: seleccioná el texto y copialo a mano.",
};

/** Copiar resumen (U7, D14): arma el texto en el servidor y acá lo copia; no envía nada solo. */
export function BotonCopiarResumen({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<Estado>("inicial");
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (estado === "manual") area.current?.select();
  }, [estado]);

  async function copiar() {
    try {
      if (typeof navigator.clipboard?.writeText !== "function") throw new Error("Sin portapapeles");
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("manual");
    }
  }

  return (
    <div className={estado === "manual" ? `${estilos.copiar} ${estilos.abierta}` : estilos.copiar}>
      <button type="button" className="boton" onClick={() => void copiar()}>
        <Icono nombre="copiar" tam={18} />
        Copiar resumen
      </button>
      <p role="status" className={estilos.mensaje}>
        {MENSAJES[estado]}
      </p>
      {estado === "manual" ? (
        <>
          <label htmlFor="resumen-semana" className="solo-lectores">
            Resumen de la semana
          </label>
          <textarea id="resumen-semana" ref={area} className={campos.campo} value={texto} rows={10} readOnly />
        </>
      ) : null}
    </div>
  );
}
