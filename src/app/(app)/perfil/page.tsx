import type { Metadata } from "next";
import { salir } from "@/auth/acciones";
import { requireUser } from "@/auth/sesion";
import { modoDemo } from "@/supabase/config";

export const metadata: Metadata = { title: "Perfil" };

export default async function PaginaPerfil() {
  const usuario = await requireUser();
  return (
    <>
      <h1 className="titulo-seccion">Perfil</h1>
      <section className="panel">
        <p>Acá vas a ver tu nivel, rango, clase y récord personal.</p>
        {usuario.email ? <p className="texto-meta">Entraste como {usuario.email}</p> : null}
        {modoDemo() ? null : (
          <form action={salir}>
            <button type="submit" className="boton">
              Salir
            </button>
          </form>
        )}
      </section>
    </>
  );
}
