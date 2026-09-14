"use client";

import { useEffect, useState } from "react";

/**
 * Barra de acción fija en móvil. Sólo aparece cuando el formulario del
 * hero ya salió de pantalla: mientras está visible, dos botones idénticos
 * pegados uno al otro se ven como un error, no como una ayuda.
 */
export function CtaFijo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("producto");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(!e.isIntersecting),
      { rootMargin: "-70% 0px 0px 0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 p-3 backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] md:hidden"
      style={{ transform: visible ? "translateY(0)" : "translateY(110%)" }}
      aria-hidden={!visible}
    >
      <a
        href="#reserva"
        tabIndex={visible ? 0 : -1}
        className="flex min-h-12 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-fg"
      >
        Apartar mi lugar
      </a>
    </div>
  );
}
