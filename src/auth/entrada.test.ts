import { describe, expect, it } from "vitest";
import { ERRORES, clienteFalso } from "./cliente-falso";
import { procesarEntrada } from "./entrada";
import { MENSAJES_ACCESO } from "./errores";
import { estadoInicialEntrar, type EstadoEntrar } from "./estado";

const ORIGEN = "https://heroes.example.com";
const formulario = (campos: Record<string, string>) => {
  const datos = new FormData();
  for (const [clave, valor] of Object.entries(campos)) datos.set(clave, valor);
  return datos;
};
const enCodigo: EstadoEntrar = { paso: "codigo", email: "ana@example.com", destino: "/perfil", aviso: null, error: null };

describe("formulario de /entrar", () => {
  it("pedir: manda el código y pasa al paso del código con el aviso", async () => {
    const { cliente, llamadas } = clienteFalso();
    const r = await procesarEntrada(estadoInicialEntrar("/perfil"), formulario({ accion: "pedir", email: "Ana@example.com", next: "/perfil" }), {
      cliente,
      origen: ORIGEN,
    });
    expect(r).toEqual({
      estado: {
        paso: "codigo",
        email: "ana@example.com",
        destino: "/perfil",
        aviso: expect.stringContaining("código de 6 dígitos"),
        error: null,
      },
    });
    expect(llamadas[0]?.argumentos).toMatchObject({ options: { emailRedirectTo: `${ORIGEN}/auth/confirm` } });
  });

  it("pedir con un email no invitado: se queda en el paso del email con el mensaje", async () => {
    const { cliente } = clienteFalso({ envio: ERRORES.noInvitado });
    const r = await procesarEntrada(estadoInicialEntrar(), formulario({ accion: "pedir", email: "nuevo@example.com" }), {
      cliente,
      origen: ORIGEN,
    });
    expect(r).toEqual({
      estado: { paso: "email", email: "nuevo@example.com", destino: "/", aviso: null, error: MENSAJES_ACCESO.noInvitado },
    });
  });

  it("verificar: con el código correcto redirige al destino", async () => {
    const { cliente } = clienteFalso();
    const r = await procesarEntrada(enCodigo, formulario({ accion: "verificar", email: enCodigo.email, codigo: "123456", next: "/perfil" }), {
      cliente,
      origen: ORIGEN,
    });
    expect(r).toEqual({ redirigir: "/perfil" });
  });

  it("verificar: con el código vencido se queda en el paso del código con el error", async () => {
    const { cliente } = clienteFalso({ verificacion: ERRORES.vencido });
    const r = await procesarEntrada(enCodigo, formulario({ accion: "verificar", email: enCodigo.email, codigo: "123456" }), {
      cliente,
      origen: ORIGEN,
    });
    expect(r).toMatchObject({ estado: { paso: "codigo", error: MENSAJES_ACCESO.codigoVencido } });
  });

  it("nunca redirige afuera aunque el formulario lo pida", async () => {
    const { cliente } = clienteFalso();
    const r = await procesarEntrada(enCodigo, formulario({ accion: "verificar", email: enCodigo.email, codigo: "123456", next: "https://otro.com" }), {
      cliente,
      origen: ORIGEN,
    });
    expect(r).toEqual({ redirigir: "/" });
  });

  it("'Usar otro email' vuelve al inicio y sin Supabase avisa que falta configurar", async () => {
    expect(await procesarEntrada(enCodigo, formulario({ accion: "otro-email", next: "/perfil" }), { cliente: null, origen: ORIGEN })).toEqual({
      estado: estadoInicialEntrar("/perfil"),
    });
    const r = await procesarEntrada(estadoInicialEntrar(), formulario({ accion: "pedir", email: "ana@example.com" }), {
      cliente: null,
      origen: ORIGEN,
    });
    expect(r).toMatchObject({ estado: { error: MENSAJES_ACCESO.sinConfigurar } });
  });

  it("sin origen del pedido no manda nada", async () => {
    const { cliente, llamadas } = clienteFalso();
    const r = await procesarEntrada(estadoInicialEntrar(), formulario({ accion: "pedir", email: "ana@example.com" }), { cliente, origen: null });
    expect(r).toMatchObject({ estado: { error: MENSAJES_ACCESO.envioFallo } });
    expect(llamadas).toEqual([]);
  });
});
