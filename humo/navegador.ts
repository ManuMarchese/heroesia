// Chromium real con playwright-core: errores de consola, capturas livianas y chequeos de accesibilidad básicos.
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Locator, type Page } from "playwright-core";
import { expect } from "vitest";

/** El Chromium del entorno; en otra compu, HUMO_CHROMIUM apunta a uno instalado. */
export const CHROMIUM = process.env.HUMO_CHROMIUM ?? "/opt/pw-browsers/chromium";
export const CAPTURAS = fileURLToPath(new URL("../docs/capturas/", import.meta.url));
/** Tope pedido para cada captura. */
export const TOPE_CAPTURA = 250_000;

export function abrirNavegador(): Promise<Browser> {
  return chromium.launch({ executablePath: CHROMIUM });
}

/** Junta los errores de consola y de la página en `errores`. */
export function vigilar(pagina: Page, errores: string[]): Page {
  pagina.on("console", (mensaje) => {
    if (mensaje.type() === "error") errores.push(`${pagina.url()} · consola: ${mensaje.text()}`);
  });
  pagina.on("pageerror", (error) => errores.push(`${pagina.url()} · página: ${error.message}`));
  return pagina;
}

/** Captura PNG de menos de 250 KB. En la de un elemento se oculta la barra fija de abajo para que no lo tape. */
export async function capturar(objetivo: Page | Locator, nombre: string, elemento = false): Promise<void> {
  mkdirSync(CAPTURAS, { recursive: true });
  const ruta = join(CAPTURAS, nombre);
  const style = elemento ? 'nav[aria-label="Principal"] { visibility: hidden !important; }' : undefined;
  await objetivo.screenshot({ path: ruta, animations: "disabled", style });
  expect(statSync(ruta).size, nombre).toBeLessThan(TOPE_CAPTURA);
}

/** Botones y links con forma de botón miden al menos 44 px de alto, y la página no se desborda a lo ancho. */
export async function revisarTamanos(pagina: Page): Promise<void> {
  const chicos = await pagina.$$eval("button, a.boton, nav a, summary, label:has(input[type=radio])", (elementos) =>
    elementos
      .filter((e) => e.getClientRects().length > 0 && e.getBoundingClientRect().height < 44)
      .map((e) => `${e.tagName} "${(e.textContent ?? "").trim()}" ${Math.round(e.getBoundingClientRect().height)}px`),
  );
  expect(chicos).toEqual([]);
  const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(desborde).toBeLessThanOrEqual(0);
}

/** La tarjeta de un aporte por su título. */
export function tarjeta(pagina: Page, titulo: string): Locator {
  return pagina.locator("article").filter({ has: pagina.getByRole("heading", { name: titulo }) });
}
