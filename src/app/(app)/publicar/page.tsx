import type { Metadata } from "next";

export const metadata: Metadata = { title: "Publicar" };

export default function PaginaPublicar() {
  return (
    <>
      <h1 className="titulo-seccion">Publicar</h1>
      <section className="panel">
        <p>Acá vas a pegar un link, elegir el tipo y contar en una línea por qué sirve.</p>
      </section>
    </>
  );
}
