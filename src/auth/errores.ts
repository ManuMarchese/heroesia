// Mensajes de la entrada. Los códigos salen de ErrorCode de @supabase/auth-js 2.117.2 (lib/error-codes.d.ts).

/** Lo que nos importa de un AuthError de Supabase. */
export interface ErrorAuth {
  code?: string;
  status?: number;
  message?: string;
}

export const MENSAJES_ACCESO = {
  noInvitado:
    "No encontramos una cuenta activa con ese email. Si ya te invitaron, abrí el mail de invitación y tocá su link; si no, pedile a Manu que te invite.",
  emailInvalido: "Ese email no parece válido. Revisalo.",
  codigoInvalido: "El código son 6 números. Revisalo.",
  esperar: "Pediste muchos códigos seguidos. Esperá un minuto y probá de nuevo.",
  envioNoConfigurado: "Todavía no se pueden mandar mails a tu dirección. Avisale a Manu.",
  codigoVencido: "El código venció o no es correcto. Pedí uno nuevo.",
  linkInvalido: "El link venció o ya se usó. Pedí un código nuevo.",
  envioFallo: "No pudimos mandarte el código. Probá de nuevo en un rato.",
  verificacionFallo: "No pudimos entrar con ese código. Probá de nuevo.",
  sinConfigurar: "La app todavía no está configurada. Avisale a Manu.",
} as const;

// Con los registros apagados, un email que no existe recibe 422 "Signups not allowed for otp" (Q8).
const NO_INVITADO = new Set(["otp_disabled", "signup_disabled", "user_not_found"]);
const LIMITE = new Set(["over_email_send_rate_limit", "over_request_rate_limit"]);

export function mensajeErrorEnvio(error: ErrorAuth): string {
  const codigo = error.code ?? "";
  if (NO_INVITADO.has(codigo) || /signups? not allowed/i.test(error.message ?? "")) return MENSAJES_ACCESO.noInvitado;
  // El email por defecto de Supabase solo manda a miembros de la organización (Q1).
  if (codigo === "email_address_not_authorized") return MENSAJES_ACCESO.envioNoConfigurado;
  if (LIMITE.has(codigo) || error.status === 429) return MENSAJES_ACCESO.esperar;
  if (codigo === "email_address_invalid" || codigo === "validation_failed") return MENSAJES_ACCESO.emailInvalido;
  return MENSAJES_ACCESO.envioFallo;
}

export function mensajeErrorVerificacion(error: ErrorAuth): string {
  const codigo = error.code ?? "";
  if (codigo === "otp_expired" || codigo === "invalid_credentials") return MENSAJES_ACCESO.codigoVencido;
  if (LIMITE.has(codigo) || error.status === 429) return MENSAJES_ACCESO.esperar;
  return MENSAJES_ACCESO.verificacionFallo;
}
