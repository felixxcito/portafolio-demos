import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Impulso",
  description: "El lanzamiento que estabas esperando.",
};

export const viewport: Viewport = { themeColor: "#080a14" };

export default function ImpulsoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-site="impulso" className="bg-bg text-fg">
      {children}
    </div>
  );
}
