"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { editar } from "@/acciones/mis-aportes";
import type { BorradorAporte } from "@/casos/publicar";
import { LIMITES } from "@/domain/aportes";
import type { Dia } from "@/domain/tipos";
import { CamposAporte } from "./CamposAporte";
import campos from "./Campos.module.css";

/** Editar un aporte propio (D43): los mismos campos que al publicar, con el tipo fijo. */
export function FormularioEditar({ aporteId, inicial, hoy }: { aporteId: string; inicial: BorradorAporte; hoy: Dia }) {
  const [borrador, setBorrador] = useState<BorradorAporte>(inicial);
  const [resultado, despachar, guardando] = useActionState(editar, null);
  const errores = resultado && !resultado.ok ? resultado.errores : {};
  const cambiar = (campo: keyof BorradorAporte, valor: string) => setBorrador((b) => ({ ...b, [campo]: valor }));

  return (
    <form
      className={campos.formulario}
      onSubmit={(evento) => {
        evento.preventDefault();
        startTransition(() => despachar({ ...borrador, aporteId }));
      }}
    >
      <label htmlFor="link" className={campos.etiqueta}>
        Link
      </label>
      <input
        id="link"
        name="link"
        type="url"
        inputMode="url"
        className={campos.campo}
        maxLength={LIMITES.link}
        value={borrador.link}
        onChange={(e) => cambiar("link", e.target.value)}
        required
        aria-describedby={errores.link ? "error-link" : undefined}
        aria-invalid={errores.link ? true : undefined}
      />
      {errores.link ? (
        <p id="error-link" role="alert" className={campos.error}>
          {errores.link}
        </p>
      ) : null}
      <CamposAporte borrador={borrador} errores={errores} hoy={hoy} cambiar={cambiar} />
      {errores.general ? (
        <p role="alert" className={campos.error}>
          {errores.general}
        </p>
      ) : null}
      <div className={campos.botones}>
        <button type="submit" className="boton boton--primario" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        <Link href="/" className="boton">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
