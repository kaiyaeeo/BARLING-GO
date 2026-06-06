  import type { Metadata } from "next";
  import { Inter, Geist } from "next/font/google";
  import "./globals.css";
  import Navbar from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

  const inter = Inter({ subsets: ["latin"] });

  export const metadata: Metadata = {
    title: "Barling-GO | E-Commerce Wisata & UMKM",
    description: "Platform digital pariwisata dan UMKM wilayah Barlingmascakep",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="id" className={cn("font-sans", geist.variable)}>
        <body className={inter.className}>
          <Navbar />
          {/* Children adalah isi dari halaman yang sedang dibuka */}
          <div className="min-h-screen bg-gray-50">
            {children} 
          </div>
        </body>
      </html>
    );
  }