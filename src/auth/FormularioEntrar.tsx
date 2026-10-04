"use client";

import { useActionState } from "react";
import { entrar } from "./acciones";
import { estadoInicialEntrar } from "./estado";
import estilos from "./FormularioEntrar.module.css";

export function FormularioEntrar({ destino, errorInicial }: { destino: string; errorInicial: string | null }) {
  const [estado, accion, pendiente] = useActionState(entrar, estadoInicialEntrar(destino, errorInicial));
  const error = estado.error ? (
    <p role="alert" className={estilos.error}>
      {estado.error}
    </p>
  ) : null;

  if (estado.paso === "email") {
    return (
      <form action={accion} className={estilos.formulario}>
        <input type="hidden" name="accion" value="pedir" />
        <input type="hidden" name="next" value={estado.destino} />
        <label htmlFor="email" className={estilos.etiqueta}>
          Tu email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          defaultValue={estado.email}
          className={estilos.campo}
        />
        {error}
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Mandando..." : "Mandame el código"}
        </button>
      </form>
    );
  }

  return (
    <div className={estilos.formulario}>
      {estado.aviso ? <p className={estilos.aviso}>{estado.aviso}</p> : null}
      <form action={accion} className={estilos.formulario}>
        <input type="hidden" name="accion" value="verificar" />
        <input type="hidden" name="next" value={estado.destino} />
        <input type="hidden" name="email" value={estado.email} />
        <label htmlFor="codigo" className={estilos.etiqueta}>
          Código de 6 dígitos
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 \-]*"
          maxLength={12}
          required
          className={`${estilos.campo} ${estilos.codigo}`}
        />
        {error}
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className={estilos.secundarias}>
        {(
          [
            ["pedir", "Mandar otro código"],
            ["otro-email", "Usar otro email"],
          ] as const
        ).map(([valor, texto]) => (
          <form key={valor} action={accion}>
            <input type="hidden" name="accion" value={valor} />
            <input type="hidden" name="next" value={estado.destino} />
            <input type="hidden" name="email" value={estado.email} />
            <button type="submit" className="boton" disabled={pendiente}>
              {texto}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
