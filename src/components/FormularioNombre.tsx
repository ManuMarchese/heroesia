"use client";

import { startTransition, useActionState, useState } from "react";
import { cambiarNombre } from "@/acciones/perfil";
import { LIMITE_NOMBRE } from "@/domain/perfil";
import estilos from "./Campos.module.css";

/** Editar el nombre que ve el grupo (arranca con el prefijo del email). */
export function FormularioNombre({ nombre }: { nombre: string }) {
  const [valor, setValor] = useState(nombre);
  const [respuesta, despachar, pendiente] = useActionState(cambiarNombre, null);
  return (
    <form
      className={estilos.formulario}
      onSubmit={(evento) => {
        evento.preventDefault();
        startTransition(() => despachar(valor));
      }}
    >
      <label htmlFor="nombre" className={estilos.etiqueta}>
        Tu nombre en el grupo
      </label>
      <input
        id="nombre"
        name="nombre"
        className={estilos.campo}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        maxLength={LIMITE_NOMBRE}
        autoComplete="nickname"
        required
        aria-describedby="nombre-ayuda"
        aria-invalid={respuesta?.ok === false ? true : undefined}
      />
      <p id="nombre-ayuda" className={estilos.ayuda}>
        Todo el grupo ve este nombre. Al principio es la parte de tu email antes de la @.
      </p>
      {respuesta?.ok === false ? (
        <p role="alert" className={estilos.error}>
          {respuesta.error}
        </p>
      ) : null}
      {respuesta?.ok ? (
        <p role="status" className={estilos.ok}>
          {respuesta.mensaje}
        </p>
      ) : null}
      <div className={estilos.botones}>
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Guardando..." : "Guardar nombre"}
        </button>
      </div>
    </form>
  );
}
