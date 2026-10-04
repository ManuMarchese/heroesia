import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { entrarConClave, crearMiCuenta } from "@/auth/acciones-usuario";
import { MENSAJES_ACCESO } from "@/auth/errores";
import { FormularioEntrar } from "@/auth/FormularioEntrar";
import { mensajeConocido } from "@/auth/mensajes";
import { obtenerUsuario } from "@/auth/sesion";
import { destinoSeguro } from "@/auth/validacion";
import { Marca } from "@/components/Marca";
import { configSupabase, modoDemo } from "@/supabase/config";

export const metadata: Metadata = { title: "Entrar" };

type Parametros = Promise<Record<string, string | string[] | undefined>>;
const primero = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor);

export default async function PaginaEntrar({ searchParams }: { searchParams: Parametros }) {
  const parametros = await searchParams;
  // Link de invitación: /entrar?invitacion=CLAVE deja crear la cuenta con usuario y clave (D42).
  const invitacion = (primero(parametros.invitacion) ?? "").slice(0, 200);
  const destino = destinoSeguro(primero(parametros.next));
  if (modoDemo()) redirect(destino);
  const usuario = await obtenerUsuario();
  if (usuario) redirect(invitacion ? `/unirme?i=${encodeURIComponent(invitacion)}` : destino);

  const configurada = configSupabase() !== null;
  const errorForm = mensajeConocido(primero(parametros.error));
  const errorInicial = primero(parametros.error) === "link" ? MENSAJES_ACCESO.linkInvalido : null;
  const error = errorForm ? (
    <p role="alert" className="error">
      {errorForm}
    </p>
  ) : null;
  return (
    <main className="pantalla">
      <Marca />
      <h1 className="titulo-seccion">Entrar</h1>
      {configurada ? (
        <>
          {invitacion ? (
            <section className="panel">
              <h2>Creá tu cuenta</h2>
              <p>Elegí un usuario y una clave. No hace falta ningún mail.</p>
              <form action={crearMiCuenta} className="formulario">
                <input type="hidden" name="invitacion" value={invitacion} />
                <label htmlFor="usuario-nuevo">Usuario</label>
                <input id="usuario-nuevo" name="usuario" autoComplete="username" autoCapitalize="none" required />
                <label htmlFor="clave-nueva">Clave (mínimo 8 caracteres)</label>
                <input id="clave-nueva" name="clave" type="password" autoComplete="new-password" minLength={8} required />
                {error}
                <button type="submit" className="boton boton--primario">
                  Crear mi cuenta
                </button>
              </form>
            </section>
          ) : null}
          <section className="panel">
            <h2>{invitacion ? "¿Ya tenés cuenta?" : "Entrar"}</h2>
            <form action={entrarConClave} className="formulario">
              <input type="hidden" name="next" value={destino} />
              <label htmlFor="usuario">Usuario</label>
              <input id="usuario" name="usuario" autoComplete="username" autoCapitalize="none" required />
              <label htmlFor="clave">Clave</label>
              <input id="clave" name="clave" type="password" autoComplete="current-password" required />
              {invitacion ? null : error}
              <button type="submit" className="boton boton--primario">
                Entrar
              </button>
            </form>
          </section>
          <details className="panel">
            <summary>Entrar con email (solo Manu)</summary>
            <p>Te mandamos un mail con un link (y un código, si lo trae).</p>
            <FormularioEntrar destino={destino} errorInicial={errorInicial} />
          </details>
        </>
      ) : (
        <section className="panel">
          <p role="alert">{MENSAJES_ACCESO.sinConfigurar}</p>
        </section>
      )}
    </main>
  );
}
