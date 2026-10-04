import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { tienePerfil } from "@/auth/perfil";
import { requireUser } from "@/auth/sesion";
import { NavegacionInferior } from "@/components/NavegacionInferior";
import { configSupabase, modoDemo } from "@/supabase/config";
import { crearClienteServidor } from "@/supabase/servidor";

export default async function LayoutApp({ children }: Readonly<{ children: ReactNode }>) {
  if (!modoDemo() && configSupabase()) {
    // Con sesión pero sin perfil (se registró y todavía no usó el link de invitación): a /unirme.
    const usuario = await requireUser();
    if (!(await tienePerfil(await crearClienteServidor(), usuario.id))) redirect("/unirme");
  }
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
