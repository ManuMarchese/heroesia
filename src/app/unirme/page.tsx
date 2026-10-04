import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { tienePerfil } from "@/auth/perfil";
import { requireUser } from "@/auth/sesion";
import { unirseAlGrupo } from "@/auth/union";
import { unirme } from "@/auth/union-accion";
import { Marca } from "@/components/Marca";
import { configSupabase, modoDemo } from "@/supabase/config";
import { crearClienteServidor } from "@/supabase/servidor";

export const metadata: Metadata = { title: "Unirme al grupo" };

type Parametros = Promise<Record<string, string | string[] | undefined>>;
const primero = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor);

export default async function PaginaUnirme({ searchParams }: { searchParams: Parametros }) {
  if (modoDemo() || !configSupabase()) redirect("/");
  const usuario = await requireUser();
  const cliente = await crearClienteServidor();
  if (await tienePerfil(cliente, usuario.id)) redirect("/");

  const parametros = await searchParams;
  let error = primero(parametros.error) ?? null;
  const invitacion = primero(parametros.i);
  if (invitacion && !error) {
    // El link de invitación trae la clave: entra sin pedir nada.
    const resultado = await unirseAlGrupo(cliente, invitacion);
    if (resultado.ok) redirect("/");
    error = resultado.error;
  }
  return (
    <main className="pantalla">
      <Marca />
      <h1 className="titulo-seccion">Unirme al grupo</h1>
      <section className="panel">
        <p>Para entrar necesitás el link de invitación que te pasó Manu. Si lo abriste y no funcionó, pegá acá la clave:</p>
        <form action={unirme} className="formulario">
          <label htmlFor="clave">Clave de invitación</label>
          <input id="clave" name="clave" type="text" autoComplete="off" required />
          {error ? <p role="alert">{error}</p> : null}
          <button type="submit" className="boton boton--primario">
            Unirme
          </button>
        </form>
      </section>
    </main>
  );
}
