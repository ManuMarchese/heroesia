"use client";

import { startTransition, useActionState, useState } from "react";
import { leerLinkParaPublicar, publicar } from "@/acciones/publicar";
import type { BorradorAporte } from "@/casos/publicar";
import { LIMITES } from "@/domain/aportes";
import type { Dia, TipoAporte } from "@/domain/tipos";
import { CamposAporte, SelectorTipoAporte } from "./CamposAporte";
import campos from "./Campos.module.css";
import estilos from "./FormularioPublicar.module.css";

const VACIO: BorradorAporte = {
  tipo: "",
  link: "",
  titulo: "",
  porQueSirve: "",
  imagenUrl: "",
  comoSeUsa: "",
  fuente: "",
  fechaLimite: "",
  queMirar: "",
};

type EstadoLectura = { leyendo: boolean; mensaje: string | null };

/** Publicar (U2, D13): pegar el link, leer título e imagen si se puede, elegir el tipo y completar. */
export function FormularioPublicar({ tipoInicial, hoy }: { tipoInicial: TipoAporte | null; hoy: Dia }) {
  const [borrador, setBorrador] = useState<BorradorAporte>({ ...VACIO, tipo: tipoInicial ?? "" });
  const [lectura, setLectura] = useState<EstadoLectura>({ leyendo: false, mensaje: null });
  const [resultado, despachar, publicando] = useActionState(publicar, null);
  const errores = resultado && !resultado.ok ? resultado.errores : {};
  const cambiar = (campo: keyof BorradorAporte, valor: string) => setBorrador((b) => ({ ...b, [campo]: valor }));

  async function leer(link: string) {
    if (!link.trim() || lectura.leyendo) return;
    setLectura({ leyendo: true, mensaje: "Leyendo el link..." });
    try {
      const r = await leerLinkParaPublicar(link);
      if (r.ok) {
        setBorrador((b) => ({
          ...b,
          titulo: r.titulo ?? b.titulo,
          imagenUrl: r.imagenUrl ?? b.imagenUrl,
          fuente: b.fuente || (r.fuente ?? ""),
          tipo: b.tipo || (r.tipoSugerido ?? ""),
        }));
        const mensaje = r.titulo ? "Listo: completamos lo que encontramos. Revisalo antes de publicar." : "No encontramos el título: escribilo vos.";
        setLectura({ leyendo: false, mensaje });
      } else {
        setBorrador((b) => ({ ...b, fuente: b.fuente || (r.fuente ?? "") }));
        setLectura({ leyendo: false, mensaje: r.motivo });
      }
    } catch {
      setLectura({ leyendo: false, mensaje: "No pudimos leer el link. Completá los datos a mano." });
    }
  }

  return (
    <form
      className={campos.formulario}
      onSubmit={(evento) => {
        evento.preventDefault();
        startTransition(() => despachar(borrador));
      }}
    >
      <label htmlFor="link" className={campos.etiqueta}>
        Link
      </label>
      <div className={estilos.fila}>
        <input
          id="link"
          name="link"
          type="url"
          inputMode="url"
          className={`${campos.campo} ${estilos.campo}`}
          placeholder="https://..."
          maxLength={LIMITES.link}
          value={borrador.link}
          onChange={(e) => cambiar("link", e.target.value)}
          onPaste={(e) => void leer(e.clipboardData.getData("text"))}
          required
          aria-describedby={["ayuda-link", errores.link ? "error-link" : ""].filter(Boolean).join(" ")}
          aria-invalid={errores.link ? true : undefined}
        />
        <button type="button" className="boton" onClick={() => void leer(borrador.link)} disabled={lectura.leyendo || !borrador.link.trim()}>
          {lectura.leyendo ? "Leyendo..." : "Leer link"}
        </button>
      </div>
      <p id="ayuda-link" className={campos.ayuda}>
        Pegalo y tratamos de traer el título y la imagen. Si el sitio no deja, completalo a mano.
      </p>
      <p role="status" className={estilos.estado}>
        {lectura.mensaje}
      </p>
      {errores.link ? (
        <p id="error-link" role="alert" className={campos.error}>
          {errores.link}
        </p>
      ) : null}
      {borrador.imagenUrl ? (
        <div className={estilos.imagen}>
          {/* eslint-disable-next-line @next/next/no-img-element -- vista previa de una imagen externa elegida por quien publica */}
          <img src={borrador.imagenUrl} alt="Imagen que se guarda con el aporte" referrerPolicy="no-referrer" />
          <button type="button" className="boton" onClick={() => cambiar("imagenUrl", "")}>
            Quitar imagen
          </button>
        </div>
      ) : null}
      <SelectorTipoAporte borrador={borrador} errores={errores} cambiar={cambiar} />
      <CamposAporte borrador={borrador} errores={errores} hoy={hoy} cambiar={cambiar} />
      {errores.general ? (
        <p role="alert" className={campos.error}>
          {errores.general}
        </p>
      ) : null}
      <div className={campos.botones}>
        <button type="submit" className="boton boton--primario" disabled={publicando}>
          {publicando ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
