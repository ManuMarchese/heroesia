import { Icono } from "./Icono";
import estilos from "./Marca.module.css";

export function Marca() {
  return (
    <div className={estilos.marca}>
      <span className={estilos.logo}>
        <Icono nombre="escudo" tam={22} />
      </span>
      <span className={estilos.texto}>Heroes IA</span>
    </div>
  );
}
