import Link from "next/link";
import estilos from "./Pantallas.module.css";

/** Estado vacío con un llamado a sumar el primer aporte (D24). */
export function EstadoVacio({ titulo, texto, href }: { titulo: string; texto: string; href: string }) {
  return (
    <section className="panel" aria-labelledby="titulo-vacio">
      <h2 id="titulo-vacio" className={estilos.subtitulo}>
        {titulo}
      </h2>
      <p className={estilos.texto}>{texto}</p>
      <Link href={href} className="boton boton--primario">
        Sumar el primer aporte
      </Link>
    </section>
  );
}
