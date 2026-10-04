// Entrada con usuario y clave, sin mails (D42): el "email" de Auth es usuario@heroes-app.test (dominio inventado,
// nunca recibe nada). Crear la cuenta exige la clave del link de invitación; sin perfil la base no deja leer nada.
import type { ErrorAuth } from "./errores";
import { unirseAlGrupo, normalizarClave, type ClienteRpc } from "./union";

export const DOMINIO_USUARIOS = "heroes-app.test";

export const MENSAJES_USUARIO = {
  usuarioInvalido: "El usuario tiene de 3 a 20 letras, números o guiones bajos (sin espacios ni tildes).",
  claveCorta: "La clave tiene que tener al menos 8 caracteres.",
  invitacionInvalida: "El link de invitación no es válido. Pedile uno nuevo a Manu.",
  existe: "Ese usuario ya existe. Elegí otro, o entrá con tu clave si es tuyo.",
  credenciales: "Usuario o clave incorrectos.",
  esperar: "Hubo muchos intentos seguidos. Esperá un minuto y probá de nuevo.",
  fallo: "No pudimos hacerlo ahora. Probá de nuevo en un rato.",
} as const;

export function normalizarUsuario(texto: unknown): string {
  return typeof texto === "string" ? texto.trim().toLowerCase() : "";
}

export function esUsuarioValido(usuario: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(usuario);
}

export function emailDeUsuario(usuario: string): string {
  return `${usuario}@${DOMINIO_USUARIOS}`;
}

export function esClaveValida(clave: unknown): clave is string {
  return typeof clave === "string" && clave.length >= 8 && clave.length <= 72;
}

type RespuestaAuth = { data: { session: unknown } | null; error: ErrorAuth | null };

/** Lo que usamos del cliente de Supabase. Un cliente falso lo cumple en los tests. */
export interface ClienteUsuarios extends ClienteRpc {
  rpc(
    nombre: "unirme" | "invitacion_valida",
    args: { p_clave: string },
  ): PromiseLike<{ data: boolean | null; error: { message?: string } | null }>;
  auth: {
    signUp(datos: { email: string; password: string }): PromiseLike<RespuestaAuth>;
    signInWithPassword(datos: { email: string; password: string }): PromiseLike<RespuestaAuth>;
  };
}

export type ResultadoUsuario = { ok: true } | { ok: false; error: string };

function mensajeDeError(error: ErrorAuth, alRegistrar: boolean): string {
  const codigo = error.code ?? "";
  if (codigo === "user_already_exists" || /already registered/i.test(error.message ?? "")) return MENSAJES_USUARIO.existe;
  if (codigo === "weak_password") return MENSAJES_USUARIO.claveCorta;
  if (codigo === "over_request_rate_limit" || error.status === 429) return MENSAJES_USUARIO.esperar;
  if (!alRegistrar && codigo === "invalid_credentials") return MENSAJES_USUARIO.credenciales;
  return MENSAJES_USUARIO.fallo;
}

/** Crea la cuenta y la une al grupo con la clave del link. Deja la sesión iniciada (cookies del cliente). */
export async function crearCuenta(
  cliente: ClienteUsuarios,
  datos: { usuario: unknown; clave: unknown; invitacion: unknown },
): Promise<ResultadoUsuario> {
  const usuario = normalizarUsuario(datos.usuario);
  if (!esUsuarioValido(usuario)) return { ok: false, error: MENSAJES_USUARIO.usuarioInvalido };
  if (!esClaveValida(datos.clave)) return { ok: false, error: MENSAJES_USUARIO.claveCorta };
  const invitacion = normalizarClave(datos.invitacion);
  const valida = invitacion === "" ? null : await cliente.rpc("invitacion_valida", { p_clave: invitacion });
  if (!valida || valida.error || valida.data !== true) return { ok: false, error: MENSAJES_USUARIO.invitacionInvalida };

  const { data, error } = await cliente.auth.signUp({ email: emailDeUsuario(usuario), password: datos.clave });
  if (error) return { ok: false, error: mensajeDeError(error, true) };
  // Sin sesión = el proyecto exige confirmar el mail, que acá nunca llega.
  if (!data?.session) return { ok: false, error: MENSAJES_USUARIO.fallo };
  return unirseAlGrupo(cliente, invitacion);
}

export async function ingresarConClave(cliente: ClienteUsuarios, usuarioCrudo: unknown, clave: unknown): Promise<ResultadoUsuario> {
  const usuario = normalizarUsuario(usuarioCrudo);
  if (!esUsuarioValido(usuario) || typeof clave !== "string" || clave === "") {
    return { ok: false, error: MENSAJES_USUARIO.credenciales };
  }
  const { error } = await cliente.auth.signInWithPassword({ email: emailDeUsuario(usuario), password: clave });
  return error ? { ok: false, error: mensajeDeError(error, false) } : { ok: true };
}
