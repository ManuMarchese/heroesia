// Recorridos del humo. Usan roles y textos visibles, como una persona; sin selectores de CSS.
import type { Page } from "playwright-core";
import { expect } from "vitest";
import { capturar, revisarTamanos, tarjeta } from "./navegador";

export async function verInicio(pagina: Page, url: string): Promise<void> {
  await pagina.goto(`${url}/`);
  const heroe = pagina.getByRole("region", { name: "Tu héroe" });
  await heroe.waitFor();
  expect(await heroe.innerText()).toMatch(/Nivel[\s\S]*XP[\s\S]*Esta semana: \d+ pruebas? · Tu récord: \d+/i);
  expect(await pagina.getByRole("region", { name: /./ }).filter({ hasText: /Misión del equipo/i }).count()).toBe(1);
  await pagina.getByRole("heading", { name: "Lo nuevo" }).waitFor();
  expect(await pagina.locator("article").count()).toBeGreaterThan(0);
  await revisarTamanos(pagina);
  await capturar(pagina, "01-inicio-390.png");
}

export async function explorarCadaTipo(pagina: Page, url: string): Promise<void> {
  await pagina.goto(`${url}/explorar`);
  for (const [tipo, etiqueta] of [
    ["skill", "Skill"],
    ["repo", "Repo"],
    ["noticia", "Noticia"],
    ["proyecto", "Proyecto"],
    ["oportunidad", "Oportunidad"],
  ] as const) {
    const enlace = pagina.getByRole("navigation", { name: "Tipos de aporte" }).getByRole("link", { name: etiqueta, exact: true });
    await enlace.click();
    await pagina.waitForURL(`${url}/explorar?tipo=${tipo}`);
    expect(await enlace.getAttribute("aria-current")).toBe("page");
    const tarjetas = pagina.locator("article");
    expect(await tarjetas.count(), etiqueta).toBeGreaterThan(0);
    for (const texto of await tarjetas.allInnerTexts()) expect(texto.toLowerCase()).toContain(etiqueta.toLowerCase());
  }
  await pagina.getByText(/Venció el \d+\/\d+/).waitFor();
  await revisarTamanos(pagina);
  await capturar(pagina, "04-explorar-390.png");
}

export async function editarNombre(pagina: Page, url: string, nombre: string): Promise<void> {
  await pagina.goto(`${url}/perfil`);
  await pagina.getByText(/te faltan [\d.]+ XP para el \d+/).waitFor();
  await pagina.getByLabel("Tu nombre en el grupo").fill(nombre);
  await pagina.getByRole("button", { name: "Guardar nombre" }).click();
  await pagina.getByText(`Listo: el grupo te ve como ${nombre}.`).waitFor();
  await revisarTamanos(pagina);
  await capturar(pagina, "06-perfil-390.png");
}

/** La lectura del link no se puede verificar acá (la red del entorno la bloquea): se espera éxito o el aviso. */
export async function publicarSkill(pagina: Page, url: string, titulo: string, autor: string): Promise<string> {
  await pagina.goto(`${url}/publicar`);
  await pagina.getByLabel("Link").fill("https://example.com/humo");
  await pagina.getByRole("button", { name: "Leer link" }).click();
  const aviso = pagina.getByText(/Completá los datos a mano|Revisalo antes de publicar|escribilo vos/);
  await aviso.waitFor({ timeout: 20_000 });
  const lectura = await aviso.innerText();
  await pagina.getByRole("radio", { name: "Skill" }).check();
  await pagina.getByLabel("Título").fill(titulo);
  await pagina.getByLabel("Por qué sirve").fill("Prueba de humo en Chromium real");
  await pagina.getByLabel("Cómo se usa (opcional)").fill("Abrís la app, pegás el link y publicás.");
  await revisarTamanos(pagina);
  await capturar(pagina, "05-publicar-390.png");
  await pagina.getByRole("button", { name: "Publicar", exact: true }).click();
  await pagina.waitForURL(`${url}/`);
  const primera = await pagina.locator("article").first().innerText();
  expect(primera).toContain(titulo);
  expect(primera).toContain(autor);
  expect(primera).toContain("Tu aporte · +10 XP");
  return lectura;
}

export async function accionarCadaTipo(pagina: Page, url: string): Promise<void> {
  await pagina.goto(`${url}/`);
  const repo = tarjeta(pagina, "agent-kit");
  await repo.getByRole("button", { name: "Lo probé" }).click();
  await repo.getByLabel(/Qué resultado te dio/).fill("Lo usé para un bot de soporte");
  await repo.getByRole("button", { name: "Guardar resultado" }).click();
  await repo.getByText("¡Listo! Sumaste 30 XP.").waitFor();
  await repo.getByText("Lo probaste · +30 XP").waitFor();

  const noticia = tarjeta(pagina, "Salió un modelo abierto");
  await noticia.getByRole("button", { name: "Lo leí" }).click();
  await noticia.getByText("¡Listo! Sumaste 2 XP.").waitFor();

  const oportunidad = tarjeta(pagina, "Hackathon de agentes");
  await oportunidad.getByRole("button", { name: "Me interesa" }).click();
  await oportunidad.getByText("Anotado: te interesa. Me interesa no da XP.").waitFor();

  const proyecto = tarjeta(pagina, "Tutor de inglés con IA");
  await proyecto.getByRole("button", { name: "Dar feedback" }).click();
  await proyecto.getByLabel("Tu feedback").fill("Las correcciones se entienden; sumá ejemplos.");
  await proyecto.getByRole("button", { name: "Enviar feedback" }).click();
  await proyecto.getByText("Enviado. Si el autor lo marca útil, sumás 25 XP.").waitFor();

  const propio = tarjeta(pagina, "Mi app de recetas con IA");
  // Nadie reacciona a lo propio: el autor no tiene botón de acción.
  expect(await propio.getByRole("button", { name: /Lo probé|Lo leí|Me interesa|Dar feedback/ }).count()).toBe(0);
  await propio.getByText(/Feedback \(1\)/).click();
  await propio.getByRole("button", { name: "Marcar útil" }).click();
  await propio.getByText("Marcado como útil: le suma XP a quien te lo dio.").waitFor();
  await propio.getByText("Útil", { exact: true }).waitFor();

  await capturar(pagina.locator("ul:has(> li > article)"), "03-acciones-390.png", true);
}

export async function definirMisionComoCapitan(pagina: Page, url: string): Promise<void> {
  await pagina.goto(`${url}/`);
  const mision = pagina.getByRole("region").filter({ hasText: /Misión del equipo/i });
  await mision.getByText("Sos el capitán de esta semana: elegí la misión del equipo.").waitFor();
  await mision.getByRole("radio", { name: "Leer noticias" }).check();
  await mision.getByLabel(/Meta del equipo/).fill("3");
  await capturar(mision, "02-mision-capitan-390.png", true);
  await mision.getByRole("button", { name: "Definir misión" }).click();
  await mision.getByText("La elegiste vos, capitán de esta semana.").waitFor();
  expect(await mision.getByRole("heading").innerText()).toBe("Leer 3 noticias");
  expect(await mision.getByRole("button", { name: "Definir misión" }).count()).toBe(0);
}
