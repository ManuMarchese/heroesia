import type { ReactNode } from "react";
import { NavegacionInferior } from "@/components/NavegacionInferior";
import { modoDemo } from "@/supabase/config";

export default function LayoutApp({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <main className="pantalla pantalla--con-nav">
        {modoDemo() ? (
          <p className="aviso-demo" role="note">
            Modo demostración: datos de ejemplo en memoria, sin Supabase.
          </p>
        ) : null}
        {children}
      </main>
      <NavegacionInferior />
    </>
  );
}
