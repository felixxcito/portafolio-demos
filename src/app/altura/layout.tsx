import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Altura",
  description: "Residencias de autor.",
};

export const viewport: Viewport = { themeColor: "#f8f6f2" };

export default function AlturaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-site="altura" className="bg-bg text-fg">
      {children}
    </div>
  );
}
