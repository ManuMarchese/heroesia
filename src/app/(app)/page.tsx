import { headers } from "next/headers";
import Link from "next/link";
import { requireUser } from "@/auth/sesion";
import { origenDelPedido } from "@/auth/validacion";
import { BotonCopiarResumen } from "@/components/BotonCopiarResumen";
import { EstadoVacio } from "@/components/EstadoVacio";
import { FormularioMision } from "@/components/FormularioMision";
import { Marca } from "@/components/Marca";
import estilos from "@/components/Pantallas.module.css";
import { ListaAportes } from "@/components/TarjetaAporte";
import { TarjetaHeroe } from "@/components/TarjetaHeroe";
import { TarjetaMision } from "@/components/TarjetaMision";
import { obtenerRepositorio } from "@/data";
import { abrirInicio, cargarCarpetas } from "@/vista/cargar";

/** Base del héroe (U1, D12): tu nivel y récord, la misión del equipo y lo nuevo. */
export default async function PaginaInicio() {
  const usuario = await requireUser();
  const repo = await obtenerRepositorio(usuario.id);
  const base = await abrirInicio(repo, () => new Date(), origenDelPedido(await headers()));
  const carpetas = await cargarCarpetas(repo);
  return (
    <>
      <Marca />
      <h1 className="solo-lectores">Base del héroe</h1>
      <TarjetaHeroe heroe={base.heroe} />
      {base.mision ? (
        <TarjetaMision
          mision={base.mision}
          formulario={base.mision.puedeDefinir ? <FormularioMision /> : null}
          pie={<BotonCopiarResumen texto={base.resumen} />}
        />
      ) : null}
      <div className={estilos.encabezado}>
        <h2 className="titulo-seccion">Lo nuevo</h2>
        <Link href="/explorar" className={estilos.verTodo}>
          Ver todo
        </Link>
      </div>
      {base.loNuevo.length > 0 ? (
        <ListaAportes tarjetas={base.loNuevo} carpetas={carpetas} />
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
