import { Marca } from "@/components/Marca";

export default function PaginaInicio() {
  return (
    <>
      <Marca />
      <h1 className="titulo-seccion">Base del héroe</h1>
      <section className="panel">
        <p>Acá vas a ver tu nivel y XP, la Misión del equipo y Lo nuevo.</p>
      </section>
    </>
  );
}
