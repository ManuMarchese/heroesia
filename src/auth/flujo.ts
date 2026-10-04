// Entrada con signInWithOtp (D22, D32): la persona abre el link del mail o escribe el código en la misma
// pantalla (en iPhone el link abre Safari y no la app instalada). Crea el usuario si no existe (D41); sin perfil no ve nada hasta unirse con el link de invitación.
import { MENSAJES_ACCESO, mensajeErrorEnvio, mensajeErrorVerificacion, type ErrorAuth } from "./errores";
import { destinoSeguro, esCodigoValido, esEmailValido, normalizarCodigo, normalizarEmail } from "./validacion";

/** Lo que usamos de supabase.auth. Un cliente falso lo cumple en los tests. */
export interface ClienteAuth {
  signInWithOtp(credenciales: {
    email: string;
    options: { shouldCreateUser: boolean; emailRedirectTo: string };
  }): Promise<{ error: ErrorAuth | null }>;
  verifyOtp(
    parametros: { email: string; token: string; type: "email" } | { token_hash: string; type: TipoLink },
  ): Promise<{ error: ErrorAuth | null }>;
  exchangeCodeForSession(codigo: string): Promise<{ error: ErrorAuth | null }>;
}

export type ResultadoAcceso = { ok: true; email: string } | { ok: false; email: string; error: string };

export async function pedirCodigo(
  cliente: ClienteAuth,
  emailCrudo: unknown,
  urlConfirmacion: string,
): Promise<ResultadoAcceso> {
  const email = normalizarEmail(emailCrudo);
  if (!esEmailValido(email)) return { ok: false, email, error: MENSAJES_ACCESO.emailInvalido };
  const { error } = await cliente.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: urlConfirmacion },
  });
  return error ? { ok: false, email, error: mensajeErrorEnvio(error) } : { ok: true, email };
}

export async function verificarCodigo(
  cliente: ClienteAuth,
  emailCrudo: unknown,
  codigoCrudo: unknown,
): Promise<ResultadoAcceso> {
  const email = normalizarEmail(emailCrudo);
  if (!esEmailValido(email)) return { ok: false, email, error: MENSAJES_ACCESO.emailInvalido };
  const codigo = normalizarCodigo(codigoCrudo);
  if (!esCodigoValido(codigo)) return { ok: false, email, error: MENSAJES_ACCESO.codigoInvalido };
  const { error } = await cliente.verifyOtp({ email, token: codigo, type: "email" });
  return error ? { ok: false, email, error: mensajeErrorVerificacion(error) } : { ok: true, email };
}

/** Tipos de link aceptados: entrada, alta e invitación ("magiclink" y "signup" están deprecados pero llegan). */
export const TIPOS_LINK = ["email", "magiclink", "signup", "invite"] as const;
export type TipoLink = (typeof TIPOS_LINK)[number];
const esTipoLink = (valor: string | null): valor is TipoLink => (TIPOS_LINK as readonly (string | null)[]).includes(valor);

export const DESTINO_LINK_INVALIDO = "/entrar?error=link";

/**
 * /auth/confirm: con la plantilla de mail de token_hash usa verifyOtp (sirve aunque el link se abra en
 * otro navegador); si llega un `code` (plantilla por defecto con PKCE), lo canjea. Devuelve a dónde ir.
 */
export async function confirmarDesdeLink(cliente: ClienteAuth, parametros: URLSearchParams): Promise<string> {
  const tokenHash = parametros.get("token_hash");
  const tipo = parametros.get("type");
  const codigo = parametros.get("code");
  let respuesta: { error: ErrorAuth | null } | null = null;
  if (tokenHash && esTipoLink(tipo)) respuesta = await cliente.verifyOtp({ token_hash: tokenHash, type: tipo });
  else if (codigo) respuesta = await cliente.exchangeCodeForSession(codigo);
  if (!respuesta || respuesta.error) return DESTINO_LINK_INVALIDO;
  return destinoSeguro(parametros.get("next"));
}
