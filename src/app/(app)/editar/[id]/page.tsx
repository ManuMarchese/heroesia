import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/sesion";
import { FormularioEditar } from "@/components/FormularioEditar";
import { obtenerRepositorio } from "@/data";
import { diaLocal } from "@/domain/tiempo";

export const metadata: Metadata = { title: "Editar" };

/** Editar un aporte propio (D43). Si no existe o no es tuyo, vuelve al inicio (la base también lo impide). */
export default async function PaginaEditar({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await requireUser();
  const { id } = await params;
  const aporte = await (await obtenerRepositorio(usuario.id)).aporte(id);
  if (!aporte || aporte.autorId !== usuario.id) redirect("/");
  return (
    <>
      <h1 className="titulo-seccion">Editar</h1>
      <section className="panel" aria-label="Editar aporte">
        <FormularioEditar
          aporteId={aporte.id}
          hoy={diaLocal(new Date())}
          inicial={{
            tipo: aporte.tipo,
            link: aporte.link,
            titulo: aporte.titulo,
            porQueSirve: aporte.porQueSirve,
            imagenUrl: aporte.imagenUrl ?? "",
            comoSeUsa: aporte.comoSeUsa ?? "",
            fuente: aporte.fuente ?? "",
            fechaLimite: aporte.fechaLimite ?? "",
            queMirar: aporte.queMirar ?? "",
          }}
        />
      </section>
    </>
  );
}
