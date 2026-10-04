import type { Metadata } from "next";
import { requireUser } from "@/auth/sesion";
import { EstadoVacio } from "@/components/EstadoVacio";
import { SelectorTipo } from "@/components/SelectorTipo";
import { ListaAportes } from "@/components/TarjetaAporte";
import { obtenerRepositorio } from "@/data";
import { ETIQUETA_TIPO, esTipoAporte } from "@/domain/aportes";
import type { TipoAporte } from "@/domain/tipos";
import { cargarCarpetas, cargarExplorar } from "@/vista/cargar";

export const metadata: Metadata = { title: "Explorar" };

type Parametros = Promise<Record<string, string | string[] | undefined>>;

const VACIO: Record<TipoAporte, { titulo: string; texto: string }> = {
  skill: { titulo: "Todavía no hay skills", texto: "Sumá la primera: algo que usás con IA y le sirve al grupo." },
  repo: { titulo: "Todavía no hay repos", texto: "Sumá el primero: un repo que te haya ahorrado trabajo." },
  noticia: { titulo: "Todavía no hay noticias", texto: "Sumá la primera: algo que pasó y conviene leer." },
  oportunidad: {
    titulo: "Todavía no hay oportunidades",
    texto: "Sumá la primera: una beca, un trabajo o un hackathon, con su fecha límite.",
  },
  proyecto: { titulo: "Todavía no hay proyectos", texto: "Sumá el tuyo y contá qué querés que miren." },
};

/** Explorar (U4): aportes por tipo, del más nuevo al más viejo, sin búsqueda de texto. */
export default async function PaginaExplorar({ searchParams }: { searchParams: Parametros }) {
  const usuario = await requireUser();
  const pedido = (await searchParams).tipo;
  const valor = Array.isArray(pedido) ? pedido[0] : pedido;
  const tipo: TipoAporte = valor && esTipoAporte(valor) ? valor : "skill";
  const repo = await obtenerRepositorio(usuario.id);
  const tarjetas = await cargarExplorar(repo, tipo, new Date());
  const carpetas = await cargarCarpetas(repo);
  return (
    <>
      <h1 className="titulo-seccion">Explorar</h1>
      <SelectorTipo actual={tipo} />
      <h2 className="solo-lectores">{ETIQUETA_TIPO[tipo]}</h2>
      {tarjetas.length > 0 ? (
        <ListaAportes tarjetas={tarjetas} carpetas={carpetas} />
      ) : (
        <EstadoVacio titulo={VACIO[tipo].titulo} texto={VACIO[tipo].texto} href={`/publicar?tipo=${tipo}`} />
      )}
    </>
  );
}
