import type { Metadata } from "next";

export const metadata: Metadata = { title: "Explorar" };

export default function PaginaExplorar() {
  return (
    <>
      <h1 className="titulo-seccion">Explorar</h1>
      <section className="panel">
        <p>Acá vas a ver los aportes por tipo: Skill, Repo, Noticia, Oportunidad y Proyecto.</p>
      </section>
    </>
  );
}
