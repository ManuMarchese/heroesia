import type { Metadata } from "next";
import { salir } from "@/auth/acciones";
import { requireUser } from "@/auth/sesion";
import { FormularioNombre } from "@/components/FormularioNombre";
import estilos from "@/components/Pantallas.module.css";
import { TarjetaHeroe } from "@/components/TarjetaHeroe";
import { obtenerRepositorio } from "@/data";
import { diaCorto } from "@/domain/tiempo";
import { DIAS_CLASE } from "@/domain/xp-config";
import { modoDemo } from "@/supabase/config";
import { cargarPerfil } from "@/vista/cargar";

export const metadata: Metadata = { title: "Perfil" };

const numero = (n: number) => n.toLocaleString("es-AR");

/** Perfil (U5): nivel, rango, clase, récord y XP; el nombre que ve el grupo y Salir. */
export default async function PaginaPerfil() {
  const usuario = await requireUser();
  const heroe = await cargarPerfil(await obtenerRepositorio(usuario.id), new Date());
  const falta = heroe.xpDelNivel - heroe.xpEnNivel;
  return (
    <>
      <h1 className="titulo-seccion">Perfil</h1>
      <TarjetaHeroe heroe={heroe} />
      <section className="panel" aria-labelledby="titulo-progreso">
        <h2 id="titulo-progreso" className={estilos.subtitulo}>
          Tu progreso
        </h2>
        <dl className={estilos.datos}>
          <dt>Nivel</dt>
          <dd>
            {heroe.nivel} · te faltan {numero(falta)} XP para el {heroe.nivel + 1}
          </dd>
          <dt>Rango</dt>
          <dd>{heroe.rango}</dd>
          <dt>Clase</dt>
          <dd>
            {heroe.clase ?? "Sin clase todavía"}: sale de lo que más XP te dio en los últimos {DIAS_CLASE} días.
          </dd>
          <dt>XP total</dt>
          <dd>{numero(heroe.xpTotal)} XP</dd>
          <dt>Récord</dt>
          <dd>
            {heroe.record > 0 && heroe.semanaRecord
              ? `${heroe.record === 1 ? "1 prueba" : `${heroe.record} pruebas`} en la semana del ${diaCorto(heroe.semanaRecord)}`
              : "Todavía no probaste nada: tu primer Lo probé marca el récord."}
            {heroe.esNuevoRecord ? " · ¡Nuevo récord esta semana!" : ""}
          </dd>
        </dl>
      </section>
      <section className="panel" aria-labelledby="titulo-nombre">
        <h2 id="titulo-nombre" className={estilos.subtitulo}>
          Tu nombre
        </h2>
        <FormularioNombre nombre={heroe.nombre} />
      </section>
      <section className="panel" aria-labelledby="titulo-cuenta">
        <h2 id="titulo-cuenta" className={estilos.subtitulo}>
          Tu cuenta
        </h2>
        {usuario.email ? <p className="texto-meta">Entraste como {usuario.email}</p> : null}
        {modoDemo() ? (
          <p className="texto-meta">En el modo demostración no hace falta salir.</p>
        ) : (
          <form action={salir}>
            <button type="submit" className="boton">
              Salir
            </button>
          </form>
        )}
      </section>
    </>
  );
}
