// Lógica del formulario de /entrar, separada de la Server Action para poder probarla sin Next ni Supabase.
import { MENSAJES_ACCESO } from "./errores";
import { estadoInicialEntrar, type EstadoEntrar } from "./estado";
import { pedirCodigo, verificarCodigo, type ClienteAuth } from "./flujo";
import { destinoSeguro } from "./validacion";

export type PasoSiguiente = { estado: EstadoEntrar } | { redirigir: string };

export function avisoCodigoEnviado(email: string): string {
  return (
    `Te mandamos un mail a ${email}. Abrí el link del mail para entrar. ` +
    "Si el mail trae un código de 6 números, escribilo acá (en iPhone con la app instalada, mejor el código)."
  );
}

/** `cliente` es null si Supabase no está configurado; `origen` es el sitio para el link del mail. */
export async function procesarEntrada(
  previo: EstadoEntrar,
  datos: FormData,
  dependencias: { cliente: ClienteAuth | null; origen: string | null },
): Promise<PasoSiguiente> {
  const destino = destinoSeguro(datos.get("next") ?? previo.destino);
  const accion = datos.get("accion");
  const { cliente, origen } = dependencias;

  if (accion === "otro-email") return { estado: estadoInicialEntrar(destino) };
  if (!cliente) return { estado: { ...previo, destino, aviso: null, error: MENSAJES_ACCESO.sinConfigurar } };

  if (accion === "pedir") {
    if (!origen) return { estado: { ...previo, destino, aviso: null, error: MENSAJES_ACCESO.envioFallo } };
    const r = await pedirCodigo(cliente, datos.get("email"), `${origen}/auth/confirm`);
    return {
      estado: r.ok
        ? { paso: "codigo", email: r.email, destino, aviso: avisoCodigoEnviado(r.email), error: null }
        : { paso: "email", email: r.email, destino, aviso: null, error: r.error },
    };
  }

  if (accion === "verificar") {
    const r = await verificarCodigo(cliente, datos.get("email"), datos.get("codigo"));
    if (r.ok) return { redirigir: destino };
    return { estado: { paso: "codigo", email: r.email, destino, aviso: null, error: r.error } };
  }

  return { estado: previo };
}
