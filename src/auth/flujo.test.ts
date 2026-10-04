import { describe, expect, it } from "vitest";
import { ERRORES, clienteFalso } from "./cliente-falso";
import { MENSAJES_ACCESO, mensajeErrorEnvio, mensajeErrorVerificacion } from "./errores";
import { DESTINO_LINK_INVALIDO, confirmarDesdeLink, pedirCodigo, verificarCodigo } from "./flujo";

const CONFIRMAR = "https://heroes.example.com/auth/confirm";

describe("pedir el código", () => {
  it("crea el usuario si no existe (D41): manda shouldCreateUser true y el link a /auth/confirm", async () => {
    const { cliente, llamadas } = clienteFalso();
    expect(await pedirCodigo(cliente, " Ana@Example.com ", CONFIRMAR)).toEqual({ ok: true, email: "ana@example.com" });
    expect(llamadas).toEqual([
      {
        metodo: "signInWithOtp",
        argumentos: { email: "ana@example.com", options: { shouldCreateUser: true, emailRedirectTo: CONFIRMAR } },
      },
    ]);
  });

  it("con un email inválido no llama a Supabase", async () => {
    const { cliente, llamadas } = clienteFalso();
    expect(await pedirCodigo(cliente, "ana", CONFIRMAR)).toMatchObject({ ok: false, error: MENSAJES_ACCESO.emailInvalido });
    expect(llamadas).toEqual([]);
  });

  it("un solo mensaje cubre al no invitado y al invitado que todavía no abrió su mail", async () => {
    expect(MENSAJES_ACCESO.noInvitado).toBe("No encontramos una cuenta activa con ese email. Si ya te invitaron, abrí el mail de invitación y tocá su link; si no, pedile a Manu que te invite.");
    expect(mensajeErrorEnvio({ code: "signup_disabled" })).toBe("No encontramos una cuenta activa con ese email. Si ya te invitaron, abrí el mail de invitación y tocá su link; si no, pedile a Manu que te invite.");
    for (const error of [ERRORES.noInvitado, ERRORES.soloMensaje]) {
      const { cliente } = clienteFalso({ envio: error });
      expect(await pedirCodigo(cliente, "nuevo@example.com", CONFIRMAR)).toEqual({
        ok: false,
        email: "nuevo@example.com",
        error: MENSAJES_ACCESO.noInvitado,
      });
    }
  });

  it("explica el límite de envíos y el email sin SMTP propio", () => {
    expect(mensajeErrorEnvio(ERRORES.limite)).toBe(MENSAJES_ACCESO.esperar);
    expect(mensajeErrorEnvio({ status: 429 })).toBe(MENSAJES_ACCESO.esperar);
    expect(mensajeErrorEnvio(ERRORES.smtpPorDefecto)).toBe(MENSAJES_ACCESO.envioNoConfigurado);
    expect(mensajeErrorEnvio(ERRORES.raro)).toBe(MENSAJES_ACCESO.envioFallo);
  });
});

describe("verificar el código de 6 dígitos", () => {
  it("verifica con type email", async () => {
    const { cliente, llamadas } = clienteFalso();
    expect(await verificarCodigo(cliente, "ana@example.com", "123 456")).toEqual({ ok: true, email: "ana@example.com" });
    expect(llamadas[0]).toEqual({
      metodo: "verifyOtp",
      argumentos: { email: "ana@example.com", token: "123456", type: "email" },
    });
  });

  it("rechaza códigos mal escritos sin llamar a Supabase", async () => {
    const { cliente, llamadas } = clienteFalso();
    expect(await verificarCodigo(cliente, "ana@example.com", "12ab")).toMatchObject({ ok: false, error: MENSAJES_ACCESO.codigoInvalido });
    expect(llamadas).toEqual([]);
  });

  it("explica el código vencido y los demás errores", async () => {
    const { cliente } = clienteFalso({ verificacion: ERRORES.vencido });
    expect(await verificarCodigo(cliente, "ana@example.com", "123456")).toMatchObject({ error: MENSAJES_ACCESO.codigoVencido });
    expect(mensajeErrorVerificacion(ERRORES.raro)).toBe(MENSAJES_ACCESO.verificacionFallo);
    expect(mensajeErrorVerificacion({ code: "over_request_rate_limit" })).toBe(MENSAJES_ACCESO.esperar);
  });
});

describe("link del mail (/auth/confirm)", () => {
  const params = (texto: string) => new URLSearchParams(texto);

  it("con token_hash verifica el link y va al destino pedido", async () => {
    const { cliente, llamadas } = clienteFalso();
    expect(await confirmarDesdeLink(cliente, params("token_hash=abc&type=email&next=/perfil"))).toBe("/perfil");
    expect(llamadas[0]).toEqual({ metodo: "verifyOtp", argumentos: { token_hash: "abc", type: "email" } });
  });

  it("acepta los links de invitación y de alta, y canjea el code de la plantilla por defecto", async () => {
    for (const tipo of ["invite", "signup", "magiclink"]) {
      expect(await confirmarDesdeLink(clienteFalso().cliente, params(`token_hash=abc&type=${tipo}`))).toBe("/");
    }
    const { cliente, llamadas } = clienteFalso();
    expect(await confirmarDesdeLink(cliente, params("code=xyz"))).toBe("/");
    expect(llamadas[0]).toEqual({ metodo: "exchangeCodeForSession", argumentos: "xyz" });
  });

  it("si falta algo, el tipo no corresponde o Supabase lo rechaza, vuelve a /entrar con aviso", async () => {
    expect(await confirmarDesdeLink(clienteFalso().cliente, params(""))).toBe(DESTINO_LINK_INVALIDO);
    expect(await confirmarDesdeLink(clienteFalso().cliente, params("token_hash=abc&type=recovery"))).toBe(DESTINO_LINK_INVALIDO);
    const vencido = clienteFalso({ verificacion: ERRORES.vencido });
    expect(await confirmarDesdeLink(vencido.cliente, params("token_hash=abc&type=email"))).toBe(DESTINO_LINK_INVALIDO);
    const canje = clienteFalso({ canje: ERRORES.raro });
    expect(await confirmarDesdeLink(canje.cliente, params("code=xyz"))).toBe(DESTINO_LINK_INVALIDO);
  });

  it("nunca redirige afuera aunque el link lo pida", async () => {
    expect(await confirmarDesdeLink(clienteFalso().cliente, params("token_hash=a&type=email&next=//otro.com"))).toBe("/");
  });
});
