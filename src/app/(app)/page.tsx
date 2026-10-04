import { requireUser } from "@/auth/sesion";
import { Marca } from "@/components/Marca";

export default async function PaginaInicio() {
  await requireUser();
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
