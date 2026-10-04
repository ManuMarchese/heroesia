"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { borrar } from "@/acciones/mis-aportes";
import estilos from "./Favoritos.module.css";

/** Editar y borrar un aporte propio (D43). Borrar pide confirmación porque se van también las pruebas y el feedback. */
export function AdministrarAporte({ aporteId }: { aporteId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [respuesta, despachar, borrando] = useActionState(borrar, null);

  if (confirmando) {
    return (
      <div className={estilos.panel} role="alertdialog" aria-label="Confirmar borrado">
        <p className={estilos.aviso}>¿Seguro? Se borra el aporte con todas las pruebas y el feedback que le dejaron. No se puede deshacer.</p>
        <div className={estilos.fila}>
          <button type="button" className="boton boton--primario" disabled={borrando} onClick={() => startTransition(() => despachar(aporteId))}>
            {borrando ? "Borrando..." : "Sí, borrar"}
          </button>
          <button type="button" className="boton" disabled={borrando} onClick={() => setConfirmando(false)}>
            Cancelar
          </button>
        </div>
        {respuesta && !respuesta.ok ? (
          <p role="alert" className={estilos.aviso}>
            {respuesta.error}
          </p>
        ) : null}
      </div>
    );
  }
  return (
    <>
      <Link href={`/editar/${aporteId}`} className="boton">
        Editar
      </Link>
      <button type="button" className="boton" onClick={() => setConfirmando(true)}>
        Borrar
      </button>
    </>
  );
}
