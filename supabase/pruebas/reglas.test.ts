import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACCION_DEL_TIPO } from "@/domain/aportes";
import { TIPOS_ACCION, TIPOS_APORTE, type TipoAporte } from "@/domain/tipos";
import { ANA, BETO, CARO, PROYECTO, SKILL, accionar, como, crearBase, crearUsuario, publicar } from "./entorno";

let db: PGlite;

const CAMPOS: Record<TipoAporte, Record<string, unknown>> = {
  skill: SKILL,
  repo: { ...SKILL, tipo: "repo" },
  noticia: { ...SKILL, tipo: "noticia", fuente: "example.com" },
  oportunidad: { ...SKILL, tipo: "oportunidad", fecha_limite: "2030-01-01" },
  proyecto: PROYECTO,
};
const EXTRA = { probar: { resultado: "Anduvo bien" }, feedback: { texto: "Buen trabajo" } } as Record<string, object>;

async function eventos(perfilId: string) {
  const r = await db.query<{ motivo: string; tipo_aporte: string | null; aporte_id: string | null }>(
    "select motivo, tipo_aporte, aporte_id from public.eventos_xp where perfil_id = $1 order by created_at, motivo",
    [perfilId],
  );
  return r.rows;
}

beforeAll(async () => {
  db = await crearBase();
  await crearUsuario(db, ANA, "ana@example.com");
  await crearUsuario(db, BETO, "beto@example.com");
  await crearUsuario(db, CARO, "caro@example.com");
}, 60_000);

afterAll(async () => {
  await db.close();
});

describe("acciones por tipo (las mismas que ACCION_DEL_TIPO del dominio)", () => {
  it("solo se acepta la acción del tipo de aporte", async () => {
    for (const tipo of TIPOS_APORTE) {
      const aporteId = await publicar(db, ANA, CAMPOS[tipo]);
      for (const accion of TIPOS_ACCION) {
        const aceptada = await accionar(db, BETO, aporteId, accion, EXTRA[accion]).then(
          () => true,
          () => false,
        );
        expect(aceptada, `${tipo} + ${accion}`).toBe(ACCION_DEL_TIPO[tipo] === accion);
      }
    }
  });

  it("nadie reacciona a su propio aporte ni actúa en nombre de otro", async () => {
    const aporteId = await publicar(db, ANA, SKILL);
    await expect(accionar(db, ANA, aporteId, "probar", EXTRA.probar)).rejects.toThrow(/row-level security/);
    await expect(
      como(db, BETO, "insert into public.acciones (aporte_id, perfil_id, tipo, resultado) values ($1, $2, 'probar', 'Bien')", [
        aporteId,
        CARO,
      ]),
    ).rejects.toThrow(/permission denied/);
  });

  it("'Lo probé' exige un resultado de al menos 3 letras y el resto no lo lleva", async () => {
    const skill = await publicar(db, ANA, SKILL);
    const noticia = await publicar(db, ANA, CAMPOS.noticia);
    await expect(accionar(db, BETO, skill, "probar")).rejects.toThrow(/check constraint/);
    await expect(accionar(db, BETO, skill, "probar", { resultado: " ok " })).rejects.toThrow(/check constraint/);
    await expect(accionar(db, BETO, noticia, "leer", { resultado: "Leído" })).rejects.toThrow(/check constraint/);
    await expect(accionar(db, BETO, skill, "probar", { resultado: "Me sirvió" })).resolves.toBeTruthy();
    await expect(accionar(db, BETO, skill, "probar", { resultado: "Otra vez" })).rejects.toThrow(/duplicate key/);
  });

  it("cada uno edita y borra solo sus acciones, sin cambiar el tipo", async () => {
    const skill = await publicar(db, ANA, SKILL);
    const accion = await accionar(db, CARO, skill, "probar", EXTRA.probar);
    const editar = "update public.acciones set resultado = 'Mejor de lo esperado' where id = $1";
    expect((await como(db, BETO, editar, [accion])).afectadas).toBe(0);
    expect((await como(db, CARO, editar, [accion])).afectadas).toBe(1);
    await expect(como(db, CARO, "update public.acciones set tipo = 'leer' where id = $1", [accion])).rejects.toThrow(
      /permission denied/,
    );
    expect((await como(db, BETO, "delete from public.acciones where id = $1", [accion])).afectadas).toBe(0);
  });
});

