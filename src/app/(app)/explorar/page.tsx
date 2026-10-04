import type { Metadata } from "next";
import { requireUser } from "@/auth/sesion";

export const metadata: Metadata = { title: "Explorar" };

export default async function PaginaExplorar() {
  await requireUser();
  return (
    <>
      <h1 className="titulo-seccion">Explorar</h1>
      <section className="panel">
        <p>Acá vas a ver los aportes por tipo: Skill, Repo, Noticia, Oportunidad y Proyecto.</p>
      </section>
    </>
  );
}
