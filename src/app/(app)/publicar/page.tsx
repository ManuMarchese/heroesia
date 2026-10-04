import type { Metadata } from "next";
import { requireUser } from "@/auth/sesion";
import { FormularioPublicar } from "@/components/FormularioPublicar";
import { esTipoAporte } from "@/domain/aportes";
import { diaLocal } from "@/domain/tiempo";

export const metadata: Metadata = { title: "Publicar" };

type Parametros = Promise<Record<string, string | string[] | undefined>>;

/** Publicar (U2). Desde un estado vacío de Explorar llega con el tipo ya elegido (?tipo=). */
export default async function PaginaPublicar({ searchParams }: { searchParams: Parametros }) {
  await requireUser();
  const pedido = (await searchParams).tipo;
  const valor = Array.isArray(pedido) ? pedido[0] : pedido;
  return (
    <>
      <h1 className="titulo-seccion">Publicar</h1>
      <section className="panel" aria-label="Nuevo aporte">
        <FormularioPublicar tipoInicial={valor && esTipoAporte(valor) ? valor : null} hoy={diaLocal(new Date())} />
      </section>
    </>
  );
}
