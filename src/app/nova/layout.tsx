import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Nova",
  description: "Estudio creativo independiente.",
};

export const viewport: Viewport = { themeColor: "#08080a" };

export default function NovaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-site="nova" className="bg-bg text-fg">
      {children}
    </div>
  );
}
