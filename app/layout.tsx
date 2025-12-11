// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import Providers from "./Provider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MyApp",
  description: "Role-based navbar with Jotai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
