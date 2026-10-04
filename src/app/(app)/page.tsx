import Link from "next/link";
import { requireUser } from "@/auth/sesion";
import { EstadoVacio } from "@/components/EstadoVacio";
import { Icono } from "@/components/Icono";
import { Marca } from "@/components/Marca";
import estilos from "@/components/Pantallas.module.css";
import { ListaAportes } from "@/components/TarjetaAporte";
import { TarjetaHeroe } from "@/components/TarjetaHeroe";
import { TarjetaMision } from "@/components/TarjetaMision";
import { obtenerRepositorio } from "@/data";
import { abrirInicio } from "@/vista/cargar";

/** Base del héroe (U1, D12): tu nivel y récord, la misión del equipo y lo nuevo. */
export default async function PaginaInicio() {
  const usuario = await requireUser();
  const base = await abrirInicio(await obtenerRepositorio(usuario.id), new Date());
  return (
    <>
      <Marca />
      <h1 className="solo-lectores">Base del héroe</h1>
      <TarjetaHeroe heroe={base.heroe} />
      {base.mision ? (
        <TarjetaMision
          mision={base.mision}
          pie={
            <button type="button" className="boton" disabled>
              <Icono nombre="copiar" tam={18} />
              Copiar resumen
            </button>
          }
        />
      ) : null}
      <div className={estilos.encabezado}>
        <h2 className="titulo-seccion">Lo nuevo</h2>
        <Link href="/explorar" className={estilos.verTodo}>
          Ver todo
        </Link>
      </div>
      {base.loNuevo.length > 0 ? (
        <ListaAportes tarjetas={base.loNuevo} />
      ) : (
        <EstadoVacio
          titulo="Todavía no hay aportes"
          texto="Arrancá vos: pegá un link que te haya servido (una skill, un repo, una noticia, una oportunidad o tu proyecto) y contá en una línea por qué sirve."
          href="/publicar"
        />
      )}
    </>
  );
}