describe("eventos de XP: los registra la base", () => {
  it("publicar, 'Lo probé' y 'Lo leí' generan su evento; 'Me interesa' y 'Dar feedback' no", async () => {
    await db.exec("delete from public.eventos_xp");
    const skill = await publicar(db, BETO, SKILL);
    const noticia = await publicar(db, BETO, CAMPOS.noticia);
    const oportunidad = await publicar(db, BETO, CAMPOS.oportunidad);
    const proyecto = await publicar(db, BETO, PROYECTO);
    await accionar(db, CARO, skill, "probar", EXTRA.probar);
    await accionar(db, CARO, noticia, "leer");
    await accionar(db, CARO, oportunidad, "interes");
    await accionar(db, CARO, proyecto, "feedback", EXTRA.feedback);
    expect((await eventos(BETO)).map((e) => `${e.motivo}:${e.tipo_aporte}`).sort()).toEqual(
      ["publicar:noticia", "publicar:oportunidad", "publicar:proyecto", "publicar:skill"],
    );
    expect(await eventos(CARO)).toEqual([
      { motivo: "probar", tipo_aporte: "skill", aporte_id: skill },
      { motivo: "leer", tipo_aporte: "noticia", aporte_id: noticia },
    ]);
  });

  it("borrar y repetir la acción no da XP de nuevo, y el evento queda si se borra el aporte", async () => {
    const skill = await publicar(db, ANA, SKILL);
    const accion = await accionar(db, CARO, skill, "probar", EXTRA.probar);
    await como(db, CARO, "delete from public.acciones where id = $1", [accion]);
    await accionar(db, CARO, skill, "probar", EXTRA.probar);
    await como(db, ANA, "delete from public.aportes where id = $1", [skill]);
    const r = await db.query("select motivo from public.eventos_xp where aporte_id = $1 order by motivo", [skill]);
    expect(r.rows).toEqual([{ motivo: "probar" }, { motivo: "publicar" }]);
  });

  it("el feedback suma recién cuando el autor del proyecto lo marca útil, una sola vez", async () => {
    const proyecto = await publicar(db, ANA, PROYECTO);
    const feedback = await accionar(db, BETO, proyecto, "feedback", EXTRA.feedback);
    const marcar = "insert into public.feedback_util (accion_id) values ($1)";
    await expect(como(db, BETO, marcar, [feedback])).rejects.toThrow(/row-level security/);
    await expect(como(db, CARO, marcar, [feedback])).rejects.toThrow(/row-level security/);
    expect((await eventos(BETO)).filter((e) => e.aporte_id === proyecto)).toEqual([]);
    await como(db, ANA, marcar, [feedback]);
    expect((await eventos(BETO)).filter((e) => e.aporte_id === proyecto)).toEqual([
      { motivo: "feedback_util", tipo_aporte: "proyecto", aporte_id: proyecto },
    ]);
    await expect(como(db, ANA, marcar, [feedback])).rejects.toThrow(/duplicate key/);
    await expect(como(db, ANA, "delete from public.feedback_util where accion_id = $1", [feedback])).rejects.toThrow(
      /permission denied/,
    );
  });

  it("solo se marca útil un feedback, no otra acción", async () => {
    const skill = await publicar(db, ANA, SKILL);
    const prueba = await accionar(db, BETO, skill, "probar", EXTRA.probar);
    await expect(como(db, ANA, "insert into public.feedback_util (accion_id) values ($1)", [prueba])).rejects.toThrow(
      /row-level security/,
    );
  });

  it("cada uno registra solo su propia entrada y nadie borra ni edita eventos", async () => {
    const r = await como(db, ANA, "insert into public.eventos_xp (motivo) values ('entrar') returning perfil_id");
    expect(r.rows).toEqual([{ perfil_id: ANA }]);
    await expect(como(db, ANA, "insert into public.eventos_xp (motivo) values ('probar')")).rejects.toThrow(
      /row-level security/,
    );
    await expect(
      como(db, ANA, "insert into public.eventos_xp (perfil_id, motivo) values ($1, 'entrar')", [BETO]),
    ).rejects.toThrow(/permission denied/);
    await expect(como(db, ANA, "delete from public.eventos_xp")).rejects.toThrow(/permission denied/);
    await expect(como(db, ANA, "update public.eventos_xp set motivo = 'probar'")).rejects.toThrow(/permission denied/);
  });
});
