import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-brand-dark font-sans text-slate-100">
      {/* Navbar Superior con h-20 (5rem) */}
      <Navbar />

      {/* Contenedor inferior sin desbordamiento global */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Único contenedor con Scroll en el contenido */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}