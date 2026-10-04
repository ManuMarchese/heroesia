"use client";

import { startTransition, useActionState, useState } from "react";
import { guardarFavorito, guardarFavoritoEnNueva, quitarFavorito } from "@/acciones/mis-aportes";
import { LIMITE_CARPETA } from "@/domain/carpetas";
import campos from "./Campos.module.css";
import estilos from "./Favoritos.module.css";
import { Icono } from "./Icono";

export interface CarpetaOpcion {
  id: string;
  nombre: string;
}

/** Guardar un aporte en favoritos (D43): se elige una carpeta propia o se crea una nueva. Una carpeta por aporte. */
export function BotonFavorito({
  aporteId,
  carpetaId,
  carpetas,
}: {
  aporteId: string;
  carpetaId: string | null;
  carpetas: readonly CarpetaOpcion[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardada, guardar, guardando] = useActionState(guardarFavorito, null);
  const [nueva, guardarEnNueva, creando] = useActionState(guardarFavoritoEnNueva, null);
  const [quitada, quitar, quitando] = useActionState(quitarFavorito, null);
  const respuesta = [guardada, nueva, quitada].find((r) => r !== null) ?? null;
  const ocupado = guardando || creando || quitando;
  const actual = carpetas.find((c) => c.id === carpetaId);

  return (
    <>
      <button
        type="button"
        className={`boton ${carpetaId ? estilos.activa : ""}`}
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
      >
        <Icono nombre="marcador" tam={16} grosor={3} />
        {actual ? `Guardado en ${actual.nombre}` : "Guardar"}
      </button>
      {abierto ? (
        <div className={estilos.panel}>
          {carpetas.length > 0 ? (
            <ul className={estilos.carpetas} aria-label="Tus carpetas">
              {carpetas.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`boton ${c.id === carpetaId ? estilos.activa : ""}`}
                    disabled={ocupado}
                    onClick={() => startTransition(() => guardar({ aporteId, carpetaId: c.id }))}
                  >
                    {c.nombre}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={estilos.aviso}>Todavía no tenés carpetas: creá la primera.</p>
          )}
          <form
            className={campos.formulario}
            onSubmit={(evento) => {
              evento.preventDefault();
              startTransition(() => guardarEnNueva({ aporteId, nombre }));
              setNombre("");
            }}
          >
            <label htmlFor={`carpeta-${aporteId}`} className={campos.etiqueta}>
              Carpeta nueva
            </label>
            <input
              id={`carpeta-${aporteId}`}
              className={campos.campo}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={LIMITE_CARPETA}
              placeholder="Ej: Para probar"
              required
            />
            <div className={campos.botones}>
              <button type="submit" className="boton boton--primario" disabled={ocupado}>
                Crear y guardar
              </button>
              {carpetaId ? (
                <button type="button" className="boton" disabled={ocupado} onClick={() => startTransition(() => quitar(aporteId))}>
                  Quitar de favoritos
                </button>
              ) : null}
            </div>
          </form>
          {respuesta ? (
            <p role="status" className={estilos.aviso}>
              {respuesta.ok ? respuesta.mensaje : respuesta.error}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
