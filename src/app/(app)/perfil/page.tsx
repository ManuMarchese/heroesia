import type { Metadata } from "next";

export const metadata: Metadata = { title: "Perfil" };

export default function PaginaPerfil() {
  return (
    <>
      <h1 className="titulo-seccion">Perfil</h1>
      <section className="panel">
        <p>Acá vas a ver tu nivel, rango, clase y récord personal.</p>
      </section>
    </>
  );
}
