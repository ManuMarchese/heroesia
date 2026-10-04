import { describe, expect, it } from "vitest";
import {
  MENSAJES_USUARIO,
  crearCuenta,
  emailDeUsuario,
  esClaveValida,
  esUsuarioValido,
  ingresarConClave,
  normalizarUsuario,
  type ClienteUsuarios,
} from "./usuario";

function falso(opciones: { valida?: boolean; signUp?: { session: boolean; error?: object }; unirme?: boolean; ingreso?: object } = {}) {
  const llamadas: string[] = [];
  const cliente: ClienteUsuarios = {
    async rpc(nombre) {
      llamadas.push(nombre);
      return { data: nombre === "invitacion_valida" ? (opciones.valida ?? true) : (opciones.unirme ?? true), error: null };
    },
    auth: {
      async signUp(datos) {
        llamadas.push(`signUp:${datos.email}`);
        return { data: { session: opciones.signUp?.session ?? true ? {} : null }, error: opciones.signUp?.error ?? null };
      },
      async signInWithPassword(datos) {
        llamadas.push(`signIn:${datos.email}`);
        return { data: null, error: opciones.ingreso ?? null };
      },
    },
  };
  return { cliente, llamadas };
}

const DATOS = { usuario: " Ana_99 ", clave: "12345678", invitacion: "abc" };

describe("usuario y clave", () => {
  it("normaliza y valida el usuario, la clave y arma el email inventado", () => {
    expect(normalizarUsuario(" Ana_99 ")).toBe("ana_99");
    expect(esUsuarioValido("ana_99")).toBe(true);
    for (const malo of ["", "ab", "ana perez", "añ@", "a".repeat(21)]) expect(esUsuarioValido(malo), malo).toBe(false);
    expect(esClaveValida("1234567")).toBe(false);
    expect(esClaveValida("12345678")).toBe(true);
    expect(emailDeUsuario("ana_99")).toBe("ana_99@heroes-app.test");
  });

  it("crear cuenta: valida la invitación, crea el usuario y lo une al grupo", async () => {
    const { cliente, llamadas } = falso();
    expect(await crearCuenta(cliente, DATOS)).toEqual({ ok: true });
    expect(llamadas).toEqual(["invitacion_valida", "signUp:ana_99@heroes-app.test", "unirme"]);
  });

  it("con una invitación mala o sin invitación no crea ningún usuario", async () => {
    const mala = falso({ valida: false });
    expect(await crearCuenta(mala.cliente, DATOS)).toEqual({ ok: false, error: MENSAJES_USUARIO.invitacionInvalida });
    expect(mala.llamadas).toEqual(["invitacion_valida"]);
    const sin = falso();
    expect(await crearCuenta(sin.cliente, { ...DATOS, invitacion: "" })).toEqual({ ok: false, error: MENSAJES_USUARIO.invitacionInvalida });
    expect(sin.llamadas).toEqual([]);
  });

  it("usuario o clave inválidos no llaman a nadie; usuario repetido y falta de sesión tienen su mensaje", async () => {
    const { cliente, llamadas } = falso();
    expect(await crearCuenta(cliente, { ...DATOS, usuario: "a b" })).toMatchObject({ ok: false, error: MENSAJES_USUARIO.usuarioInvalido });
    expect(await crearCuenta(cliente, { ...DATOS, clave: "corta" })).toMatchObject({ ok: false, error: MENSAJES_USUARIO.claveCorta });
    expect(llamadas).toEqual([]);
    const repetido = falso({ signUp: { session: false, error: { code: "user_already_exists" } } });
    expect(await crearCuenta(repetido.cliente, DATOS)).toEqual({ ok: false, error: MENSAJES_USUARIO.existe });
    const sinSesion = falso({ signUp: { session: false } });
    expect(await crearCuenta(sinSesion.cliente, DATOS)).toEqual({ ok: false, error: MENSAJES_USUARIO.fallo });
  });

  it("ingresar con clave", async () => {
    const bien = falso();
    expect(await ingresarConClave(bien.cliente, "Ana_99", "12345678")).toEqual({ ok: true });
    expect(bien.llamadas).toEqual(["signIn:ana_99@heroes-app.test"]);
    const mal = falso({ ingreso: { code: "invalid_credentials" } });
    expect(await ingresarConClave(mal.cliente, "ana_99", "x")).toEqual({ ok: false, error: MENSAJES_USUARIO.credenciales });
    expect(await ingresarConClave(bien.cliente, "a b", "x")).toEqual({ ok: false, error: MENSAJES_USUARIO.credenciales });
  });
});
