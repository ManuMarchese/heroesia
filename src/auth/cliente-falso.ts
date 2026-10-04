// Solo para tests: un supabase.auth falso que anota las llamadas y responde lo que se le pide.
import type { ErrorAuth } from "./errores";
import type { ClienteAuth } from "./flujo";

export function clienteFalso(
  respuestas: { envio?: ErrorAuth | null; verificacion?: ErrorAuth | null; canje?: ErrorAuth | null } = {},
) {
  const llamadas: { metodo: string; argumentos: unknown }[] = [];
  const cliente: ClienteAuth = {
    async signInWithOtp(credenciales) {
      llamadas.push({ metodo: "signInWithOtp", argumentos: credenciales });
      return { error: respuestas.envio ?? null };
    },
    async verifyOtp(parametros) {
      llamadas.push({ metodo: "verifyOtp", argumentos: parametros });
      return { error: respuestas.verificacion ?? null };
    },
    async exchangeCodeForSession(codigo) {
      llamadas.push({ metodo: "exchangeCodeForSession", argumentos: codigo });
      return { error: respuestas.canje ?? null };
    },
  };
  return { cliente, llamadas };
}

/** Errores con la forma de AuthApiError (código y estado HTTP). */
export const ERRORES = {
  // Registros apagados y email desconocido: 422 "Signups not allowed for otp" (Q8, NO VERIFICADO el código).
  noInvitado: { code: "otp_disabled", status: 422, message: "Signups not allowed for otp" },
  soloMensaje: { status: 422, message: "Signups not allowed for otp" },
  limite: { code: "over_email_send_rate_limit", status: 429, message: "email rate limit exceeded" },
  smtpPorDefecto: { code: "email_address_not_authorized", status: 400, message: "Email address not authorized" },
  vencido: { code: "otp_expired", status: 403, message: "Token has expired or is invalid" },
  raro: { status: 500, message: "boom" },
} satisfies Record<string, ErrorAuth>;
