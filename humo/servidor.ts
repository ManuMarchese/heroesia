// Levanta la app ya construida (next start) en modo demostración, sin Supabase, en un puerto libre.
import { spawn } from "node:child_process";
import { createServer, type AddressInfo } from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));

function puertoLibre(): Promise<number> {
  return new Promise((resolver, rechazar) => {
    const prueba = createServer();
    prueba.on("error", rechazar);
    prueba.listen(0, "127.0.0.1", () => {
      const { port } = prueba.address() as AddressInfo;
      prueba.close(() => resolver(port));
    });
  });
}

export interface ServidorDemo {
  url: string;
  salida: () => string;
  cerrar: () => Promise<void>;
}

export async function arrancarDemo(): Promise<ServidorDemo> {
  const puerto = await puertoLibre();
  const entorno: NodeJS.ProcessEnv = {
    ...process.env,
    HEROES_DEMO: "1",
    NEXT_PUBLIC_SUPABASE_URL: "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
  };
  delete entorno.VERCEL_ENV;
  const next = join(RAIZ, "node_modules", "next", "dist", "bin", "next");
  const proceso = spawn(process.execPath, [next, "start", "-p", String(puerto), "-H", "127.0.0.1"], {
    cwd: RAIZ,
    env: entorno,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let salida = "";
  proceso.stdout.on("data", (d: Buffer) => (salida += d.toString()));
  proceso.stderr.on("data", (d: Buffer) => (salida += d.toString()));

  const url = `http://127.0.0.1:${puerto}`;
  const cerrar = () =>
    new Promise<void>((listo) => {
      if (proceso.exitCode !== null) return listo();
      proceso.once("exit", () => listo());
      proceso.kill("SIGTERM");
    });

  for (let intento = 0; intento < 120; intento++) {
    if (proceso.exitCode !== null) throw new Error(`next start terminó antes de tiempo:\n${salida}`);
    try {
      const respuesta = await fetch(`${url}/manifest.webmanifest`);
      if (respuesta.ok) return { url, salida: () => salida, cerrar };
    } catch {
      // Todavía no escucha.
    }
    await new Promise((listo) => setTimeout(listo, 500));
  }
  await cerrar();
  throw new Error(`next start no respondió en 60 s:\n${salida}`);
}
