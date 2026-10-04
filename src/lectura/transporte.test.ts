import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { leerCuerpo } from "./pedir";
import { transporteNode } from "./transporte";

// Servidor local de prueba. El transporte recibe la IP ya validada: acá se le pasa 127.0.0.1 a propósito
// para probar la conexión real; la validación de IP vive en pedir.ts y no se saltea en la app.
let servidor: Server;
let puerto = 0;
const vistos: { host?: string; url?: string; agente?: string }[] = [];
const cierres: string[] = [];

function atender(pedido: IncomingMessage, respuesta: ServerResponse) {
  vistos.push({ host: pedido.headers.host, url: pedido.url, agente: pedido.headers["user-agent"] });
  if (pedido.url === "/redirige") {
    respuesta.writeHead(302, { location: "http://127.0.0.1/admin" }).end();
  } else if (pedido.url === "/gzip") {
    respuesta.writeHead(200, { "content-type": "text/html", "content-encoding": "gzip" }).end(gzipSync("<title>Comprimido</title>"));
  } else if (pedido.url === "/enorme") {
    respuesta.writeHead(200, { "content-type": "text/html" });
    respuesta.on("close", () => cierres.push("enorme"));
    const relleno = Buffer.alloc(65_536, "a");
    const escribir = () => {
      while (!respuesta.destroyed && respuesta.write(relleno));
      if (!respuesta.destroyed) respuesta.once("drain", escribir);
    };
    escribir();
  } else if (pedido.url === "/colgado") {
    // No responde nunca.
  } else {
    respuesta.writeHead(200, { "content-type": "text/html" }).end("<title>Hola</title>");
  }
}

beforeAll(async () => {
  servidor = createServer(atender);
  await new Promise<void>((listo) => servidor.listen(0, "127.0.0.1", listo));
  puerto = (servidor.address() as AddressInfo).port;
});

afterAll(async () => {
  servidor.closeAllConnections();
  await new Promise((listo) => servidor.close(listo));
});

const pedir = (ruta: string, senal = new AbortController().signal) =>
  transporteNode({
    url: new URL(`http://ejemplo.test:${puerto}${ruta}`),
    ip: "127.0.0.1",
    familia: 4,
    encabezados: { "user-agent": "HeroesIA/prueba" },
    senal,
  });

describe("transporte HTTP con la IP fijada", () => {
  it("se conecta a la IP dada sin consultar el DNS y manda el nombre en Host", async () => {
    const r = await pedir("/nota?x=1");
    const cuerpo = await leerCuerpo(r.cuerpo, 1000, new AbortController().signal, false);
    expect([r.estado, cuerpo.toString()]).toEqual([200, "<title>Hola</title>"]);
    expect(vistos.at(-1)).toEqual({ host: `ejemplo.test:${puerto}`, url: "/nota?x=1", agente: "HeroesIA/prueba" });
  });

  it("no sigue redirecciones: las devuelve para que se validen", async () => {
    const r = await pedir("/redirige");
    r.cerrar();
    expect([r.estado, r.encabezados.location]).toEqual([302, "http://127.0.0.1/admin"]);
  });

  it("descomprime gzip", async () => {
    const r = await pedir("/gzip");
    expect((await leerCuerpo(r.cuerpo, 1000, new AbortController().signal, false)).toString()).toBe("<title>Comprimido</title>");
  });

  it("con una respuesta enorme lee hasta el tope y corta la conexión", async () => {
    const r = await pedir("/enorme");
    const cuerpo = await leerCuerpo(r.cuerpo, 200_000, new AbortController().signal, false);
    r.cerrar();
    expect(cuerpo.length).toBe(200_000);
    await expect.poll(() => cierres).toContain("enorme");
  });

  it("si se vence el plazo, el pedido se corta", async () => {
    const control = new AbortController();
    setTimeout(() => control.abort(), 50);
    await expect(pedir("/colgado", control.signal)).rejects.toThrow();
  });
});
