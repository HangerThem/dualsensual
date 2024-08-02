import type { Metadata } from "next";
import { K2D } from "next/font/google";
import "@/styles/globals.css";

const k2d = K2D({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DualSensual",
  description: "DualSensual is a gamepad vibration testing tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="love-language">
      <body className={k2d.className}>{children}</body>
    </html>
  );
}
