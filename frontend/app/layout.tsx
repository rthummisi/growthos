import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@frontend/components/layout/Nav";

export const metadata: Metadata = {
  title: "GrowthOS",
  description: "AI growth operations platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-background text-zinc-50">
          <Nav />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
