"use client";

import { startTransition, useActionState, useState } from "react";
import { borrarCarpeta, crearCarpeta, renombrarCarpeta } from "@/acciones/mis-aportes";
import { LIMITE_CARPETA } from "@/domain/carpetas";
import campos from "./Campos.module.css";
import estilos from "./Favoritos.module.css";

import type { CarpetaConAportes } from "@/vista/cargar";

function Carpeta({ carpeta }: { carpeta: CarpetaConAportes }) {
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [nombre, setNombre] = useState(carpeta.nombre);
  const [renombrada, renombrar, renombrando] = useActionState(renombrarCarpeta, null);
  const [borrada, borrar, borrando] = useActionState(borrarCarpeta, null);
  const respuesta = [renombrada, borrada].find((r) => r !== null) ?? null;

  return (
    <li className={estilos.grupo}>
      <div className={estilos.cabecera}>
        <h3 className={estilos.nombre}>
          {carpeta.nombre} · {carpeta.aportes.length}
        </h3>
        <div className={estilos.fila}>
          <button type="button" className="boton" onClick={() => setEditando(!editando)}>
            Renombrar
          </button>
          <button type="button" className="boton" onClick={() => setConfirmando(!confirmando)}>
            Borrar carpeta
          </button>
        </div>
      </div>
      {editando ? (
        <form
          className={campos.formulario}
          onSubmit={(evento) => {
            evento.preventDefault();
            startTransition(() => renombrar({ carpetaId: carpeta.id, nombre }));
            setEditando(false);
          }}
        >
          <label htmlFor={`nombre-${carpeta.id}`} className={campos.etiqueta}>
            Nuevo nombre
          </label>
          <input id={`nombre-${carpeta.id}`} className={campos.campo} value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={LIMITE_CARPETA} required />
          <button type="submit" className="boton boton--primario" disabled={renombrando}>
            Guardar nombre
          </button>
        </form>
      ) : null}
      {confirmando ? (
        <div className={estilos.panel} role="alertdialog" aria-label="Confirmar borrado de carpeta">
          <p className={estilos.aviso}>¿Borrar la carpeta? Lo que guardaste adentro sale de tus favoritos (los aportes no se borran).</p>
          <div className={estilos.fila}>
            <button type="button" className="boton boton--primario" disabled={borrando} onClick={() => startTransition(() => borrar(carpeta.id))}>
              Sí, borrar carpeta
            </button>
            <button type="button" className="boton" onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
      {carpeta.aportes.length > 0 ? (
        <ul className={estilos.guardados}>
          {carpeta.aportes.map((a) => (
            <li key={a.id}>
              <a href={a.link} target="_blank" rel="noopener noreferrer">
                {a.titulo}
                <span className="solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="texto-meta">Carpeta vacía: guardá aportes desde Inicio o Explorar.</p>
      )}
      {respuesta && !respuesta.ok ? (
        <p role="alert" className={estilos.aviso}>
          {respuesta.error}
        </p>
      ) : null}
    </li>
  );
}

/** Mis favoritos (D43): mis carpetas privadas con lo que guardé en cada una. */
export function MisFavoritos({ carpetas }: { carpetas: readonly CarpetaConAportes[] }) {
  const [nombre, setNombre] = useState("");
  const [creada, crear, creando] = useActionState(crearCarpeta, null);
  return (
    <>
      {carpetas.length > 0 ? (
        <ul className={estilos.listado}>
          {carpetas.map((c) => (
            <Carpeta key={`${c.id}-${c.nombre}`} carpeta={c} />
          ))}
        </ul>
      ) : (
        <p className="texto-meta">Todavía no tenés carpetas. Creá una o guardá un aporte desde Inicio o Explorar.</p>
      )}
      <form
        className={campos.formulario}
        onSubmit={(evento) => {
          evento.preventDefault();
          startTransition(() => crear(nombre));
          setNombre("");
        }}
      >
        <label htmlFor="carpeta-nueva" className={campos.etiqueta}>
          Carpeta nueva
        </label>
        <input id="carpeta-nueva" className={campos.campo} value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={LIMITE_CARPETA} placeholder="Ej: Para probar" required />
        <button type="submit" className="boton boton--primario" disabled={creando}>
          Crear carpeta
        </button>
        {creada ? (
          <p role="status" className={estilos.aviso}>
            {creada.ok ? creada.mensaje : creada.error}
          </p>
        ) : null}
      </form>
    </>
  );
}
