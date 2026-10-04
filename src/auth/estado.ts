// Estado del formulario de /entrar (va del servidor al cliente).

export interface EstadoEntrar {
  paso: "email" | "codigo";
  email: string;
  /** A dónde ir después de entrar (ruta interna). */
  destino: string;
  aviso: string | null;
  error: string | null;
}

export function estadoInicialEntrar(destino = "/", error: string | null = null): EstadoEntrar {
  return { paso: "email", email: "", destino, aviso: null, error };
}
