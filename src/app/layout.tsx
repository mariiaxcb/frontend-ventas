import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast"; // 👈 Cambiado a react-hot-toast

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TikTok Live Sales Manager",
  description: "Gestión automatizada de ventas en TikTok Live",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
          {/* Estilos oscuros ajustados para coincidir con tu app */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0f172a", // slate-900
                color: "#fff",
                border: "1px solid #1e293b", // slate-800
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}