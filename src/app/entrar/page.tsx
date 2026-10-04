import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MENSAJES_ACCESO } from "@/auth/errores";
import { FormularioEntrar } from "@/auth/FormularioEntrar";
import { obtenerUsuario } from "@/auth/sesion";
import { destinoSeguro } from "@/auth/validacion";
import { Marca } from "@/components/Marca";
import { configSupabase, modoDemo } from "@/supabase/config";

export const metadata: Metadata = { title: "Entrar" };

type Parametros = Promise<Record<string, string | string[] | undefined>>;
const primero = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor);

export default async function PaginaEntrar({ searchParams }: { searchParams: Parametros }) {
  const parametros = await searchParams;
  // Link de invitación: /entrar?invitacion=CLAVE lleva, después de entrar, a /unirme con la clave.
  const invitacion = primero(parametros.invitacion);
  const destino = invitacion
    ? `/unirme?i=${encodeURIComponent(invitacion.slice(0, 200))}`
    : destinoSeguro(primero(parametros.next));
  if (modoDemo()) redirect(destino);
  const usuario = await obtenerUsuario();
  if (usuario) redirect(destino);

  const configurada = configSupabase() !== null;
  const errorInicial = primero(parametros.error) === "link" ? MENSAJES_ACCESO.linkInvalido : null;
  return (
    <main className="pantalla">
      <Marca />
      <h1 className="titulo-seccion">Entrar</h1>
      <section className="panel">
        {configurada ? (
          <>
            <p>Entrás con tu email, sin clave: te mandamos un mail con un link (y un código, si lo trae).</p>
            <FormularioEntrar destino={destino} errorInicial={errorInicial} />
          </>
        ) : (
          <p role="alert">{MENSAJES_ACCESO.sinConfigurar}</p>
        )}
      </section>
    </main>
  );
}
