// Campos de la plantilla de cada tipo (PLAN, sección 3): base común + extras por tipo.
import type { ReactNode } from "react";
import { ETIQUETA_TIPO, LIMITES } from "@/domain/aportes";
import { TIPOS_APORTE, type Dia } from "@/domain/tipos";
import type { BorradorAporte } from "@/casos/publicar";
import campos from "./Campos.module.css";

type Campo = keyof BorradorAporte;

interface Props {
  borrador: BorradorAporte;
  errores: Readonly<Record<string, string>>;
  hoy: Dia;
  cambiar: (campo: Campo, valor: string) => void;
}

function MensajeError({ campo, errores }: { campo: string; errores: Readonly<Record<string, string>> }) {
  return errores[campo] ? (
    <p id={`error-${campo}`} role="alert" className={campos.error}>
      {errores[campo]}
    </p>
  ) : null;
}

function Texto(props: Props & { campo: Campo; etiqueta: string; ayuda?: string; maximo: number; largo?: boolean; requerido?: boolean }) {
  const { campo, etiqueta, ayuda, maximo, largo, requerido, borrador, errores, cambiar } = props;
  const descripcion = [ayuda ? `ayuda-${campo}` : "", errores[campo] ? `error-${campo}` : ""].filter(Boolean).join(" ");
  const comunes = {
    id: campo,
    name: campo,
    className: campos.campo,
    value: borrador[campo],
    maxLength: maximo,
    required: requerido,
    "aria-describedby": descripcion || undefined,
    "aria-invalid": errores[campo] ? true : undefined,
  };
  let control: ReactNode;
  if (largo) control = <textarea {...comunes} rows={3} onChange={(e) => cambiar(campo, e.target.value)} />;
  else control = <input {...comunes} type="text" onChange={(e) => cambiar(campo, e.target.value)} />;
  return (
    <div className={campos.formulario}>
      <label htmlFor={campo} className={campos.etiqueta}>
        {etiqueta}
      </label>
      {control}
      {ayuda ? (
        <p id={`ayuda-${campo}`} className={campos.ayuda}>
          {ayuda}
        </p>
      ) : null}
      <MensajeError campo={campo} errores={errores} />
    </div>
  );
}

export function SelectorTipoAporte({ borrador, errores, cambiar }: Pick<Props, "borrador" | "errores" | "cambiar">) {
  return (
    <fieldset className={campos.opciones} aria-describedby={errores.tipo ? "error-tipo" : undefined}>
      <legend className={campos.etiqueta}>Tipo</legend>
      {TIPOS_APORTE.map((tipo) => (
        <label key={tipo} className={campos.opcion}>
          <input
            type="radio"
            name="tipo"
            value={tipo}
            className={campos.radio}
            checked={borrador.tipo === tipo}
            onChange={() => cambiar("tipo", tipo)}
            required
          />
          <span className={campos.chip}>{ETIQUETA_TIPO[tipo]}</span>
        </label>
      ))}
      <MensajeError campo="tipo" errores={errores} />
    </fieldset>
  );
}

export function CamposAporte(props: Props) {
  const { borrador, errores, hoy, cambiar } = props;
  return (
    <>
      <Texto {...props} campo="titulo" etiqueta="Título" maximo={LIMITES.titulo} requerido />
      <Texto {...props} campo="porQueSirve" etiqueta="Por qué sirve" ayuda="Una línea: qué te resolvió o para qué lo usarías." maximo={LIMITES.porQueSirve} requerido />
      {borrador.tipo === "skill" ? (
        <Texto {...props} campo="comoSeUsa" etiqueta="Cómo se usa (opcional)" maximo={LIMITES.comoSeUsa} largo />
      ) : null}
      {borrador.tipo === "noticia" ? (
        <Texto {...props} campo="fuente" etiqueta="Fuente" ayuda="Si la dejás vacía, usamos el sitio del link." maximo={LIMITES.fuente} />
      ) : null}
      {borrador.tipo === "oportunidad" ? (
        <div className={campos.formulario}>
          <label htmlFor="fechaLimite" className={campos.etiqueta}>
            Fecha límite
          </label>
          <input
            id="fechaLimite"
            name="fechaLimite"
            type="date"
            className={campos.campo}
            min={hoy}
            value={borrador.fechaLimite}
            onChange={(e) => cambiar("fechaLimite", e.target.value)}
            required
            aria-describedby={errores.fechaLimite ? "error-fechaLimite" : undefined}
            aria-invalid={errores.fechaLimite ? true : undefined}
          />
          <MensajeError campo="fechaLimite" errores={errores} />
        </div>
      ) : null}
      {borrador.tipo === "proyecto" ? (
        <Texto {...props} campo="queMirar" etiqueta="Qué querés que miren" maximo={LIMITES.queMirar} largo requerido />
      ) : null}
    </>
  );
}
