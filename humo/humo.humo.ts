// Prueba de humo en Chromium real (paso 8): la app construida, en modo demostración, a 390 px y en
// escritorio. Se corre con `npm run humo` (build + este archivo). No toca Supabase ni la red externa.
import type { Browser, BrowserContext, Page } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { abrirNavegador, capturar, revisarTamanos, vigilar } from "./navegador";
import {
  accionarCadaTipo,
  definirMisionComoCapitan,
  editarNombre,
  explorarCadaTipo,
  publicarSkill,
  verInicio,
} from "./pasos";
import { arrancarDemo, type ServidorDemo } from "./servidor";

const NOMBRE = "Manu del humo";
let servidor: ServidorDemo;
let navegador: Browser;
const errores: string[] = [];

beforeAll(async () => {
  servidor = await arrancarDemo();
  navegador = await abrirNavegador();
});

afterAll(async () => {
  await navegador?.close();
  await servidor?.cerrar();
});

describe("celular (390 px)", () => {
  let contexto: BrowserContext;
  let pagina: Page;

  beforeAll(async () => {
    contexto = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await contexto.grantPermissions(["clipboard-read", "clipboard-write"], { origin: servidor.url });
    pagina = vigilar(await contexto.newPage(), errores);
  });

  afterAll(async () => {
    await contexto?.close();
  });

  it("Inicio: héroe, misión del equipo y Lo nuevo", async () => {
    await verInicio(pagina, servidor.url);
  });

  it("Explorar: cada tipo, con la oportunidad vencida atenuada", async () => {
    await explorarCadaTipo(pagina, servidor.url);
  });

  it("Perfil: editar el nombre que ve el grupo", async () => {
    await editarNombre(pagina, servidor.url, NOMBRE);
  });

  it("Publicar: link, tipo y plantilla; si la lectura falla, se completa a mano", async () => {
    const lectura = await publicarSkill(pagina, servidor.url, "Skill del humo", NOMBRE);
    console.info(`Lectura del link en este entorno: ${lectura}`);
  });

  it("una acción de cada tipo, con su XP, y el feedback útil", async () => {
    await accionarCadaTipo(pagina, servidor.url);
  });

  it("el capitán define la misión de su semana", async () => {
    await definirMisionComoCapitan(pagina, servidor.url);
  });

  it("Copiar resumen copia el texto de la semana", async () => {
    await pagina.getByRole("button", { name: "Copiar resumen" }).click();
    await pagina.getByText("Copiado. Pegalo en el grupo.").waitFor();
    const copiado = await pagina.evaluate(() => navigator.clipboard.readText());
    expect(copiado).toMatch(/^\*Heroes IA · Semana del \d+\/\d+ al \d+\/\d+\*/);
    expect(copiado).toContain("*Misión del equipo:* Leer 3 noticias");
    expect(copiado).toContain(`Entrá y sumá: ${servidor.url}`);
  });

  it("si el navegador no deja copiar, muestra el texto para copiarlo a mano", async () => {
    const otra = vigilar(await contexto.newPage(), errores);
    await otra.addInitScript(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error("Sin permiso"));
    });
    await otra.goto(`${servidor.url}/`);
    await otra.getByRole("button", { name: "Copiar resumen" }).click();
    await otra.getByText("Tu navegador no dejó copiar: seleccioná el texto y copialo a mano.").waitFor();
    expect(await otra.getByLabel("Resumen de la semana").inputValue()).toContain("*Lo mejor de la semana*");
    await otra.close();
  });
});

describe("escritorio (1280 px)", () => {
  it("Inicio y Explorar se ven bien en una pantalla ancha", async () => {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const pagina = vigilar(await contexto.newPage(), errores);
    await pagina.goto(`${servidor.url}/`);
    await pagina.getByRole("region", { name: "Tu héroe" }).waitFor();
    await revisarTamanos(pagina);
    await capturar(pagina, "07-inicio-escritorio.png");
    await pagina.goto(`${servidor.url}/explorar?tipo=proyecto`);
    await pagina.getByRole("heading", { name: /Tutor de inglés con IA/ }).waitFor();
    await revisarTamanos(pagina);
    await capturar(pagina, "08-explorar-escritorio.png");
    await contexto.close();
  });
});

describe("consola", () => {
  it("no hubo errores de consola ni de página en todo el recorrido", () => {
    expect(errores).toEqual([]);
  });
});
