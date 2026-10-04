// Repos de GitHub: se leen con la API pública (Q5), con GITHUB_TOKEN opcional. Sin token son 60 pedidos
// por hora por IP (en este entorno ya estaban agotados), así que el límite se informa con gracia.

export interface RepoGithub {
  dueno: string;
  repo: string;
}

/** Primeras partes de github.com que no son un usuario u organización. */
const RUTAS_DE_GITHUB = new Set([
  "about", "apps", "collections", "customer-stories", "enterprise", "events", "explore", "features", "login",
  "marketplace", "new", "notifications", "orgs", "organizations", "pricing", "readme", "search", "security",
  "settings", "sponsors", "topics", "trending",
]);

const PATRON = /^\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100})(?:\/|$)/;

export function repoDeGithub(url: URL): RepoGithub | null {
  const host = url.hostname.toLowerCase();
  if (host !== "github.com" && host !== "www.github.com") return null;
  const m = PATRON.exec(url.pathname);
  if (!m?.[1] || !m[2]) return null;
  const dueno = m[1];
  const repo = m[2].replace(/\.git$/, "");
  if (RUTAS_DE_GITHUB.has(dueno.toLowerCase()) || repo === "" || repo === "." || repo === "..") return null;
  return { dueno, repo };
}

export function urlApiRepo({ dueno, repo }: RepoGithub): URL {
  return new URL(`https://api.github.com/repos/${encodeURIComponent(dueno)}/${encodeURIComponent(repo)}`);
}

/** Encabezados de la API: User-Agent es obligatorio (Q5) y el token, si hay, va como Bearer. */
export function encabezadosGithub(agente: string, token: string | null): Record<string, string> {
  return {
    "user-agent": agente,
    accept: "application/vnd.github+json",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

/** Sin pedidos disponibles: 429, o 403 con x-ratelimit-remaining en 0 (Q5). */
export function esLimiteAgotado(estado: number, encabezados: Readonly<Record<string, string | undefined>>): boolean {
  return estado === 429 || (estado === 403 && encabezados["x-ratelimit-remaining"] === "0");
}

export interface DatosRepo {
  nombre: string;
  descripcion: string | null;
  avatar: string | null;
}

export function datosDeRepo(json: unknown, porDefecto: RepoGithub): DatosRepo {
  const objeto = typeof json === "object" && json !== null ? (json as Record<string, unknown>) : {};
  const dueno = typeof objeto.owner === "object" && objeto.owner !== null ? (objeto.owner as Record<string, unknown>) : {};
  return {
    nombre: typeof objeto.full_name === "string" && objeto.full_name ? objeto.full_name : `${porDefecto.dueno}/${porDefecto.repo}`,
    descripcion: typeof objeto.description === "string" ? objeto.description : null,
    avatar: typeof dueno.avatar_url === "string" ? dueno.avatar_url : null,
  };
}
